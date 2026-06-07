from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.security import verify_password, create_access_token, get_current_user
from app.models.all_models import User
from app.schemas.schemas import Token, LoginRequest, UserOut, UserCreate, UserUpdate
from app.core.security import get_password_hash, require_roles
from app.models.all_models import RoleEnum

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=Token)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == request.username).first()
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Login yoki parol noto'g'ri")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Hisob faol emas")
    token = create_access_token({"sub": str(user.id), "role": user.role, "username": user.username})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "full_name": user.full_name,
            "role": user.role,
            "email": user.email
        }
    }


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/users", response_model=list[UserOut])
def get_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(RoleEnum.direktor))
):
    return db.query(User).all()


@router.post("/users", response_model=UserOut)
def create_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(RoleEnum.direktor))
):
    existing = db.query(User).filter(User.username == data.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bu username band")
    user = User(
        username=data.username,
        full_name=data.full_name,
        email=data.email,
        role=data.role,
        hashed_password=get_password_hash(data.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.put("/users/{user_id}", response_model=UserOut)
def update_user(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles(RoleEnum.direktor))
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")
    if data.full_name is not None:
        user.full_name = data.full_name
    if data.email is not None:
        user.email = data.email
    if data.role is not None:
        user.role = data.role
    if data.is_active is not None:
        user.is_active = data.is_active
    if data.password is not None:
        user.hashed_password = get_password_hash(data.password)
    db.commit()
    db.refresh(user)
    return user
