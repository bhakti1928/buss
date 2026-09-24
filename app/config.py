import os
from pathlib import Path
from dotenv import load_dotenv

# Ensure we load .env from the app directory
APP_DIR = Path(__file__).resolve().parent
ENV_FILE = APP_DIR / ".env"

if ENV_FILE.exists():
    load_dotenv(dotenv_path=ENV_FILE)
else:
    load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/buspass_db")

# Fix for SQLAlchemy 2.0 with Supabase URLs starting with postgres://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")
SECRET_KEY = os.getenv("SECRET_KEY", "bus_pass_secret_key_2026")
