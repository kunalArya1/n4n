from fastapi import Depends, HTTPException, status, Request
from clerk_backend_api import authenticate_request
from clerk_backend_api.security.types import AuthenticateRequestOptions

from database.database import db
from config.config import CLERK_SECRET_KEY


class ClerkRequest:
    def __init__(self, token: str):
        self.headers = {"Authorization": f"Bearer {token}"}


async def get_current_user(request: Request):
    # Get the Authorization header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing or invalid",
        )

    # Extract token
    token = auth_header.split("Bearer ")[1]

    try:
        # Verify JWT with Clerk
        options = AuthenticateRequestOptions(secret_key=CLERK_SECRET_KEY)
        auth_object = authenticate_request(ClerkRequest(token), options)

        # Check if signed in
        if not auth_object.is_signed_in:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: user not signed in",
            )

        clerk_user_id = auth_object.payload.get("sub")
        if not clerk_user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user ID",
            )

        # Check if user exists in MongoDB
        user = await db.users.find_one({"clerk_id": clerk_user_id})

        if not user:
            # Auto create user if not in DB
            username = auth_object.payload.get("username", f"user_{clerk_user_id[:8]}")
            new_user = {
                "clerk_id": clerk_user_id,
                "username": username,
                "email": auth_object.payload.get("email", ""),
            }
            await db.users.insert_one(new_user)
            user = new_user

        return user

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
        )
    

async def get_current_user_dummy(request: Request):
    # read clerk_id from a custom test header
    clerk_id = request.headers.get("X-Test-User", "user_test001")
    
    user = await db.users.find_one({"clerk_id": clerk_id})
    if not user:
        raise HTTPException(status_code=404, detail="Test user not found")
    
    return user