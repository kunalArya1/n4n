from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
from bson import ObjectId

from helper import encoder
from database.database import db
from models.customeagent import CreateCustomAgent, UpdateCustomAgent
from auth.authenticate import get_current_user
from tools import agents

router = APIRouter(prefix="/tools", tags=["Tools"])

@router.post("/agent")
async def agent(data: dict):
    prompt = data.get("prompt")
    name = data.get("name")
    input = data.get("input")
    temp = data.get("temperature", 1)
    reasoning = data.get("reasoning", False)

    return agents.agent(prompt, name, temp, input, reasoning)

@router.get("/agent")
async def get_agent():
    agents = await db.Agents.find().to_list(100)
    for agent in agents:
        agent["_id"] = str(agent["_id"])
        agent.pop("api_key", None)

    return {"Status": "success", "agents": agents}

@router.post("/CustomAgent")
async def Create_CustomeAgent(data: CreateCustomAgent,
 current_user = Depends(get_current_user)
 ):
    encoded_api_key = encoder.encrypt(data.api_key)
    current_time = datetime.now(timezone.utc)
    new_agent = {
        "name": data.name,
        "api_key": encoded_api_key,
        "endpoint": data.endpoint,
        "user_id": current_user["clerk_id"],
        "created_at":current_time,
        "updated_at": None
    }
    await db.CustomAgent.insert_one(new_agent)
    return {
        "status": "success",
        "message": "Application created successfully",
    }

@router.get("/CustomAgent")
async def get_CustomAgent(
    current_user = Depends(get_current_user)
):
    agents = await db.custom_agents.find(
        {"user_id": current_user["clerk_id"]}
    ).to_list(100)

    for agent in agents:
        agent["_id"] = str(agent["_id"])
        agent.pop("api_key", None)
    return {"status":"success","agents": agents}

@router.update("/CustomAgent/{_id}")
async def update_CustomAgent(
    data: UpdateCustomAgent,
    _id: str
):
    
    CustomAgent = await db.CustomAgent.find_one({"_id": _id})
    if not CustomAgent:
        raise HTTPException(status_code=404, detail="Agent not found")

    update_data = {k: v for k, v in data.dict().items() if v is not None}

    if "api_key" in update_data :
        update_data["api_key"] = encoder.encrypt(update_data["api_key"])
    
    update_data["updated_at"] = datetime.now(timezone.utc)

    await db.CustomAgent.update_one(
        {"_id": ObjectId(_id)},
        {"$set": update_data}
    )
    return {"status": "success", "message": "Agent updated successfully"}

@router.delete("/CustomAgent/{_id}")
async def Delete_CustomAgent(
    _id: str
):
    CustomAgent = await db.CustomAgent.find_one({"_id": _id})
    if not CustomAgent:
        raise HTTPException(status_code=404, detail="Agent not found")
    await db.CustomAgent.delete_one({"_id": ObjectId(_id)})       
    return {"status":"success","message": "Agent deleted successfully"}   