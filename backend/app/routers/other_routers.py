from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import Optional
from datetime import datetime, timedelta
from app.db.database import get_db
from app.core.security import get_current_user
from app.models.all_models import (
    Payment, Customer, Order, Warehouse, StockMovement,
    Notification, AuditLog, Product
)
from app.schemas.schemas import (
    PaymentCreate, PaymentOut, WarehouseCreate, WarehouseOut,
    StockMovementCreate, StockMovementOut, NotificationOut, AuditLogOut
)
from app.utils.audit import log_action

# ─── PAYMENTS ─────────────────────────────────────────────────────────────────
payments_router = APIRouter(prefix="/payments", tags=["Payments"])


# @payments_router.get("")
# def get_payments(
#     page: int = Query(1, ge=1),
#     size: int = Query(20, ge=1, le=100),
#     customer_id: Optional[int] = None,
#     payment_type: Optional[str] = None,
#     db: Session = Depends(get_db),
#     current_user=Depends(get_current_user)
# ):
#     query = db.query(Payment)
#     if customer_id:
#         query = query.filter(Payment.customer_id == customer_id)
#     if payment_type:
#         query = query.filter(Payment.payment_type == payment_type)
#     total = query.count()
#     items = query.order_by(Payment.created_at.desc()).offset((page - 1) * size).limit(size).all()
#     return {"items": items, "total": total, "page": page, "size": size, "pages": (total + size - 1) // size}
@payments_router.get("")
def get_payments(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    customer_id: Optional[int] = None,
    payment_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(Payment)

    if customer_id:
        query = query.filter(Payment.customer_id == customer_id)

    if payment_type:
        query = query.filter(Payment.payment_type == payment_type)

    total = query.count()

    items = (
        query.order_by(Payment.created_at.desc())
        .offset((page - 1) * size)
        .limit(size)
        .all()
    )

    return {
        "items": [
            {
                "id": p.id,
                "order_id": p.order_id,
                "customer_id": p.customer_id,
                "amount": p.amount,
                "payment_type": p.payment_type,
                "note": p.note,
                "created_at": p.created_at,
                "customer": {
                    "id": p.customer.id,
                    "company_name": p.customer.company_name,
                    "phone": p.customer.phone
                } if p.customer else None
            }
            for p in items
        ],
        "total": total,
        "page": page,
        "size": size,
        "pages": (total + size - 1) // size
    }

@payments_router.post("", response_model=PaymentOut)
def create_payment(data: PaymentCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    customer = db.query(Customer).filter(Customer.id == data.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Mijoz topilmadi")

    payment = Payment(
        **data.model_dump(),
        created_by=current_user.id
    )
    db.add(payment)

    # Update debt
    customer.debt = max(0, customer.debt - data.amount)

    if data.order_id:
        order = db.query(Order).filter(Order.id == data.order_id).first()
        if order:
            order.paid_amount += data.amount
            order.debt_amount = max(0, order.debt_amount - data.amount)

    db.commit()
    db.refresh(payment)
    log_action(db, current_user.id, "CREATE", "payments", payment.id, f"To'lov qabul qilindi: {data.amount}")
    return payment


# ─── WAREHOUSES ───────────────────────────────────────────────────────────────
warehouses_router = APIRouter(prefix="/warehouses", tags=["Warehouses"])


@warehouses_router.get("", response_model=list[WarehouseOut])
def get_warehouses(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(Warehouse).filter(Warehouse.is_active == True).all()


@warehouses_router.post("", response_model=WarehouseOut)
def create_warehouse(data: WarehouseCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    from app.models.all_models import RoleEnum
    if current_user.role not in [RoleEnum.direktor, RoleEnum.ombor_mudiri]:
        raise HTTPException(status_code=403, detail="Ruxsat yo'q")
    warehouse = Warehouse(**data.model_dump())
    db.add(warehouse)
    db.commit()
    db.refresh(warehouse)
    return warehouse


# ─── STOCK MOVEMENTS ──────────────────────────────────────────────────────────
stock_router = APIRouter(prefix="/stock", tags=["Stock"])


@stock_router.get("", response_model=list[StockMovementOut])
def get_movements(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    warehouse_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(StockMovement)
    if warehouse_id:
        query = query.filter(StockMovement.warehouse_id == warehouse_id)
    total = query.count()
    items = query.order_by(StockMovement.created_at.desc()).offset((page - 1) * size).limit(size).all()
    return items


@stock_router.post("", response_model=StockMovementOut)
def create_movement(data: StockMovementCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    from app.models.all_models import RoleEnum, StockMovementType
    if current_user.role not in [RoleEnum.direktor, RoleEnum.ombor_mudiri]:
        raise HTTPException(status_code=403, detail="Ruxsat yo'q")

    product = db.query(Product).filter(Product.id == data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Mahsulot topilmadi")

    movement = StockMovement(**data.model_dump(), created_by=current_user.id)
    db.add(movement)

    if data.movement_type == StockMovementType.kirim:
        product.stock_quantity += data.quantity
    else:
        if product.stock_quantity < data.quantity:
            raise HTTPException(status_code=400, detail="Omborda yetarli mahsulot yo'q")
        product.stock_quantity -= data.quantity

    # Low stock notification
    if product.stock_quantity <= product.min_stock:
        notif = Notification(
            title="Kam qolgan mahsulot",
            message=f"{product.name} omborda {product.stock_quantity} ta qoldi (minimal: {product.min_stock})",
            notification_type="low_stock"
        )
        db.add(notif)

    db.commit()
    db.refresh(movement)
    return movement


# ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
notifications_router = APIRouter(prefix="/notifications", tags=["Notifications"])


@notifications_router.get("", response_model=list[NotificationOut])
def get_notifications(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return db.query(Notification).order_by(Notification.created_at.desc()).limit(50).all()


@notifications_router.put("/{notif_id}/read")
def mark_read(notif_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    notif = db.query(Notification).filter(Notification.id == notif_id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"message": "O'qilgan"}


@notifications_router.put("/read-all")
def mark_all_read(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    db.query(Notification).filter(Notification.is_read == False).update({"is_read": True})
    db.commit()
    return {"message": "Barchasi o'qilgan"}


# ─── AUDIT LOGS ───────────────────────────────────────────────────────────────
audit_router = APIRouter(prefix="/audit-logs", tags=["AuditLog"])


@audit_router.get("")
def get_audit_logs(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    from app.models.all_models import RoleEnum
    if current_user.role != RoleEnum.direktor:
        raise HTTPException(status_code=403, detail="Faqat direktor ko'ra oladi")
    total = db.query(AuditLog).count()
    items = db.query(AuditLog).order_by(AuditLog.created_at.desc()).offset((page - 1) * size).limit(size).all()
    return {"items": items, "total": total, "page": page, "size": size, "pages": (total + size - 1) // size}


# ─── DASHBOARD ────────────────────────────────────────────────────────────────
dashboard_router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@dashboard_router.get("")
def get_dashboard(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=now.weekday())
    month_start = today_start.replace(day=1)
    year_start = today_start.replace(month=1, day=1)

    def sales_in_period(start, end=None):
        q = db.query(func.coalesce(func.sum(Order.total_amount), 0)).filter(
            Order.created_at >= start,
            Order.status != "bekor_qilingan"
        )
        if end:
            q = q.filter(Order.created_at < end)
        return float(q.scalar() or 0)

    today_sales = sales_in_period(today_start)
    weekly_sales = sales_in_period(week_start)
    monthly_sales = sales_in_period(month_start)
    yearly_sales = sales_in_period(year_start)

    active_customers = db.query(func.count(Customer.id)).filter(Customer.is_active == True).scalar()
    total_products = db.query(func.count(Product.id)).filter(Product.is_active == True).scalar()
    total_orders = db.query(func.count(Order.id)).scalar()
    debt_customers = db.query(func.count(Customer.id)).filter(Customer.debt > 0).scalar()
    low_stock_count = db.query(func.count(Product.id)).filter(
        Product.is_active == True,
        Product.stock_quantity <= Product.min_stock
    ).scalar()

    # Monthly chart (last 12 months)
    monthly_chart = []
    for i in range(11, -1, -1):
        m_start = (month_start - timedelta(days=30 * i)).replace(day=1)
        m_end = (m_start + timedelta(days=32)).replace(day=1)
        total = float(db.query(func.coalesce(func.sum(Order.total_amount), 0)).filter(
            Order.created_at >= m_start,
            Order.created_at < m_end,
            Order.status != "bekor_qilingan"
        ).scalar() or 0)
        monthly_chart.append({"month": m_start.strftime("%b %Y"), "amount": total})

    # Top 10 products
    from sqlalchemy import desc
    from app.models.all_models import OrderItem
    top_products = db.query(
        Product.name,
        func.sum(OrderItem.quantity).label("sold"),
        func.sum(OrderItem.total_price).label("revenue")
    ).join(OrderItem).group_by(Product.id, Product.name).order_by(desc("revenue")).limit(10).all()

    # Top 10 customers
    top_customers = db.query(
        Customer.company_name,
        Customer.total_purchases,
        Customer.debt
    ).order_by(Customer.total_purchases.desc()).limit(10).all()

    return {
        "today_sales": today_sales,
        "weekly_sales": weekly_sales,
        "monthly_sales": monthly_sales,
        "yearly_sales": yearly_sales,
        "active_customers": active_customers,
        "total_products": total_products,
        "total_orders": total_orders,
        "debt_customers": debt_customers,
        "low_stock_count": low_stock_count,
        "monthly_chart": monthly_chart,
        "top_products": [{"name": p[0], "sold": int(p[1] or 0), "revenue": float(p[2] or 0)} for p in top_products],
        "top_customers": [{"name": c[0], "total_purchases": float(c[1] or 0), "debt": float(c[2] or 0)} for c in top_customers],
    }


# ─── REPORTS ──────────────────────────────────────────────────────────────────
reports_router = APIRouter(prefix="/reports", tags=["Reports"])


@reports_router.get("/sales")
def sales_report(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    from app.models.all_models import RoleEnum
    if current_user.role not in [RoleEnum.direktor, RoleEnum.buxgalter]:
        raise HTTPException(status_code=403, detail="Ruxsat yo'q")
    query = db.query(Order).filter(Order.status != "bekor_qilingan")
    if start_date:
        query = query.filter(Order.created_at >= datetime.fromisoformat(start_date))
    if end_date:
        query = query.filter(Order.created_at <= datetime.fromisoformat(end_date))
    orders = query.all()
    total = sum(o.total_amount for o in orders)
    paid = sum(o.paid_amount for o in orders)
    return {
        "total_orders": len(orders),
        "total_amount": total,
        "paid_amount": paid,
        "debt_amount": total - paid,
        "orders": orders
    }
  