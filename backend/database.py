import os
from sqlmodel import create_engine

db_user = os.getenv("DB_USER", "doruk")
db_pass = os.getenv("DB_PASSWORD", "rommel07.")
db_host = os.getenv("DB_HOST", "db")
db_port = os.getenv("DB_PORT", "5432")
db_name = os.getenv("DB_NAME", "auth")

DATABASE_URL = f"postgresql://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}"

engine = create_engine(DATABASE_URL)

