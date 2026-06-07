from fastapi import APIRouter, Depends, HTTPException, Query
# from sqlalchemy.orm import Session
from typing import Optional
import random, string
from datetime import datetime
from app.db.database import get_db
from app.core.security import get_current_user
from app.models.all_models import Order, OrderItem, Product, Customer, Notification
from app.schemas.schemas import OrderCreate, OrderUpdate, OrderOut
from app.utils.audit import log_action
from sqlalchemy.orm import Session, joinedload

router = APIRouter(prefix="/orders", tags=["Orders"])


def generate_order_number():
    chars = string.digits
    return "ORD-" + "".join(random.choices(chars, k=8))


@router.get("")
def get_orders(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    customer_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(Order)
    if status:
        query = query.filter(Order.status == status)
    if customer_id:
        query = query.filter(Order.customer_id == customer_id)
    total = query.count()
    # items = query.order_by(Order.created_at.desc()).offset((page - 1) * size).limit(size).all()
    items = (
    query
    .options(
        joinedload(Order.customer)
    )
    .order_by(Order.created_at.desc())
    .offset((page - 1) * size)
    .limit(size)
    .all()
)
    return {"items": items, "total": total, "page": page, "size": size, "pages": (total + size - 1) // size}


@router.get("/{order_id}", response_model=OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Buyurtma topilmadi")
    return order


@router.post("", response_model=OrderOut)
def create_order(data: OrderCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    customer = db.query(Customer).filter(Customer.id == data.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Mijoz topilmadi")

    order = Order(
        order_number=generate_order_number(),
        customer_id=data.customer_id,
        created_by=current_user.id,
        note=data.note
    )
    db.add(order)
    db.flush()

    total = 0.0
    for item_data in data.items:
        product = db.query(Product).filter(Product.id == item_data.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Mahsulot {item_data.product_id} topilmadi")
        if product.stock_quantity < item_data.quantity:
            raise HTTPException(status_code=400, detail=f"{product.name}: omborda yetarli mahsulot yo'q")
        item_total = item_data.quantity * item_data.unit_price
        total += item_total
        order_item = OrderItem(
            order_id=order.id,
            product_id=item_data.product_id,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
            total_price=item_total
        )
        product.stock_quantity -= item_data.quantity
        db.add(order_item)

    order.total_amount = total
    order.debt_amount = total

    customer.total_purchases += total
    customer.debt += total
    customer.last_purchase_date = datetime.utcnow()

    # Notification
    notif = Notification(
        title="Yangi buyurtma",
        message=f"{customer.company_name} dan yangi buyurtma: {order.order_number}",
        notification_type="new_order"
    )
    db.add(notif)

    db.commit()
    db.refresh(order)
    log_action(db, current_user.id, "CREATE", "orders", order.id, f"Buyurtma yaratildi: {order.order_number}")
    return order


@router.put("/{order_id}", response_model=OrderOut)
def update_order(
    order_id: int,
    data: OrderUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Buyurtma topilmadi")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(order, field, value)
    db.commit()
    db.refresh(order)
    log_action(db, current_user.id, "UPDATE", "orders", order_id, f"Buyurtma yangilandi: {order.order_number}")
    return order


@router.delete("/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    from app.models.all_models import RoleEnum, OrderStatus
    if current_user.role not in [RoleEnum.direktor]:
        raise HTTPException(status_code=403, detail="Faqat direktor o'chira oladi")
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Buyurtma topilmadi")
    order.status = OrderStatus.bekor_qilingan
    db.commit()
    return {"message": "Buyurtma bekor qilindi"}
