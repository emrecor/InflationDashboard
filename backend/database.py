import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def get_db_connection():
    """
    PostgreSQL'e bağlanır ve bir connection nesnesi döner.
    Kullanım sonrası connection'ın kapatılması önemlidir.
    """
    try:
         # TODO: Gerçek kimlik bilgileriyle veya .env ile bağlantı dizesini ayarlayın.
         if not DATABASE_URL or "user:password" in DATABASE_URL:
             print("Uyarı: DATABASE_URL varsayılan değerde. Lütfen kendi veritabanı bilgilerinizi giriniz.")
             return None

         conn = psycopg2.connect(DATABASE_URL)
         return conn
    except Exception as e:
         print(f"Veritabanı bağlantı hatası: {e}")
         return None
