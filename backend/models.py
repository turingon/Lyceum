from sqlmodel import Field, SQLModel, String

class Users(SQLModel,table = True):
    email: str = Field(String ,unique=True,primary_key=True)
    hashed_password: str = Field(String)

