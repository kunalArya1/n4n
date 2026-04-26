import json
from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from clerk_backend_api import authenticate_request
from clerk_backend_api.security.types import AuthenticateRequestOptions, Requestish

from database.database import get_db
from models.user import User
from config.config import CLERK_SECRET_KEY, AUTHORIZED_ORIGINS, CLERK_API_URL


class ClerkRequest:
    def __init__(self, token: str):
        self.headers = {"Authorization": f"Bearer {token}"}


async def get_current_user(
        request: Request,
        session: Session = Depends(get_db)
):
    # Get the Authorization header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing or invalid",
        )
    
    # Extract the token from the header
    token = auth_header.split("Bearer ")[1]
    
    try:
        # Verify the JWT token using Clerk's authenticate_request function
        options = AuthenticateRequestOptions(
            secret_key=CLERK_SECRET_KEY
        )
        clerk_request = ClerkRequest(token)
        auth_object = authenticate_request(clerk_request, options)
        
        # Check if the user is signed in
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
        
        # Check if user exists in our database
        user = session.query(User).filter(User.id == clerk_user_id).first()
        if not user:
            # User is not in our database, create a new user
            # Extract username from the token if available
            username = auth_object.payload.get("username", f"user_{clerk_user_id[:8]}")
            
            user = User(
                id=clerk_user_id,
                username=username
            )
            session.add(user)
            session.commit()
        
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
        )
