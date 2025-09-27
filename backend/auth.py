from datetime import datetime, timedelta, timezone
import models
from database import engine
from fastapi import APIRouter, Depends, status
from fastapi.exceptions import HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from sqlmodel import Session, SQLModel, select
from jose import JWTError, jwt

SQLModel.metadata.create_all(engine)

router = APIRouter(prefix="/auth", tags=["auth"])

SECRET_KEY = "doruk"  # this can be anything you want
ALGORITHM = "HS256"

bcryp_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_bearer = OAuth2PasswordBearer(tokenUrl="auth/token")


def get_db():
    with Session(engine) as session:
        yield session


def create_user(user: models.Users, db: Session):
    user = models.Users(
        email=user.email, hashed_password=bcryp_context.hash(user.hashed_password)
    )

    db.add(user)
    db.commit()

    access_token_expires = timedelta(minutes=1440)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


def get_user_by_name(db: Session, email: str):
    statement = select(models.Users).where(models.Users.email == email)
    user = db.exec(statement).first()
    return user


@router.post("/register")
def register_user(user: models.Users, db: Session = Depends(get_db)):
    print("enter")
    db_user = get_user_by_name(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="User Already Exist")
    return create_user(db=db, user=user)


def authenticate_user(email: str, password: str, db: Session):
    user = get_user_by_name(db, email)
    if not user:
        return False

    if not bcryp_context.verify(password, user.hashed_password):
        return False

    return user


@router.post("/token")
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or passwrod",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=1440)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=1440)

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, ALGORITHM)
    return encoded_jwt


def get_user_by_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user = payload.get("sub")
        if user is None:
            raise HTTPException(
                status_code=403, detail="Token is invalid please login again"
            )
        return user
    except JWTError:
        raise HTTPException(status_code=403, detail="Token is invalid or expired")


def verify_token(token: str = Depends(oauth2_bearer)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=403, detail="Token is invalid or expired")
        return payload
    except JWTError:
        raise HTTPException(status_code=403, detail="Token is invalid or expired")


@router.get("/verify_token/{token}")
async def verify_user_token(token: str):
    verify_token(token=token)
    return {"Message": "Token is valid"}
