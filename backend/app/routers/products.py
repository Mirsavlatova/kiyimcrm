import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from app.db.database import get_db
from app.core.security import get_current_user
from app.core.config import settings
from app.models.all_models import Product, Category
from app.schemas.schemas import ProductCreate, ProductUpdate, ProductOut, CategoryCreate, CategoryOut
from app.utils.audit import log_action

router = APIRouter(prefix="/products", tags=["Products"])
cat_router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("")
def get_products(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    low_stock: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(Product).filter(Product.is_active == True)
    if search:
        query = query.filter(
            or_(Product.name.ilike(f"%{search}%"), Product.sku.ilike(f"%{search}%"))
        )
    if category_id:
        query = query.filter(Product.category_id == category_id)
    if low_stock:
        query = query.filter(Product.stock_quantity <= Product.min_stock)
    total = query.count()
    items = query.offset((page - 1) * size).limit(size).all()
    return {"items": items, "total": total, "page": page, "size": size, "pages": (total + size - 1) // size}


@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Mahsulot topilmadi")
    return product


@router.post("", response_model=ProductOut)
def create_product(data: ProductCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    existing = db.query(Product).filter(Product.sku == data.sku).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bu SKU band")
    product = Product(**data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    log_action(db, current_user.id, "CREATE", "products", product.id, f"Mahsulot qo'shildi: {product.name}")
    return product


@router.put("/{product_id}", response_model=ProductOut)
def update_product(
    product_id: int,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Mahsulot topilmadi")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(product, field, value)
    db.commit()
    db.refresh(product)
    log_action(db, current_user.id, "UPDATE", "products", product_id, f"Mahsulot yangilandi: {product.name}")
    return product


@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    from app.models.all_models import RoleEnum
    if current_user.role not in [RoleEnum.direktor, RoleEnum.ombor_mudiri]:
        raise HTTPException(status_code=403, detail="Ruxsat yo'q")
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Mahsulot topilmadi")
    product.is_active = False
    db.commit()
    return {"message": "Mahsulot o'chirildi"}


@router.post("/{product_id}/upload-image")
async def upload_image(
    product_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Mahsulot topilmadi")
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        content = await file.read()
        f.write(content)
    product.image_url = f"/uploads/products/{filename}"
    db.commit()
    return {"image_url": product.image_url}


# ─── CATEGORIES ───────────────────────────────────────────────────────────────
@cat_router.get("", response_model=list[CategoryOut])
def get_categories(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Category).all()


@cat_router.post("", response_model=CategoryOut)
def create_category(data: CategoryCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    existing = db.query(Category).filter(Category.name == data.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bu kategoriya mavjud")
    category = Category(**data.model_dump())
    db.add(category)
    db.commit()
    db.refresh(category)
    return category
