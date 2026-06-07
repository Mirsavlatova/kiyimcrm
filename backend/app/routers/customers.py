from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from app.db.database import get_db
from app.core.security import get_current_user
from app.models.all_models import Customer, Order, Payment
from app.schemas.schemas import CustomerCreate, CustomerUpdate, CustomerOut
from app.utils.audit import log_action

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.get("")
def get_customers(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None,
    region: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(Customer).filter(Customer.is_active == True)
    if search:
        query = query.filter(
            or_(
                Customer.company_name.ilike(f"%{search}%"),
                Customer.phone.ilike(f"%{search}%"),
                Customer.contact_person.ilike(f"%{search}%")
            )
        )
    if status:
        query = query.filter(Customer.status == status)
    if region:
        query = query.filter(Customer.region == region)
    total = query.count()
    items = query.offset((page - 1) * size).limit(size).all()
    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size,
        "pages": (total + size - 1) // size
    }


@router.get("/{customer_id}")
def get_customer(customer_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Mijoz topilmadi")
    orders = db.query(Order).filter(Order.customer_id == customer_id).order_by(Order.created_at.desc()).limit(10).all()
    payments = db.query(Payment).filter(Payment.customer_id == customer_id).order_by(Payment.created_at.desc()).limit(10).all()
    return {
        "customer": customer,
        "recent_orders": orders,
        "recent_payments": payments
    }


@router.post("", response_model=CustomerOut)
def create_customer(data: CustomerCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    customer = Customer(**data.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    log_action(db, current_user.id, "CREATE", "customers", customer.id, f"Yangi mijoz: {customer.company_name}")
    return customer


@router.put("/{customer_id}", response_model=CustomerOut)
def update_customer(
    customer_id: int,
    data: CustomerUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Mijoz topilmadi")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(customer, field, value)
    db.commit()
    db.refresh(customer)
    log_action(db, current_user.id, "UPDATE", "customers", customer_id, f"Mijoz yangilandi: {customer.company_name}")
    return customer


@router.delete("/{customer_id}")
def delete_customer(customer_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    from app.models.all_models import RoleEnum
    if current_user.role not in [RoleEnum.direktor, RoleEnum.sotuv_menejeri]:
        raise HTTPException(status_code=403, detail="Ruxsat yo'q")
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Mijoz topilmadi")
    customer.is_active = False
    db.commit()
    log_action(db, current_user.id, "DELETE", "customers", customer_id, f"Mijoz o'chirildi: {customer.company_name}")
    return {"message": "Mijoz o'chirildi"}
