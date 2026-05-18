from motor.motor_asyncio import AsyncIOMotorClient
from config import config

ENDPOINT = config.DATABASE_URL
client = AsyncIOMotorClient(f"{ENDPOINT}")
db = client.n4n

async def init_db():
    # MongoDB creates DB and collections automatically on first insert
    # But this ensures they exist on startup
    existing_collections = await db.list_collection_names()

    if "users" not in existing_collections:
        await db.create_collection("users")

    if "applications" not in existing_collections:
        await db.create_collection("applications")

    if "flows" not in existing_collections:
        await db.create_collection("flows")
