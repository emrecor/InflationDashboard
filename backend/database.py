import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "postgres")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "admin")
DATABASE_URL = os.getenv("DATABASE_URL")

def get_db_connection():
    """
    PostgreSQL'e bağlanır ve bir connection nesnesi döner.
    Kullanım sonrası connection'ın kapatılması önemlidir.
    """
    try:
         if DATABASE_URL:
             conn = psycopg2.connect(DATABASE_URL)
         else:
             conn = psycopg2.connect(
                 host=DB_HOST,
                 port=DB_PORT,
                 dbname=DB_NAME,
                 user=DB_USER,
                 password=DB_PASSWORD
             )
         return conn
    except Exception as e:
         print(f"Veritabanı bağlantı hatası: {e}")
         return None
