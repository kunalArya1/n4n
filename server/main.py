from fastapi import FastAPI, Depends, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from datetime import datetime, timezone
import hashlib
from contextlib import asynccontextmanager


from auth.authenticate import get_current_user
from models.user import UserModel, CreateUserModel
from models.application import ApplicationModel, CreateApplicationModel, UpdateApplicationModel
from models.flows import FlowModel, CreateFlowModel, UpdateFlowModel
from config.config import AUTHORIZED_ORIGINS
from database.database import db, init_db

# ─── Health ──────b  # motor db instance

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(lifespan=lifespan)

# ─── Middleware ────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=AUTHORIZED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
    allow_origin_regex="https?://localhost:*",
)

@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

@app.middleware("http")
async def cors_preflight_handler(request: Request, call_next):
    if request.method == "OPTIONS":
        response = Response(status_code=200)
        response.headers["Access-Control-Allow-Origin"] = ",".join(AUTHORIZED_ORIGINS)
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "*"
        response.headers["Access-Control-Allow-Headers"] = "*"
        return response
    return await call_next(request)

# ─── Health ────────────────────────────────────────────────────

@app.get("/")
async def health():
    return {"status": "API running"}

    # returns a fake user object bypassing clerk
    return {
        "clerk_id": "user_test001",
        "username": "likith",
        "email": "likith@test.com"
    }
# ─── Register ─────────────────────────────────────────────────

@app.post("/register")
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
        "message": "User registered successfully",
        "user": {
            "clerk_id": new_user["clerk_id"],
            "username": new_user["username"],
            "created_at": new_user["created_at"].isoformat()
        }
    }


# ─── Protected ────────────────────────────────────────────────

@app.get("/protected")
async def protected(current_user = Depends(get_current_user)):
    return {
        "message": "Authenticated successfully",
        "clerk_id": current_user["clerk_id"],
        "username": current_user["username"]
    }


# ─── Applications ─────────────────────────────────────────────

@app.post("/applications")
async def create_application(
    data: CreateApplicationModel,
    current_user = Depends(get_current_user)
):
    # Generate app ID by hashing name + datetime (same as your old code)
    current_time = datetime.now(timezone.utc)
    app_id_string = f"{data.name}_{current_time.isoformat()}"
    app_id = hashlib.sha256(app_id_string.encode()).hexdigest()

    new_application = {
        "_id": app_id,
        "name": data.name,
        "description": data.description,
        "clerk_id": current_user["clerk_id"],   # link to user
        "created_at": current_time,
        "updated_at": None
    }

    await db.applications.insert_one(new_application)

    return {
        "message": "Application created successfully",
        "application": {
            "id": app_id,
            "name": new_application["name"],
            "description": new_application["description"],
            "clerk_id": new_application["clerk_id"],
            "created_at": new_application["created_at"].isoformat(),
            "updated_at": None
        }
    }


@app.get("/applications")
async def get_applications(current_user = Depends(get_current_user)):
    clerk_id = current_user["clerk_id"]

    # Get all applications for this user
    pipeline = [
        # Step 1 - match only this user's applications
        {"$match": {"clerk_id": clerk_id}},

        # Step 2 - join flows and count them
        {
            "$lookup": {
                "from": "flows",
                "localField": "_id",
                "foreignField": "application_id",
                "as": "flows"
            }
        },

        # Step 3 - add a workflow count field
        {
            "$addFields": {
                "_count": {"workflows": {"$size": "$flows"}}
            }
        },

        # Step 4 - remove the full flows array (we only need the count here)
        {
            "$project": {"flows": 0}
        }
    ]

    applications = await db.applications.aggregate(pipeline).to_list(100)

    for app in applications:
        app["id"] = str(app["_id"])
        del app["_id"]
        if app.get("created_at"):
            app["created_at"] = app["created_at"].isoformat()
        if app.get("updated_at"):
            app["updated_at"] = app["updated_at"].isoformat()

    return {"applications": applications}


