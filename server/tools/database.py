import asyncpg
from motor.motor_asyncio import AsyncIOMotorClient
import json


# ─── PostgreSQL ───────────────────────────────────────────────

async def execute_postgres(host, port, database, username, password, query):
    try:
        conn = await asyncpg.connect(
            host=host,
            port=port,
            database=database,
            user=username,
            password=password,
            timeout=10
        )

        try:
            rows = await conn.fetch(query)
            result = [dict(row) for row in rows]
            return {
                "success": True,
                "database": "postgres",
                "rows": result,
                "count": len(result)
            }
        finally:
            await conn.close()

    except asyncpg.InvalidPasswordError:
        return {"success": False, "error": "Invalid username or password"}
    except asyncpg.InvalidCatalogNameError:
        return {"success": False, "error": f"Database '{database}' not found"}
    except Exception as e:
        return {"success": False, "error": str(e)}


# ─── MongoDB ──────────────────────────────────────────────────

async def execute_mongodb(host, port, database, username, password, query):
    client = None
    try:
        # build connection string
        if username and password:
            uri = f"mongodb://{username}:{password}@{host}:{port}"
        else:
            uri = f"mongodb://{host}:{port}"

        client = AsyncIOMotorClient(uri, serverSelectionTimeoutMS=10000)
        db = client[database]

        # query format: { "collection": "users", "filter": {}, "limit": 10 }
        query_dict = json.loads(query)
        collection_name = query_dict.get("collection")
        filter_dict = query_dict.get("filter", {})
        limit = query_dict.get("limit", 100)
        projection = query_dict.get("projection", None)

        if not collection_name:
            return {"success": False, "error": "collection name is required in query"}

        collection = db[collection_name]
        cursor = collection.find(filter_dict, projection).limit(limit)
        rows = await cursor.to_list(length=limit)

        # convert ObjectId to string
        for row in rows:
            row["_id"] = str(row["_id"])

        return {
            "success": True,
            "database": "mongodb",
            "rows": rows,
            "count": len(rows)
        }

    except json.JSONDecodeError:
        return {"success": False, "error": "Invalid query format. Must be valid JSON"}
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        if client:
            client.close()


# ─── Main executor ────────────────────────────────────────────

async def execute_database_node(data):
    if data.db_type == "postgres":
        return await execute_postgres(
            host=data.host,
            port=data.port,
            database=data.database,
            username=data.username,
            password=data.password,
            query=data.query
        )

    elif data.db_type == "mongodb":
        return await execute_mongodb(
            host=data.host,
            port=data.port,
            database=data.database,
            username=data.username,
            password=data.password,
            query=data.query
        )

    return {"success": False, "error": f"Database type '{data.db_type}' not supported"}