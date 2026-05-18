# from sqlalchemy import Column, String, DateTime, ForeignKey, Integer
# from sqlalchemy.sql import func
# from sqlalchemy.dialects.postgresql import UUID
# from database.database import Base

# class Application(Base):
#     __tablename__ = "applications"
#     __table_args__ = {'schema': 'n4n'}

#     id = Column(String, primary_key=True, index=True)
#     name = Column(String, nullable=False)
#     description = Column(String)
#     user_id = Column(String, ForeignKey("n4n.users.id"), nullable=False)
#     created_at = Column(DateTime(timezone=True), server_default=func.now())
#     updated_at = Column(DateTime(timezone=True), onupdate=func.now())

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone
from helper import ObjectIdSerilization

class ApplicationModel(BaseModel):
    id : Optional[ObjectIdSerilization.PyObjectId] = Field(default_factory=ObjectIdSerilization.PyObjectId, alias="_id")
    name : str
    description : Optional[str] = None
    user_id : str
    created_at : datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at : Optional[datetime]=None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectIdSerilization.ObjectId: str}


class CreateApplicationModel(BaseModel):
    name : str
    description : Optional[str] = None

class UpdateApplicationModel(BaseModel):
    name : Optional[str] = None
    description : Optional[str] = None
    updated_at : datetime = Field(default_factory=lambda: datetime.now(timezone.utc))