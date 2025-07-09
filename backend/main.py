import fastapi
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel
import uvicorn
import auth
import books
from database import engine

SQLModel.metadata.create_all(engine)

if __name__ == "__main__":
    uvicorn.run("__main__:app", host="0.0.0.0", port=8000, reload=True)

app = fastapi.FastAPI()

origins = [
    "http://localhost:5173",
    "https://lyceum.com",
    "http://lyceum.com",
    "https://test.turingon.tech",
    "http://test.turingon.tech",
    "https://lyceum.turingon.tech",
    "http://lyceum.turingon.tech",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # or ["*"] for all origins (not secure for production)
    allow_credentials=True,
    allow_methods=["*"],  # GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],  # Authorization, Content-Type, etc.
)

app.include_router(auth.router)
app.include_router(books.router)
