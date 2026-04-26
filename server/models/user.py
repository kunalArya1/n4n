from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from database.database import Base


class User(Base):
    __tablename__ = "users"
    __table_args__ = {'schema': 'n4n'}

    id = Column(String, primary_key=True)
    username = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
