from sqlmodel import Column, Field, LargeBinary, SQLModel, String


class Users(SQLModel, table=True):
    email: str = Field(String, unique=True, primary_key=True)
    hashed_password: str = Field(String)


class Rooms(SQLModel, table=True):
    id: str = Field(default=None, primary_key=True, index=True)
    owner: str = Field(String)
    name: str = Field(String)


class BookCases(SQLModel, table=True):
    id: str = Field(default=None, primary_key=True, index=True)
    owner: str = Field(String)
    room_id: str = Field(String)
    name: str = Field(String)


class Books(SQLModel, table=True):
    id: str = Field(default=None, primary_key=True, index=True)
    owner: str = Field(String)
    room_id: str = Field(String)
    bookcase_id: str = Field(String)
    name: str = Field(String)
    content: bytes = Field(sa_column=Column(LargeBinary))
    image:bytes = Field(sa_column=Column(LargeBinary))
    status: str = Field(String)


class UpdateRoom(SQLModel):
    name: str


class UpdateBook(SQLModel):
    name:str 
    status:str
