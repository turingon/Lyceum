import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from auth import get_user_by_token
import models
from database import engine
import base64
from fastapi import File, Form, UploadFile, Response

router = APIRouter(prefix="/books", tags=["book"])


def get_db():
    with Session(engine) as session:
        yield session


def create_room(token: str, room: models.Rooms, db: Session):
    if room.name == "":
        return "Name not Specified"
    room = models.Rooms(
        id=str(uuid.uuid4()),
        owner=get_user_by_token(token),
        name=room.name,
    )

    db.add(room)
    db.commit()
    db.refresh(room)


def get_rooms_by_token(db: Session, token: str):
    statement = select(models.Rooms).where(
        models.Rooms.owner == get_user_by_token(token)
    )
    rooms = db.exec(statement)
    return rooms.all()


def create_bookcase(token: str, bookcase: models.BookCases, db: Session):
    bookcase = models.BookCases(
        owner=get_user_by_token(token),
        room_id=bookcase.room_id,
        name=bookcase.name,
        id=str(uuid.uuid4()),
    )

    db.add(bookcase)
    db.commit()
    db.refresh(bookcase)


def get_bookcases_by_token(token: str, db: Session):
    statement = select(models.BookCases).where(
        models.BookCases.owner == get_user_by_token(token)
    )
    bookcases = db.exec(statement)
    return bookcases.all()


def get_bookcases_by_token_and_room(token: str, room_id: str, db: Session):
    if room_id == "room":
        return []
    statement = select(models.BookCases).where(
        models.BookCases.owner == get_user_by_token(token),
        models.BookCases.room_id == room_id,
    )
    bookcases = db.exec(statement)
    return bookcases.all()


def get_books_by_token_and_room_and_case(token, room_id, bookcase_id, db: Session):
    if room_id == "room" or bookcase_id == "case":
        return []
    statement = select(models.Books).where(
        models.Books.bookcase_id == bookcase_id,
        models.Books.owner == get_user_by_token(token),
        models.Books.room_id == room_id,
    )
    books = db.exec(statement).all()
    books_data = []
    for book in books:
        data = book.model_dump()
        if book.image:
            data["image"] = (
                base64.b64encode(book.image).decode("utf-8") if book.image else None
            )
        books_data.append(data)
    return books_data


@router.post("/add_room/{token}")
def add_room(token, room: models.Rooms, db: Session = Depends(get_db)):
    create_room(token, room, db)


@router.get("/get_rooms/{token}")
def get_rooms(token: str, db: Session = Depends(get_db)):
    return get_rooms_by_token(db, token)


@router.post("/add_bookcase/{token}")
def add_bookcase(token, bookcase: models.BookCases, db: Session = Depends(get_db)):
    create_bookcase(token, bookcase, db)


@router.get("/get_bookcases/{token}")
def get_bookcases(token: str, db: Session = Depends(get_db)):
    return get_bookcases_by_token(token, db)


@router.get("/get_bookcases/{token}/room/{room}")
def get_bookcases_by_room(token: str, room: str, db: Session = Depends(get_db)):
    return get_bookcases_by_token_and_room(token, room, db)


@router.get("/get_books/{token}/room/{room}/case/{case}")
def get_books(token: str, room: str, case: str, db: Session = Depends(get_db)):
    return get_books_by_token_and_room_and_case(token, room, case, db)


@router.put("/room/{room_id}")
def update_room(
    room_id: str,
    room_data: models.UpdateRoom,
    db: Session = Depends(get_db),
):
    room = db.get(models.Rooms, room_id)

    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    for field, value in room_data.model_dump().items():
        setattr(room, field, value)

    db.commit()
    db.refresh(room)
    return room


@router.delete("/room/{room_id}")
def delete_room(room_id: str, db: Session = Depends(get_db)):
    room = db.get(models.Rooms, room_id)
    bookcases_statement = select(models.BookCases).where(
        models.BookCases.room_id == room_id
    )
    bookcases = db.exec(bookcases_statement).all()

    books_statement = select(models.Books).where(models.Books.room_id == room_id)
    books = db.exec(books_statement).all()

    if not room:
        raise HTTPException(status_code=404, detail="Item not found")

    db.delete(room)
    for bookcase in bookcases:
        db.delete(bookcase)

    for book in books:
        db.delete(book)
    db.commit()
    return room


@router.put("/bookcase/{bookcase_id}")
def update_bookcase(
    bookcase_id: str,
    bookcase_data: models.UpdateRoom,
    db: Session = Depends(get_db),
):
    bookcase = db.get(models.BookCases, bookcase_id)

    if not bookcase:
        raise HTTPException(status_code=404, detail="Room not found")

    for field, value in bookcase_data.model_dump().items():
        setattr(bookcase, field, value)

    db.commit()
    db.refresh(bookcase)
    return bookcase


@router.delete("/bookcase/{bookcase_id}")
def delete_bookcase(bookcase_id: str, db: Session = Depends(get_db)):
    bookcase = db.get(models.BookCases, bookcase_id)
    books_statement = select(models.Books).where(
        models.Books.bookcase_id == bookcase_id
    )
    books = db.exec(books_statement).all()
    if not bookcase:
        raise HTTPException(status_code=404, detail="Item not found")

    db.delete(bookcase)
    for book in books:
        db.delete(book)
    db.commit()
    return bookcase


@router.post("/add_book/{token}")
async def create_book(
    token: str,
    image: UploadFile = File(...),
    pdf: UploadFile = File(...),
    room_id: str = Form(...),
    bookcase_id: str = Form(...),
    name: str = Form(...),
    status: str = Form(...),
    db: Session = Depends(get_db),
):
    # Validate file types (optional)
    if image.content_type is None or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Image file required")
    if pdf.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="PDF file required")

    image_content = await image.read()
    pdf_content = await pdf.read()

    # Adjust your model to store both files separately
    # For example, add `image_content` and `pdf_content` fields to your Books model
    book = models.Books(
        id=str(uuid.uuid4()),
        owner=get_user_by_token(token),
        room_id=room_id,
        bookcase_id=bookcase_id,
        name=name,
        status=status,
        image=image_content,  # Store image in `content`
        content=pdf_content,  # Store PDF in new field `pdf_content`
    )

    db.add(book)
    db.commit()
    db.refresh(book)

    return {"message": "Book with image and PDF uploaded", "book_id": name}


@router.put("/book/{book_id}")
def update_book(
    book_id: str, book_data: models.UpdateBook, db: Session = Depends(get_db)
):
    book = db.get(models.Books, book_id)

    if not book:
        raise HTTPException(status_code=404, detail="Room not found")

    for field, value in book_data.model_dump().items():
        setattr(book, field, value)

    db.commit()
    db.refresh(book)
    return book.model_dump(exclude={"content", "image"})


@router.delete("/book/{book_id}")
def delete_book(book_id: str, db: Session = Depends(get_db)):
    statement = select(models.Books).where(models.Books.id == book_id)
    result = db.exec(statement).first()
    if not result:
        raise HTTPException(status_code=404, detail="Book not found")
    db.delete(result)
    db.commit()
    return {"detail": "Book deleted successfully"}


@router.get("/book/get_pdf/{id}")
def get_pdf(id: str, db: Session = Depends(get_db)):
    book = db.get(models.Books, id)
    if not book or not book.content:
        raise HTTPException(status_code=404, detail="PDF not found")
    return Response(content=book.content, media_type="application/pdf")
