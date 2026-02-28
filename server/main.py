from fastapi import FastAPI, Depends
from server.database.database import Base, engine
from server.auth.authenticate import get_current_user
from server.models.user import User

app = FastAPI()

# Create tables automatically
Base.metadata.create_all(bind=engine)


@app.get("/")
def health():
    return {"status": "API running"}


@app.get("/protected")
async def protected(user: User = Depends(get_current_user)):
    return {
        "message": "Authenticated successfully",
        "user_id": user.id
    }