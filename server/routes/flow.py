from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
from bson import ObjectId

from models.flows import CreateFlowModel, UpdateFlowModel
from database.database import db
from auth.authenticate import get_current_user_dummy as get_current_user

router = APIRouter(prefix="/applications", tags=["Flows"])

@router.post("/{application_id}/flows")
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
        "status":"success",
        "message": "Flow created successfully",
    }

@router.get("/{application_id}/flows")
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

    return {"status":"success","flows": flows}

@router.delete("/{application_id}/flows/{flow_id}")
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
    return {"status":"success","message": "Flow deleted successfully"}

@router.put("/{application_id}/flows/{flow_id}")
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

    return {"status":"success","message": "Flow updated successfully"}