from typing import Annotated
import fastapi
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Session
import uvicorn
import auth
from database import engine

SQLModel.metadata.create_all(engine)

if __name__ == "__main__":
    uvicorn.run("__main__:app", host="0.0.0.0", port=8000, reload=True)

app = fastapi.FastAPI()

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # or ["*"] for all origins (not secure for production)
    allow_credentials=True,
    allow_methods=["*"],              # GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],              # Authorization, Content-Type, etc.
)

app.include_router(auth.router)


def get_db():
    with Session(engine) as session:
        yield session


db_dependency = Annotated[Session, fastapi.Depends(get_db)]


@app.get("/")
def get_user(user: None, db: db_dependency):
    if user is None:
        raise fastapi.HTTPException(status_code=401, detail="Authentication Failes")
    return {"User": user}
