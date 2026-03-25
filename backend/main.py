from fastapi import FastAPI, Query 
from fastapi.middleware.cors import CORSMiddleware
from database import get_db_connection
from typing import Optional
from psycopg2.extras import RealDictCursor
import uvicorn

app = FastAPI(title="Inflation Monitor API")

# Frontend'den gelen isteklere izin ver (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



CUSTOM_CATEGORIES = {
    "Pirinç (1 KG)": {
        "base_category": "Bakliyat",
        "exclusions": [
            "tohum", "chia", "kinoa", "amarant", "karabuğday", "greçka",
            "5 kg", "2 kg", "2,5 kg", "500 g", "800 g", "750 g", "5000 g", "2000 g", "2500 g",
            "fit", "sebzeli", "domatesli", "biberli", "karışık", "patlayan", "cin mısır",
            "mikrodalga", "maş", "beluga", "iç bakla", "börülce", "bulgur", "fasulye",
            "mercimek", "buğday", "bombay", "nohut", "barbunya", "organik", "bio"
        ]
    },
    "Ayçiçek Yağı (5L)": {
        "base_category": "Ayçiçek Yağı",
        "includes": ["Ayçiçek", " 5 L"]
    },
    "Yumurta (30'lu)": {
        "includes": ["30'lu", "Yumurta"]
    },
    "Dana Kıyma (1 KG)": {
        "base_category": "Dana Eti",
        "includes": ["kıyma", "Kg"],
        "exclusions": ["Köfte", "Döner", "Piliç", "dondurulmuş"]
    },
    "Dana Kuşbaşı (400 G)": {
        "base_category": "Dana Eti",
        "includes": ["Kuşbaşı", " 400 "],
        "exclusions": ["Piliç"]
    },
    "Bebek Bezi (4 No / Maxi)": {
        "base_category": "Bebek Bezi",
        "includes": ["4 Beden", "4 No", "Maxi"],
        "exclusions": ["4+"],
        "price_expression": "price / NULLIF(CAST(SUBSTRING(product_name FROM '([0-9]+)\\s*(?:Adet|Ad\\.|''l[ıiüu])') AS NUMERIC), 0)"
    },
    "Süt (1 L)": {
        "base_category": "Süt",
        "includes": ["1 L", "1L", "1 Lt", "1000 Ml"],
        "exclusions": [
            "x", "X", "organik", "probiyotik", "Badem", "Yulaf", "Hindistan Cevizi", 
            "Fındık", "Bitkisel", "İçecek", "İçeceği", "Kakaolu", "Çikolata", 
            "Muzlu", "Çilekli", "Karamel", "Vanilya", "Latte", "Mocha", 
            "Macchiato", "Milkshake", "Salep", "Dondurma", "Çocuk", "Devam", 
            "Kido", "Milkino", "Miniki", "İçimino", "Protein", "Keçi"
        ]
    }
}

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
        
        # Orijinal kategoriler
        all_categories = [row[0] for row in results]
        
        # Gizlenecek (Base) kategorileri topla (CUSTOM_CATEGORIES içinde base_category olarak tanımlananlar)
        base_categories = {v.get("base_category") for v in CUSTOM_CATEGORIES.values() if v.get("base_category")}
        
        # Filtrele: Base olmayanları koru
        categories = [cat for cat in all_categories if cat not in base_categories]
        
        # Özel kategorileri ekle
        for custom_cat in CUSTOM_CATEGORIES.keys():
            if custom_cat not in categories:
                categories.append(custom_cat)
        
        return sorted(categories)
    except Exception as e:
        print(f"Kategoriler çekilirken hata oluştu: {e}")
        return []
    finally:
        conn.close()


