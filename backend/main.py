from fastapi import FastAPI, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from database import get_db_connection
from typing import Optional

app = FastAPI(title="Inflation Monitor API")

# Frontend'den gelen isteklere izin ver (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Geliştirme aşamasında her şeye izin veriyoruz
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/categories")
def get_categories():
    """
    Veritabanından benzersiz ürün kategorilerini getirir.
    """
    conn = get_db_connection()
    if not conn:
        return []
        
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT DISTINCT category FROM prices WHERE category IS NOT NULL ORDER BY category")
        results = cursor.fetchall()
        # tuples (category,) listesinden string listesine çevir
        return [row[0] for row in results]
    except Exception as e:
        print(f"Kategoriler çekilirken hata oluştu: {e}")
        return []
    finally:
        conn.close()

# Kategori bazlı hariç tutulacak kelimeler (product_name içinde)
CATEGORY_EXCLUSIONS = {
    "Yumurta": ["%sürpriz%", "%çikolata%", "%şeker%", "%organizer%"],
    # İleride diğer kategoriler için de buraya ekleme yapabilirsiniz.
    # Örn: "Süt": ["%laktozsuz%"] vb.
}

@app.get("/api/inflation-data")
def get_inflation_data(
    category: Optional[str] = Query("Süt"),
    time_range: Optional[str] = Query("6m")
):
    """
    Seçilen teoriye göre iki ayrı veri seti döner: 
      - chartData: Günlük Fiyat Noktaları (YYYY-MM-DD)
      - tableData: Aylık Özet Ortalamaları (YYYY-MM)
    """
    conn = get_db_connection()
    if not conn:
        return {"chartData": [], "tableData": []}

    interval_str = "6 months"
    if time_range == "3m":
        interval_str = "3 months"
    elif time_range == "1y":
        interval_str = "1 year"
    elif time_range == "all":
        interval_str = "100 years"

    # Ortak WHERE kuralları ve parametreler
    base_where = "WHERE category = %s AND date >= CURRENT_DATE - INTERVAL '%s'"
    params = [category, interval_str]

    if category in CATEGORY_EXCLUSIONS:
        for word in CATEGORY_EXCLUSIONS[category]:
            base_where += " AND LOWER(product_name) NOT LIKE %s"
            params.append(word)

    # 1. Günlük Veriler (Çizgi Grafik İçin)
    daily_query = f"""
        SELECT 
            TO_CHAR(date, 'YYYY-MM-DD') as date_str,
            AVG(price) as avg_price
        FROM prices
        {base_where}
        GROUP BY TO_CHAR(date, 'YYYY-MM-DD')
        ORDER BY date_str ASC
    """

    # 2. Aylık Veriler (Tablo İçin)
    monthly_query = f"""
        SELECT 
            TO_CHAR(date, 'YYYY-MM') as month_str,
            AVG(price) as avg_price
        FROM prices
        {base_where}
        GROUP BY TO_CHAR(date, 'YYYY-MM')
        ORDER BY month_str ASC
    """

    try:
        from psycopg2.extras import RealDictCursor
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Interval'ı format parametresiyle (%s) verdiğimiz için güvenli string yerine SQL interpolation yerine query build yaptık ama psycopg2 interval str için direk format kullanabiliriz:
        # Ancak yukarıda INTERVAL '{interval_str}' string injection kullanmıştık. Parametrelere eklemeyelim, string formata dönelim:

        interval_clause = interval_str  # "6 months"

        base_where_safe = f"WHERE category = %s AND date >= CURRENT_DATE - INTERVAL '{interval_clause}'"
        safe_params = [category]
        if category in CATEGORY_EXCLUSIONS:
            for word in CATEGORY_EXCLUSIONS[category]:
                base_where_safe += " AND LOWER(product_name) NOT LIKE %s"
                safe_params.append(word)

        daily_query_safe = f"""
            SELECT 
                TO_CHAR(date, 'YYYY-MM-DD') as date_str,
                AVG(price) as avg_price
            FROM prices
            {base_where_safe}
            GROUP BY TO_CHAR(date, 'YYYY-MM-DD')
            ORDER BY date_str ASC
        """
        cursor.execute(daily_query_safe, tuple(safe_params))
        daily_results = cursor.fetchall()

        monthly_query_safe = f"""
            SELECT 
                TO_CHAR(date, 'YYYY-MM') as month_str,
                AVG(price) as avg_price
            FROM prices
            {base_where_safe}
            GROUP BY TO_CHAR(date, 'YYYY-MM')
            ORDER BY month_str ASC
        """
        cursor.execute(monthly_query_safe, tuple(safe_params))
        monthly_results = cursor.fetchall()

    except Exception as e:
        print(f"Sorgu hatası: {e}")
        return {"chartData": [], "tableData": []}
    finally:
        conn.close()

    tr_months = {
        "01": "Oca", "02": "Şub", "03": "Mar", "04": "Nis", 
        "05": "May", "06": "Haz", "07": "Tem", "08": "Ağu",
        "09": "Eyl", "10": "Eki", "11": "Kas", "12": "Ara"
    }

    # ÇİZGİ GRAFİK (GÜNLÜK) HESAPLAMA
    chart_data = []
    for row in daily_results:
        date_str = row["date_str"]  # YYYY-MM-DD
        year, month_num, day = date_str.split("-")
        month_name = tr_months.get(month_num, month_num)
        
        full_date_label = f"{day} {month_name} '{year[-2:]}" # 23 Mar '26 (Tooltip İçin)
        month_year_label = f"{month_name} {year}" # Mar 2026 (X Ekseninde Göstermek İçin Merkezleme)

        avg_price = float(row["avg_price"]) if row["avg_price"] else 0.0

        chart_data.append({
            "fullDate": full_date_label,
            "monthYear": month_year_label,
            "price": round(avg_price, 2)
        })

    # TABLO (AYLIK) HESAPLAMA
    table_data = []
    prev_price = None

    for row in monthly_results:
        month_str = row["month_str"] # YYYY-MM
        year, month_num = month_str.split("-")
        month_name = f"{tr_months.get(month_num, month_num)} '{year[-2:]}"

        avg_price = float(row["avg_price"]) if row["avg_price"] else 0.0

        increase_pct = 0.0
        if prev_price is not None and prev_price > 0:
            increase_pct = ((avg_price - prev_price) / prev_price) * 100

        table_data.append({
            "month": month_name,
            "avgPrice": round(avg_price, 2),
            "increasePct": round(increase_pct, 2) if prev_price is not None else 0.0
        })
        prev_price = avg_price

    # Tabloyu en sondan başa (en güncelden eskiye) dizeleyelim
    table_data.reverse()

    return {
        "chartData": chart_data,
        "tableData": table_data
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
