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