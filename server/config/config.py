from os import getenv
from dotenv import load_dotenv

load_dotenv()

CLERK_SECRET_KEY = getenv("CLERK_SECRET_KEY")
DATABASE_URL = getenv("DATABASE_URL")
AUTHORIZED_ORIGINS = getenv("AUTHORIZED_ORIGINS", "")

if not CLERK_SECRET_KEY:
    raise RuntimeError("CLERK_SECRET_KEY is not set")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set")

AUTHORIZED_ORIGINS = [
    origin.strip()
    for origin in AUTHORIZED_ORIGINS.split(",")
    if origin.strip()
]