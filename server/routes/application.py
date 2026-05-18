from fastapi import APIRouter, HTTPException, Depends, status
from datetime import datetime, timezone
from bson import ObjectId
import hashlib

from models.application import CreateApplicationModel, UpdateApplicationModel
from auth.authenticate import get_current_user
from database.database import db

router = APIRouter(prefix="/applications", tags=["Applications"])

@router.post("/")
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
        "status": "success",
        "message": "Application created successfully",
    }

@router.get("/")
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

    return {"status":"success","applications": applications}

@router.delete("/{application_id}")
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

    return {"status":"success","message": "Application deleted successfully"}

@router.put("/{application_id}")
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

    return {"status":"success","message": "Application updated successfully"}
