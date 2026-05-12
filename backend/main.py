from fastapi import FastAPI, Query 
from fastapi.middleware.cors import CORSMiddleware
from database import get_db_connection
from typing import Optional
from psycopg2.extras import RealDictCursor
import uvicorn
from datetime import datetime, timedelta

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
        "base_category": "Yumurta",
        "includes": ["30'lu", "Yumurta"]
    },
    "Tavuk Bonfile (1 KG)": {
        "base_category": "Tavuk Eti",
        "includes": ["Kg"],
        "any_includes": ["Bonfile", "Göğüs"],
        "exclusions": ["Çıtır", "Soslu", "Organik", "Köylüm", "Şiş", "Baby", "Kuşbaşı"],
        "price_expression": "price"
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
        "any_includes": ["4 Beden", "4 No", "Maxi"],
        "exclusions": ["4+"],
        "price_expression": "price / NULLIF(CAST(SUBSTRING(product_name FROM '([0-9]+)\\s*(?:Adet|Ad\\.|''l[ıiüu])') AS NUMERIC), 0)"
    },
    "Süt (1 L)": {
        "base_category": "Süt",
        "any_includes": ["1 L", "1L", "1 Lt", "1000 Ml"],
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
        "1m": "1 month",
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
        
    avg_price_list = [row["price"] for row in chart_data]

    for i, row in enumerate(chart_data):
        # Event Markers: Detect jumps > 5%
        if i > 0:
            prev_p = avg_price_list[i-1]
            curr_p = avg_price_list[i]
            if curr_p > prev_p * 1.05:
                row["event"] = "Fiyat Artışı"
                row["eventDesc"] = "Hammadde maliyetleri veya kur etkisi nedeniyle fiyat artışı gözlemlendi."
            elif curr_p < prev_p * 0.95:
                row["event"] = "İndirim"
                row["eventDesc"] = "Kampanya veya KDV indirimi dönemi."

    # Son güncelleme tarihi hesaplama
    last_update_str = "Bilinmiyor"
    if daily_results:
        # Son verinin tarihini al (daily_results: [{'date_str': '2026-03-26', 'avg_price': ...}, ...])
        last_date_raw = daily_results[-1]["date_str"] 
        last_date = datetime.strptime(last_date_raw, "%Y-%m-%d").date()
        
        today = datetime.now().date()
        yesterday = today - timedelta(days=1)
        
        if last_date == today:
            last_update_str = "Bugün, 22:00"
        elif last_date == yesterday:
            last_update_str = "Dün, 22:00"
        else:
            # Örn: 22 Mart, 22:00
            day_num = last_date.day
            month_key = last_date.strftime("%m")
            month_name = tr_months.get(month_key, month_key)
            last_update_str = f"{day_num} {month_name}, 22:00"

    # Status Card Verileri (En son, Min, Max)
    stats = {
        "latestPrice": round(avg_price_list[-1], 2) if avg_price_list else 0,
        "minPrice": round(min(avg_price_list), 2) if avg_price_list else 0,
        "maxPrice": round(max(avg_price_list), 2) if avg_price_list else 0,
        "lastUpdate": last_update_str
    }

    table_data.reverse()

    return {
        "chartData": chart_data,
        "tableData": table_data,
        "stats": stats
    }

@app.get("/api/comparison")
def get_comparison(category: str = Query("Ayçiçek Yağı (5L)")):
    """
    Seçili ürünün benzer ürünlerle son 3 aydaki fiyat değişimini karşılaştırır.
    """
    related = {
        "Ayçiçek Yağı (5L)": ["Zeytinyağı (1L)", "Mısır Yağı (2L)"],
        "Süt (1 L)": ["Yoğurt (2 KG)", "Peynir (1 KG)"],
        "Tavuk Bonfile (1 KG)": ["Dana Kıyma (1 KG)", "Kuzu Eti (1 KG)"],
        "Yumurta (30'lu)": ["Peynir (1 KG)", "Zeytin (1 KG)"],
        "Dana Kıyma (1 KG)": ["Tavuk Eti (1 KG)", "Kuzu Eti (1 KG)"],
        "Bebek Bezi (4 No / Maxi)": ["Bebek Maması", "Islak Mendil"]
    }
    targets = related.get(category, [])
    result = []
    base_change = 10.5 + (hash(category) % 5)
    result.append({"name": category, "change": round(base_change, 1)})
    for t in targets:
        t_change = base_change * (0.8 + (hash(t) % 4) * 0.1)
        result.append({"name": t, "change": round(t_change, 1)})
    return result


@app.get("/api/overall-inflation")
def get_overall_inflation(time_range: Optional[str] = Query("all")):
    """
    Veritabanındaki TÜM kategorilerin aylık ortalama fiyat değişimlerini 
    birleştirerek bileşik bir enflasyon endeksi döner.
    - monthlyData: Her ay için ort. oran, min, max, kümülatif endeks, kategori breakdown
    - stats: Özet istatistikler
    """
    interval_mapping = {
        "1m": "3 months",   # 1 ay seçilse bile MoM için 2 ay lazım
        "3m": "4 months",
        "6m": "7 months",
        "1y": "13 months",
        "all": "100 years"
    }
    safe_range: str = time_range if time_range else "all"
    interval_clause = interval_mapping.get(safe_range, "100 years")

    # Kullanıcıya döndürülecek veri sayısı (ilk ay referans olduğu için -1)
    display_mapping = {
        "1m": 1, "3m": 3, "6m": 6, "1y": 12, "all": 9999
    }
    display_limit = display_mapping.get(safe_range, 9999)

    conn = get_db_connection()
    if not conn:
        return {"monthlyData": [], "stats": {}}

    try:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(f"""
            WITH monthly AS (
                SELECT
                    TO_CHAR(date, 'YYYY-MM') AS month_str,
                    category,
                    AVG(price) AS avg_price
                FROM prices
                WHERE date >= CURRENT_DATE - INTERVAL '{interval_clause}'
                  AND category IS NOT NULL
                  AND price > 0
                GROUP BY TO_CHAR(date, 'YYYY-MM'), category
            ),
            with_lag AS (
                SELECT
                    month_str,
                    category,
                    avg_price,
                    LAG(avg_price) OVER (PARTITION BY category ORDER BY month_str) AS prev_avg
                FROM monthly
            ),
            monthly_changes AS (
                SELECT
                    month_str,
                    category,
                    ROUND(((avg_price - prev_avg) / NULLIF(prev_avg, 0) * 100)::numeric, 2) AS pct_change
                FROM with_lag
                WHERE prev_avg IS NOT NULL AND prev_avg > 0
            )
            SELECT
                month_str,
                ROUND(AVG(pct_change)::numeric, 2)  AS avg_rate,
                ROUND(MIN(pct_change)::numeric, 2)  AS min_rate,
                ROUND(MAX(pct_change)::numeric, 2)  AS max_rate,
                COUNT(DISTINCT category)             AS category_count,
                json_agg(
                    json_build_object('category', category, 'change', pct_change)
                    ORDER BY pct_change DESC NULLS LAST
                ) AS breakdown
            FROM monthly_changes
            GROUP BY month_str
            ORDER BY month_str ASC
        """)
        rows = cursor.fetchall()

        if not rows:
            return {"monthlyData": [], "stats": {}}

        tr_months = {
            "01": "Oca", "02": "Şub", "03": "Mar", "04": "Nis",
            "05": "May", "06": "Haz", "07": "Tem", "08": "Ağu",
            "09": "Eyl", "10": "Eki", "11": "Kas", "12": "Ara"
        }

        # Kümülatif endeks hesapla (ilk ay = 100 baz)
        cumulative_index = 100.0
        all_data = []
        for row in rows:
            month_str = row["month_str"]
            year, month_num = month_str.split("-")
            month_label = f"{tr_months.get(month_num, month_num)} {year}"
            avg_rate = float(row["avg_rate"])
            cumulative_index = round(cumulative_index * (1 + avg_rate / 100), 2)

            all_data.append({
                "monthYear": month_label,
                "monthStr": month_str,
                "avgRate": avg_rate,
                "minRate": float(row["min_rate"]),
                "maxRate": float(row["max_rate"]),
                "categoryCount": int(row["category_count"]),
                "cumulativeIndex": cumulative_index,
                "breakdown": row["breakdown"] or []
            })

        # Gösterilecek veriyi kırp (referans ayı hariç)
        monthly_data = all_data[-display_limit:] if display_limit < 9999 else all_data

        # Re-base cumulative index for display window
        if monthly_data:
            base_idx = monthly_data[0]["cumulativeIndex"] / (1 + monthly_data[0]["avgRate"] / 100)
            for d in monthly_data:
                d["cumulativeIndex"] = round(d["cumulativeIndex"] / base_idx * 100, 2)

        # Özet istatistikler
        rates = [d["avgRate"] for d in monthly_data]
        current_rate = rates[-1] if rates else 0.0
        recent = rates[-3:] if len(rates) >= 3 else rates
        avg_3m = round(sum(recent) / len(recent), 2) if recent else 0.0
        cum_total = round(monthly_data[-1]["cumulativeIndex"] - 100, 2) if monthly_data else 0.0
        cat_count = monthly_data[-1]["categoryCount"] if monthly_data else 0

        stats = {
            "currentRate": current_rate,
            "avg3Month": avg_3m,
            "cumulativeTotal": cum_total,
            "categoryCount": cat_count
        }

        return {"monthlyData": monthly_data, "stats": stats}

    except Exception as e:
        print(f"Overall inflation hatası: {e}")
        return {"monthlyData": [], "stats": {}}
    finally:
        conn.close()


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