@app.get("/api/inflation-data")
def get_inflation_data(
    category: Optional[str] = Query("Süt"),
    time_range: Optional[str] = Query("all")
):
    """
    İki ayrı veri seti döner: 
      - chartData: Günlük Fiyat Noktaları
      - tableData: Aylık Özet Ortalamaları
    """
    conn = get_db_connection()
    if not conn:
        return {"chartData": [], "tableData": []}

    # Zaman aralığı belirleme
    interval_mapping = {
        "3m": "3 months",
        "6m": "6 months",
        "1y": "1 year",
        "all": "100 years"
    }
    # Ensure time_range is not None for Pyre compatibility
    safe_range: str = time_range if time_range is not None else "all"
    interval_clause = interval_mapping.get(safe_range, "100 years")

    # Filtreleri oluşturma
    safe_category: str = category if category is not None else ""
    
    if safe_category in CUSTOM_CATEGORIES:
        custom_def = CUSTOM_CATEGORIES[safe_category]
        base_cat = custom_def.get("base_category")
        exclusions = custom_def.get("exclusions", [])
        includes = custom_def.get("includes", [])
        price_expr = custom_def.get("price_expression", "price")
        
        where_clause = f"WHERE date >= CURRENT_DATE - INTERVAL '{interval_clause}'"
        params = []
        
        if base_cat:
            where_clause += " AND category = %s"
            params.append(base_cat)
        
        if includes:
            include_clauses = " OR ".join(["LOWER(product_name) LIKE %s" for _ in includes])
            where_clause += f" AND ({include_clauses})"
            for inc in includes:
                params.append(f"%{inc.lower()}%")
            
        for excl in exclusions:
            where_clause += " AND LOWER(product_name) NOT LIKE %s"
            params.append(f"%{excl.lower()}%")
    else:
        where_clause = f"WHERE category = %s AND date >= CURRENT_DATE - INTERVAL '{interval_clause}'"
        params = [category]
        price_expr = "price"

    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # 1. Günlük Veriler (Grafik İçin)
        cursor.execute(f"""
            SELECT TO_CHAR(date, 'YYYY-MM-DD') as date_str, AVG({price_expr}) as avg_price
            FROM prices {where_clause}
            GROUP BY TO_CHAR(date, 'YYYY-MM-DD')
            ORDER BY date_str ASC
        """, tuple(params))
        daily_results = cursor.fetchall()

        # 2. Aylık Veriler (Tablo İçin)
        cursor.execute(f"""
            SELECT TO_CHAR(date, 'YYYY-MM') as month_str, 
                   AVG({price_expr}) as avg_price
            FROM prices {where_clause}
            GROUP BY TO_CHAR(date, 'YYYY-MM')
            ORDER BY month_str ASC
        """, tuple(params))
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

    # Grafik Verisi Formatlama
    chart_data = []
    for row in daily_results:
        date_str = row["date_str"]  # YYYY-MM-DD
        year, month_num, day = date_str.split("-")
        month_name = tr_months.get(month_num, month_num)
        
        # Ensure price is a float for round()
        raw_price = row.get("avg_price")
        avg_price_val: float = float(raw_price) if raw_price is not None else 0.0
        
        chart_data.append({
            "fullDate": f"{day} {month_name} '{year[-2:]}",
            "monthYear": f"{month_name} {year}",
            "price": round(avg_price_val, 2)
        })

    # Tablo Verisi Formatlama
    table_data = []
    prev_price_val: Optional[float] = None
    
    for row in monthly_results:
        month_str = row["month_str"] # YYYY-MM
        year, month_num = month_str.split("-")
        month_name = f"{tr_months.get(month_num, month_num)} {year}"
        
        raw_avg = row.get("avg_price")
        avg_price: float = float(raw_avg) if raw_avg is not None else 0.0

        increase_pct: float = 0.0
        if prev_price_val is not None and prev_price_val > 0:
            increase_pct = ((avg_price - prev_price_val) / prev_price_val) * 100

        table_data.append({
            "month": month_name,
            "avgPrice": round(avg_price, 2),
            "increasePct": round(increase_pct, 2)
        })
        prev_price_val = avg_price

    table_data.reverse()

    return {
        "chartData": chart_data,
        "tableData": table_data
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
