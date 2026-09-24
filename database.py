import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import DATABASE_URL

logger = logging.getLogger("buspass")

db_url = DATABASE_URL
connect_args = {}

if "sqlite" in db_url:
    connect_args = {"check_same_thread": False}

# Attempt connection to configured PostgreSQL/Supabase database
try:
    engine = create_engine(db_url, connect_args=connect_args, pool_pre_ping=True)
    with engine.connect() as conn:
        pass
    print(f"[DATABASE] Successfully connected to database: {db_url.split('@')[-1] if '@' in db_url else db_url}")
except Exception as e:
    # If Supabase/PostgreSQL is offline or credentials haven't been provided yet,
    # gracefully fall back to local SQLite to ensure the diploma project never crashes during demo/viva.
    print(f"[DATABASE WARNING] Could not connect to PostgreSQL/Supabase ({e}).")
    print("[DATABASE INFO] Falling back to local SQLite database (buspass.db) for reliable offline testing and viva demonstration.")
    db_url = "sqlite:///./buspass.db"
    engine = create_engine(db_url, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
