from fastapi import APIRouter, HTTPException, Depends, status
from datetime import datetime, timezone

from models.user import CreateUserModel
from database.database import db

router = APIRouter(prefix="/register", tags=["Users"])

@router.post("/")
async def register_user(data: CreateUserModel):
    # Check if user already exists with this clerk_id
    existing_user = await db.users.find_one({"clerk_id": data.clerk_id})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already registered"
        )

    # Check if username is taken
    username_exists = await db.users.find_one({"username": data.username})
    if username_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )

    # Create new user
    new_user = {
        "clerk_id": data.clerk_id,
        "username": data.username,
        "created_at": datetime.now(timezone.utc)
    }

    await db.users.insert_one(new_user)

    return {
        "status": "success",
        "message": "User registered successfully"
    }

# @router.get("/protected")
# async def protected(current_user = Depends(get_current_user)):
#     return {
#         "status": "success",
#         "message": "Authenticated successfully"
#     }

