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
    Kategorileri getirir.
    TODO: Bu endpoint içine kendi "SELECT DISTINCT category FROM ..." SQL'inizi yazın.
    """
    # conn = get_db_connection()
    # MOCK DATA
    return ["Yumurta", "Süt ve Süt Ürünleri", "Et Ürünleri", "Sebze", "Meyve", "Unlu Mamüller"]

@app.get("/api/inflation-data")
def get_inflation_data(
    category: Optional[str] = Query("Yumurta"),
    time_range: Optional[str] = Query("6m")
):
    """
    Seçilen kategori ve zaman aralığına göre grafik ve tablo verisi döner.
    TODO: Bu endpoint içine kendi SQL filtrelemelerinizi ("NOT LIKE" vs.) yerleştirin.
    """
    # conn = get_db_connection()
    # if conn:
    #     cursor = conn.cursor(cursor_factory=RealDictCursor)
    #     cursor.execute("SELECT ...", (category, time_range))
    #     results = cursor.fetchall()
    #     conn.close()

    # MOCK DATA FOR DEMONSTRATION
    months = ["Ağu", "Eyl", "Eki", "Kas", "Ara", "Oca", "Şub"]
    
    # Zaman aralığına göre veriyi sınırlama
    if time_range == "3m":
        months = months[-3:]
    elif time_range == "1y":
        # Gösterim amaçlı statik listemize birkaç ay daha ekliyoruz
        months = ["Mar", "Nis", "May", "Haz", "Tem"] + months
        
    chart_data = []
    table_data = []
    
    base_price = 40.0
    if category == "Süt ve Süt Ürünleri":
        base_price = 30.0
    elif category == "Et Ürünleri":
        base_price = 350.0

    current_price = base_price
    
    for i, month in enumerate(months):
        increase_pct = 2.0 + (i * 0.5) 
        if i > 0:
            current_price = current_price * (1 + (increase_pct / 100))
            
        chart_data.append({
            "month": month,
            "price": round(current_price, 2)
        })
        
        table_data.append({
            "month": month,
            "avgPrice": round(current_price, 2),
            "increasePct": round(increase_pct, 2) if i > 0 else 0.0
        })

    # Tabloyu en son ay en üstte olacak şekilde ters çevirelim
    table_data.reverse()

    return {
        "chartData": chart_data,
        "tableData": table_data
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
