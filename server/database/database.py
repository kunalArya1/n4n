from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from server.config.config import DATABASE_URL

engine = create_engine(str(DATABASE_URL))
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()