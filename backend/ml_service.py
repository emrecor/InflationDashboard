import pandas as pd
from prophet import Prophet
from database import get_db_connection
from datetime import datetime, timedelta
from main import CUSTOM_CATEGORIES, get_categories
import evds

def get_evds_data(days_back=180):
    API_KEY = "WKGVdDYfkC"
    try:
        evds_api = evds.evdsAPI(API_KEY)
        end_date = datetime.now().strftime("%d-%m-%Y")
        start_date = (datetime.now() - timedelta(days=days_back)).strftime("%d-%m-%Y")
        data = evds_api.get_data(['TP.DK.USD.S.YTL'], startdate=start_date, enddate=end_date)
        
        # Sütunları düzenle
        data.rename(columns={'Tarih': 'ds', 'TP_DK_USD_S_YTL': 'usd_try'}, inplace=True)
        data['ds'] = pd.to_datetime(data['ds'], format="%d-%m-%Y")
        
        # Boş (haftasonu) günleri kendinden önceki en yakın olanla doldur
        data['usd_try'] = pd.to_numeric(data['usd_try'], errors='coerce')
        data['usd_try'] = data['usd_try'].ffill().bfill()
        return data[['ds', 'usd_try']]
    except Exception as e:
        print("EVDS verisi çekilemedi:", e)
        return None

def train_and_predict_for_category(category: str, evds_df: pd.DataFrame = None, days_to_predict: int = 30):
    conn = get_db_connection()
    if not conn:
        print(f"[{category}] Veritabanı bağlantısı yok.")
        return False

    # Geçmiş veriyi çek (main.py ile aynı filtreleme mantığı)
    interval_clause = "100 years"
    
    if category in CUSTOM_CATEGORIES:
        custom_def = CUSTOM_CATEGORIES[category]
        base_cat = custom_def.get("base_category")
        exclusions = custom_def.get("exclusions", [])
        includes = custom_def.get("includes", [])
        any_includes = custom_def.get("any_includes", [])
        price_expr = custom_def.get("price_expression", "price")
        
        where_clause = f"WHERE date >= CURRENT_DATE - INTERVAL '{interval_clause}'"
        params = []
        
        if base_cat:
            where_clause += " AND category = %s"
            params.append(base_cat)
        
        for inc in includes:
            where_clause += " AND LOWER(product_name) LIKE %s"
            params.append(f"%{inc.lower()}%")
            
        if any_includes:
            include_clauses = " OR ".join(["LOWER(product_name) LIKE %s" for _ in any_includes])
            where_clause += f" AND ({include_clauses})"
            for inc in any_includes:
                params.append(f"%{inc.lower()}%")
            
        for excl in exclusions:
            where_clause += " AND LOWER(product_name) NOT LIKE %s"
            params.append(f"%{excl.lower()}%")
    else:
        where_clause = f"WHERE category = %s AND date >= CURRENT_DATE - INTERVAL '{interval_clause}'"
        params = [category]
        price_expr = "price"

    try:
        query = f"SELECT date as ds, AVG({price_expr}) as y FROM prices {where_clause} GROUP BY date ORDER BY date ASC"
        df = pd.read_sql(query, conn, params=tuple(params))
        
        if df.empty or len(df) < 14:
            print(f"[{category}] Yeterli veri yok (Satır sayısı: {len(df)}). Tahmin atlandı.")
            return False
            
        print(f"[{category}] Model eğitiliyor... ({len(df)} gün veri)")
        
        # DataFrame formatını Prophet'in beklediği şekle (ds, y) getir.
        df['ds'] = pd.to_datetime(df['ds'])
        
        if evds_df is not None:
            df = pd.merge(df, evds_df, on='ds', how='left')
            df['usd_try'] = df['usd_try'].ffill().bfill()
        
        # Orijinal Prophet parametreleri
        m = Prophet(
            daily_seasonality=False, 
            yearly_seasonality=False,
            weekly_seasonality=True,
            changepoint_prior_scale=0.05
        )
        
        if evds_df is not None:
            m.add_regressor('usd_try')
        
        m.fit(df)
        
        # Gelecekteki günleri oluştur
        future = m.make_future_dataframe(periods=days_to_predict, freq='D')
        
        if evds_df is not None:
            future = pd.merge(future, evds_df, on='ds', how='left')
            # Gelecek günler için son Dolar kurunu (flat line) ileri sararak doldur
            future['usd_try'] = future['usd_try'].ffill()
            
        forecast = m.predict(future)
        
        # Sadece geleceğe ait olanları filtrele
        last_date = df['ds'].max()
        future_forecast = forecast[forecast['ds'] > last_date]
        
        # Veritabanına kaydet (Kısıtlamalar kaldırıldı)
        with conn.cursor() as cur:
            for _, row in future_forecast.iterrows():
                cur.execute("""
                    INSERT INTO predictions (category, date, predicted_price, lower_bound, upper_bound)
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (category, date) 
                    DO UPDATE SET 
                        predicted_price = EXCLUDED.predicted_price,
                        lower_bound = EXCLUDED.lower_bound,
                        upper_bound = EXCLUDED.upper_bound
                """, (
                    category, 
                    row['ds'].date(), 
                    round(float(row['yhat']), 2), 
                    round(float(row['yhat_lower']), 2), 
                    round(float(row['yhat_upper']), 2)
                ))
            conn.commit()
            
        print(f"🚀 [{category}] tahmin kaydedildi!")
        return True
    except Exception as e:
        print(f"❌ [{category}] tahmin hatası: {e}")
        return False
    finally:
        if conn:
            conn.close()
            
def predict_all_categories():
    categories = get_categories()
            
    if not categories:
        print("Tahmin yapılacak kategori bulunamadı.")
        return
        
    print("EVDS üzerinden Dolar kuru çekiliyor...")
    evds_df = get_evds_data(180)
        
    print(f"Toplam {len(categories)} kategori için tahmin süreci başlıyor...")
    for cat in categories:
        train_and_predict_for_category(cat, evds_df=evds_df, days_to_predict=30)
    print("✅ Tüm kategorilerin tahmin işlemi tamamlandı!")

if __name__ == "__main__":
    predict_all_categories()
