# from sqlalchemy import Column, String, DateTime, JSON, Integer, ForeignKey
# from sqlalchemy.sql import func
# from database.database import Base

# class Flow(Base):
#     __tablename__ = "flows"
#     __table_args__ = {'schema': 'n4n'}

#     id = Column(String, primary_key=True, index=True)
#     name = Column(String, nullable=False)
#     description = Column(String)
#     flow = Column(JSON, nullable=False)
#     application_id = Column(String, ForeignKey("n4n.applications.id"), nullable=False)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     updated_at = Column(DateTime(timezone=True), onupdate=func.now())

from pydantic import BaseModel, Field
from typing import Optional, Any, Dict
from datetime import datetime, timezone
from helper import ObjectIdSerilization

class FlowModel(BaseModel):
    id: Optional[ObjectIdSerilization.PyObjectId] = Field(default_factory=ObjectIdSerilization.PyObjectId, alias="_id")
    name:str
    description: Optional[str] = None
    flow: Dict[str, Any]
    application_id: str
    created_at: datetime = Field(default=lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectIdSerilization.ObjectId: str}

class CreateFlowModel(BaseModel):
    name:str
    description: Optional[str] = None
    flow: Dict[str, Any]
    application_id: str

class UpdateFlowModel(BaseModel):
    name:Optional[str] = None
    description: Optional[str] = None
    flow: Optional[Dict[str, Any]] = None
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))