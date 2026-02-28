from fastapi import Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from clerk_backend_api import Clerk
from clerk_backend_api.security.types import AuthenticateRequestOptions

from server.database.database import get_db
from server.models.user import User
from server.config.config import CLERK_SECRET_KEY, AUTHORIZED_ORIGINS

sdk = Clerk(bearer_auth=CLERK_SECRET_KEY)

async def get_current_user(
        request: Request,
        session: Session = Depends(get_db)
):
    request_state = sdk.authenticate_request(
        request,
        AuthenticateRequestOptions(
        authorized_parties=AUTHORIZED_ORIGINS)
    )

    if not request_state.is_signed_in:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="authentication failed",
        )
    pay_load = request_state.payload
    if not pay_load:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
    clerk_user_id = pay_load.get("sub")

    user = session.query(User).filter(User.id == clerk_user_id).first()
    if not user:
        user = User(id=clerk_user_id)
        session.add(user)
        session.commit()
        session.refresh(user)
    return user
