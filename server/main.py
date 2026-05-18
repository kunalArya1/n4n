from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from contextlib import asynccontextmanager

from config.config import AUTHORIZED_ORIGINS
from database.database import init_db

from routes.tools import router as tools_routers
from routes.user import router as user_routers
from routes.application import router as application_routers
from routes.flow import router as flows_routers
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

app.include_router(user_routers)
app.include_router(application_routers)
app.include_router(flows_routers)
app.include_router(tools_routers)