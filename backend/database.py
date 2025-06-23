from sqlmodel import create_engine

DATABASE_URL = "postgresql://doruk:rommel07.@localhost:5432/auth"

engine = create_engine(DATABASE_URL)
