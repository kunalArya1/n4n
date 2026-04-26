from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import DDL
from sqlalchemy import text
from config.config import DATABASE_URL

engine = create_engine(str(DATABASE_URL))
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# Create schema if it doesn't exist
event.listen(
    Base.metadata, 
    'before_create', 
    DDL("CREATE SCHEMA IF NOT EXISTS n4n")
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
