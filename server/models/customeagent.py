from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone
from helper import ObjectIdSerilization

class CustomAgent(BaseModel):
    id: Optional[ObjectIdSerilization.PyObjectId] = Field(default_factory=ObjectIdSerilization.PyObjectId, alias="_id")
    name: str
    api_key: str
    endpoint: str
    user_id: str
    created_at: datetime = Field( default_factory = lambda: datetime.now(timezone.utc))
    updated_at: Optional[datetime]

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectIdSerilization.ObjectId: str}

class CreateCustomAgent(BaseModel):
    name: str
    api_key: str
    endpoint: str

class UpdateCustomAgent(BaseModel):
    name: Optional[str] = None
    api_key: Optional[str] = None
    endpoint: Optional[str] = None
    updated_at: datetime = Field(default_factory = lambda: datetime.now(timezone.utc))