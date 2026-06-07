# from datetime import datetime, timedelta
# from typing import Optional, Any
# from jose import JWTError, jwt
# from passlib.context import CryptContext
# from fastapi import Depends, HTTPException, status
# from fastapi.security import OAuth2PasswordBearer
# from sqlalchemy.orm import Session
# from app.core.config import settings
# from app.db.database import get_db

# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


# def verify_password(plain_password: str, hashed_password: str) -> bool:
#     return pwd_context.verify(plain_password, hashed_password)


# def get_password_hash(password: str) -> str:
#     return pwd_context.hash(password)


# def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
#     to_encode = data.copy()
#     expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
#     to_encode.update({"exp": expire})
#     return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


# def decode_token(token: str) -> dict:
#     try:
#         payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
#         return payload
#     except JWTError:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Token noto'g'ri yoki muddati tugagan",
#             headers={"WWW-Authenticate": "Bearer"},
#         )


# def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
#     from app.models.user import User
#     payload = decode_token(token)
#     user_id: int = payload.get("sub")
#     if user_id is None:
#         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Foydalanuvchi topilmadi")
#     user = db.query(User).filter(User.id == int(user_id)).first()
#     if not user or not user.is_active:
#         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Foydalanuvchi faol emas")
#     return user


# def require_roles(*roles: str):
#     def role_checker(current_user=Depends(get_current_user)):
#         if current_user.role not in roles:
#             raise HTTPException(
#                 status_code=status.HTTP_403_FORBIDDEN,
#                 detail=f"Bu amalni bajarish uchun ruxsat yo'q. Kerakli rol: {', '.join(roles)}"
#             )
#         return current_user
#     return role_checker
from datetime import datetime, timedelta
from typing import Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.database import get_db
from app.models.all_models import User


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login"
)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None
) -> str:
    to_encode = data.copy()

    expire = datetime.utcnow() + (
        expires_delta
        or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )


def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token noto'g'ri yoki muddati tugagan",
            headers={"WWW-Authenticate": "Bearer"},
        )


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    payload = decode_token(token)

    user_id = payload.get("sub")

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Foydalanuvchi topilmadi"
        )

    user = db.query(User).filter(
        User.id == int(user_id)
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Foydalanuvchi topilmadi"
        )

    if hasattr(user, "is_active") and not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Foydalanuvchi faol emas"
        )

    return user


# def require_roles(*roles):
#     def role_checker(
#         current_user=Depends(get_current_user)
#     ):
#         user_role = str(current_user.role)

#         if user_role not in roles:
#             raise HTTPException(
#                 status_code=status.HTTP_403_FORBIDDEN,
#                 detail=(
#                     f"Bu amalni bajarish uchun ruxsat yo'q. "
#                     f"Kerakli rol: {', '.join(roles)}"
#                 )
#             )

#         return current_user

#     return role_checker
def require_roles(*roles):
    def role_checker(current_user=Depends(get_current_user)):

        user_role = (
            current_user.role.value
            if hasattr(current_user.role, "value")
            else str(current_user.role)
        )

        allowed_roles = [
            r.value if hasattr(r, "value") else str(r)
            for r in roles
        ]

        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Bu amalni bajarish uchun ruxsat yo'q. Kerakli rol: {', '.join(allowed_roles)}"
            )

        return current_user

    return role_checker