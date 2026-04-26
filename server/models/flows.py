from sqlalchemy import Column, String, DateTime, JSON, Integer, ForeignKey
from sqlalchemy.sql import func
from database.database import Base

class Flow(Base):
    __tablename__ = "flows"
    __table_args__ = {'schema': 'n4n'}

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    flow = Column(JSON, nullable=False)
    application_id = Column(String, ForeignKey("n4n.applications.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())