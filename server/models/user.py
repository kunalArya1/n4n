from pydantic import BaseModel, Field
from datetime import datetime, timezone


class UserModel(BaseModel):
    clerk_id: str
    username: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class CreateUserModel(BaseModel):
    clerk_id: str
    username: str
    email: str