@app.delete("/applications/{application_id}")
async def delete_application(
    application_id: str,
    current_user = Depends(get_current_user)
):
    # Find the application
    application = await db.applications.find_one({"_id": application_id})

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    # Check ownership
    if application["clerk_id"] != current_user["clerk_id"]:
        raise HTTPException(status_code=403, detail="Not authorized to delete this application")

    await db.applications.delete_one({"_id": application_id})

    return {"message": "Application deleted successfully"}


# ─── Flows ────────────────────────────────────────────────────

@app.get("/applications/{application_id}/flows")
async def get_application_flows(
    application_id: str,
    current_user = Depends(get_current_user)
):
    # Verify the application belongs to this user
    application = await db.applications.find_one({"_id": application_id})
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    if application["clerk_id"] != current_user["clerk_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Get all flows for this application
    flows = await db.flows.find({"application_id": application_id}).to_list(100)
    for flow in flows:
        flow["_id"] = str(flow["_id"])
        if flow.get("created_at"):
            flow["created_at"] = flow["created_at"].isoformat()
        if flow.get("updated_at"):
            flow["updated_at"] = flow["updated_at"].isoformat()

    return {"flows": flows}

@app.post("/applications/{application_id}/flows")
async def create_flow(
    application_id: str,
    data: CreateFlowModel,
    current_user = Depends(get_current_user)
):
    # Check if application exists
    application = await db.applications.find_one({"_id": application_id})
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Check if application belongs to current user
    if application["clerk_id"] != current_user["clerk_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Create flow
    new_flow = {
        "name": data.name,
        "description": data.description,
        "flow": data.flow,
        "application_id": application_id,
        "created_at": datetime.now(timezone.utc),
        "updated_at": None
    }

    result = await db.flows.insert_one(new_flow)

    return {
        "message": "Flow created successfully",
        "flow": {
            "id": str(result.inserted_id),
            "name": new_flow["name"],
            "description": new_flow["description"],
            "application_id": application_id,
            "created_at": new_flow["created_at"].isoformat()
        }
    }

@app.delete("/applications/{application_id}/flows/{flow_id}")
async def delete_flow(
    application_id: str,           
    flow_id: str,
    current_user = Depends(get_current_user)
):
    # Check if application exists and belongs to user
    application = await db.applications.find_one({"_id": application_id})
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    if application["clerk_id"] != current_user["clerk_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Check if flow exists
    flow = await db.flows.find_one({"_id": ObjectId(flow_id)})  
    if not flow:
        raise HTTPException(status_code=404, detail="Flow not found")

    await db.flows.delete_one({"_id": ObjectId(flow_id)})       
    return {"message": "Flow deleted successfully"}

# ─── Update Application ───────────────────────────────────────

@app.put("/applications/{application_id}")
async def update_application(
    application_id: str,
    data: UpdateApplicationModel,
    current_user = Depends(get_current_user)
):
    # Check if application exists
    application = await db.applications.find_one({"_id": application_id})
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    # Check ownership
    if application["clerk_id"] != current_user["clerk_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Only update fields that are provided
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)

    await db.applications.update_one(
        {"_id": application_id},
        {"$set": update_data}
    )

    return {"message": "Application updated successfully"}


# ─── Update Flow ──────────────────────────────────────────────

@app.put("/applications/{application_id}/flows/{flow_id}")
async def update_flow(
    application_id: str,
    flow_id: str,
    data: UpdateFlowModel,
    current_user = Depends(get_current_user)
):
    # Check if application exists and belongs to user
    application = await db.applications.find_one({"_id": application_id})
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    if application["clerk_id"] != current_user["clerk_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Check if flow exists
    flow = await db.flows.find_one({"_id": ObjectId(flow_id), "application_id": application_id})
    if not flow:
        raise HTTPException(status_code=404, detail="Flow not found")

    # Only update fields that are provided
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc)

    await db.flows.update_one(
        {"_id": ObjectId(flow_id)},
        {"$set": update_data}
    )

    return {"message": "Flow updated successfully"}
    

    