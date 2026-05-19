from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone
from bson import ObjectId
from celery.result import AsyncResult

from helper import encoder
from database.database import db
from models.customeagent import CreateCustomAgent, UpdateCustomAgent
from auth.authenticate import get_current_user
from tools import agents, database_node
from tools.codeexecutor import codeexecutor as codex

router = APIRouter(prefix="/tools", tags=["Tools"])

@router.post("/agent")
async def agent(data: dict):
    prompt = data.get("prompt")
    name = data.get("name")
    input = data.get("input")
    temp = data.get("temperature", 1)
    reasoning = data.get("reasoning", False)

    result = await agents.agent(prompt, name, temp, input, reasoning)
    return result

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
    encoded_api_key = encoder.encrypt_value(data.api_key)
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


    agents = await db.CustomAgent.find(
        {"user_id": current_user["clerk_id"]}
    ).to_list(100)


    for agent in agents:
        agent["_id"] = str(agent["_id"])
        agent.pop("api_key", None)

    return {
        "status": "success",
        "agents": agents
    }

@router.put("/CustomAgent/{_id}")
async def update_CustomAgent(
    data: UpdateCustomAgent,
    _id: str
):
    
    CustomAgents = await db.CustomAgent.find_one({"_id": ObjectId(_id)})
    if not CustomAgents:
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
    CustomAgent = await db.CustomAgent.find_one({"_id": ObjectId(_id)})
    if not CustomAgent:
        raise HTTPException(status_code=404, detail="Agent not found")
    await db.CustomAgent.delete_one({"_id": ObjectId(_id)})       
    return {"status":"success","message": "Agent deleted successfully"}   

@router.post("/codex")
async def execute_code(data: dict):
    code = data.get("code")
    lang = data.get("lang")
    timeout = 10
    if not code:
        raise HTTPException(status_code=400, detail="Code is required")
    if len(code) > 10000:
        raise HTTPException(status_code=400, detail="Code too long")
    if timeout > 30:
        timeout = 30
    task = codex.execute_code_task.delay(code, lang, timeout)
    return {
        "job_id": task.id,
        "status": "queued",
        "message": "Code submitted for execution"
    }

@router.get("/codex/{job_id}")
async def get_code_output(job_id: str):
    task = AsyncResult(job_id)

    if task.state == "PENDING":
        return {"job_id": job_id, "status": "pending"}
    elif task.state == "STARTED":
        return {"job_id": job_id, "status": "executing"}
    elif task.state == "SUCCESS":
        return {"job_id": job_id, "status": "completed", "result": task.result}
    elif task.state == "FAILURE":
        return {"job_id": job_id, "status": "failed", "error": str(task.result)}

    return {"job_id": job_id, "status": task.state.lower()}

@router.post("/database")
async def database_node(
    data: dict
):
    db_type = data.get("db_type")
    host = data.get("host")
    port = data.get("port")
    database = data.get("database")
    username = data.get("username")
    password = data.get("password")
    query = data.get("query")

    if db_type == "postgres":
        return await database_node.execute_postgres(host, port, database, username, password, query)
    elif db_type == "mongodb":
        return await database_node.execute_mongodb(host, port, database, username, password, query)
    else:
        return {"success": False, "error": f"Database type '{db_type}' not supported"}