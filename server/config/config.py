from os import getenv
from dotenv import load_dotenv

load_dotenv()

CLERK_SECRET_KEY = getenv("CLERK_SECRET_KEY")
CLERK_API_URL = getenv("CLERK_API_URL", "https://api.clerk.dev/v1")
DATABASE_URL = getenv("DATABASE_URL")
AUTHORIZED_ORIGINS = getenv("AUTHORIZED_ORIGINS", "http://localhost:3000")

if not CLERK_SECRET_KEY:
    raise RuntimeError("CLERK_SECRET_KEY is not set")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set")

AUTHORIZED_ORIGINS = [
    origin.strip()
    for origin in AUTHORIZED_ORIGINS.split(",")
    if origin.strip()
]

AGENT_BASEURL = getenv("AGENT_BASE_URL")
AGENT_KEY = getenv("AGENT_KEY")
AGENT_MODEL = [M.strip() for M in getenv("AGENT_MODLES", "").split(",")]