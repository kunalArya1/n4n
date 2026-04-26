from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel, validator
from sqlalchemy.orm import Session
import hashlib
import datetime

from database.database import Base, engine, get_db
from auth.authenticate import get_current_user
from models.user import User
from models.application import Application
from models.flows import Flow
from config.config import AUTHORIZED_ORIGINS

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=AUTHORIZED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
    allow_origin_regex="https?://localhost:*",  # Allow localhost on any port
)

# Add security headers middleware
@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# Add a middleware to handle CORS preflight requests
@app.middleware("http")
async def cors_preflight_handler(request: Request, call_next):
    if request.method == "OPTIONS":
        response = Response(status_code=200)
        response.headers["Access-Control-Allow-Origin"] = ",".join(AUTHORIZED_ORIGINS)
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"
        return response
    response = await call_next(request)
    return response

# Create tables automatically
Base.metadata.create_all(bind=engine)

@app.get("/")
def health():
    return {"status": "API running"}

# Define a Pydantic model for registration data
class RegistrationData(BaseModel):
    username: str
    clerk_user_id: str
    
    # Add validation for username
    @validator('username')
    def validate_username(cls, v):
        if not v or not v.strip():
            raise ValueError('Username cannot be empty')
        if len(v) < 3:
            raise ValueError('Username must be at least 3 characters long')
        if len(v) > 30:
            raise ValueError('Username cannot be longer than 30 characters')
        if not v.replace('_', '').replace('-', '').isalnum():
            raise ValueError('Username can only contain letters, numbers, underscores, and hyphens')
        return v.strip()

# Define a Pydantic model for application creation data
class ApplicationCreateData(BaseModel):
    name: str
    description: str = ""
    
    # Add validation for application name
    @validator('name')
    def validate_name(cls, v):
        if not v or not v.strip():
            raise ValueError('Application name cannot be empty')
        if len(v) < 3:
            raise ValueError('Application name must be at least 3 characters long')
        if len(v) > 50:
            raise ValueError('Application name cannot be longer than 50 characters')
        return v.strip()

@app.post("/register")
async def register_user(
    registration_data: RegistrationData,
    session: Session = Depends(get_db)
):
    # Check if user already exists
    existing_user = session.query(User).filter(User.id == registration_data.clerk_user_id).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already registered"
        )

    # Check if username is available
    username_exists = session.query(User).filter(User.username == registration_data.username).first()
    if username_exists:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )

    # Create new user
    new_user = User(id=registration_data.clerk_user_id, username=registration_data.username)
    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    return {
        "message": "User registered successfully",
        "user": {
            "id": new_user.id,
            "username": new_user.username,
            "created_at": new_user.created_at.isoformat()
        }
    }

@app.get("/protected")
async def protected(user: User = Depends(get_current_user)):
    return {
        "message": "Authenticated successfully",
        "user_id": user.id,
        "username": user.username
    }

@app.post("/applications")
async def create_application(
    application_data: ApplicationCreateData,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_db)
):
    # Generate application ID by hashing application name and current datetime
    current_time = datetime.datetime.now()
    app_id_string = f"{application_data.name}_{current_time.isoformat()}"
    app_id = hashlib.sha256(app_id_string.encode()).hexdigest()
    
    # Create new application
    new_application = Application(
        id=app_id,
        name=application_data.name,
        description=application_data.description,
        user_id=user.id,
        created_at=current_time,
        updated_at=current_time
    )
    
    session.add(new_application)
    session.commit()
    session.refresh(new_application)
    
    # Convert datetime fields properly
    updated_at_value = None
    if new_application.updated_at is not None:
        updated_at_value = new_application.updated_at.isoformat()
    
    return {
        "message": "Application created successfully",
        "application": {
            "id": new_application.id,
            "name": new_application.name,
            "description": new_application.description,
            "user_id": new_application.user_id,
            "created_at": new_application.created_at.isoformat(),
            "updated_at": updated_at_value
        }
    }

@app.delete("/applications/{application_id}")
async def delete_application(
    application_id: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db)
):
    # Find the application by ID
    application = session.query(Application).filter(Application.id == application_id).first()
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Check if the application belongs to the current user
    if application.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this application")
    
    # Delete the application
    session.delete(application)
    session.commit()
    
    return {"message": "Application deleted successfully"}

@app.get("/applications")
async def get_applications(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_db)
):
    # Import the count function
    from sqlalchemy import func
    # Get all applications for the current user with workflow counts
    applications = session.query(Application, func.count(Flow.id)).outerjoin(Flow, Flow.application_id == Application.id).filter(Application.user_id == current_user.id).group_by(Application.id).all()
    
    # Convert to dictionary format with workflow counts
    apps_list = []
    for app, workflow_count in applications:
        updated_at_value = None
        if app.updated_at is not None:
            updated_at_value = app.updated_at.isoformat()
        
        apps_list.append({
            "id": app.id,
            "name": app.name,
            "description": app.description,
            "user_id": app.user_id,
            "created_at": app.created_at.isoformat(),
            "updated_at": updated_at_value,
            "is_deleted": False,  # Assuming applications are not soft-deleted in this model
            "deleted_at": None,
            "_count": {"workflows": workflow_count}
        })
    
    return {"applications": apps_list}
