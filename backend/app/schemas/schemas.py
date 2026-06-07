from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
from app.models.all_models import RoleEnum, OrderStatus, PaymentType, StockMovementType


# ─── AUTH ────────────────────────────────────────────────────────────────────
class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict


class LoginRequest(BaseModel):
    username: str
    password: str


# ─── USER ────────────────────────────────────────────────────────────────────
class UserBase(BaseModel):
    username: str
    full_name: str
    email: Optional[str] = None
    role: RoleEnum = RoleEnum.sotuv_menejeri


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[RoleEnum] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None


class UserOut(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ─── CATEGORY ────────────────────────────────────────────────────────────────
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryOut(CategoryBase):
    id: int
    created_at: datetime
    model_config = {"from_attributes": True}


# ─── PRODUCT ─────────────────────────────────────────────────────────────────
class ProductBase(BaseModel):
    name: str
    sku: str
    barcode: Optional[str] = None
    category_id: Optional[int] = None
    purchase_price: float = 0.0
    sale_price: float = 0.0
    stock_quantity: int = 0
    min_stock: int = 10
    is_active: bool = True


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    barcode: Optional[str] = None
    category_id: Optional[int] = None
    purchase_price: Optional[float] = None
    sale_price: Optional[float] = None
    stock_quantity: Optional[int] = None
    min_stock: Optional[int] = None
    is_active: Optional[bool] = None


class ProductOut(ProductBase):
    id: int
    image_url: Optional[str] = None
    created_at: datetime
    category: Optional[CategoryOut] = None
    model_config = {"from_attributes": True}


# ─── CUSTOMER ─────────────────────────────────────────────────────────────────
class CustomerBase(BaseModel):
    company_name: str
    phone: str
    email: Optional[str] = None
    stir: Optional[str] = None
    region: Optional[str] = None
    district: Optional[str] = None
    address: Optional[str] = None
    contact_person: Optional[str] = None
    status: str = "active"
    vip_level: int = 0


class CustomerCreate(CustomerBase):
    pass


class CustomerUpdate(BaseModel):
    company_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    stir: Optional[str] = None
    region: Optional[str] = None
    district: Optional[str] = None
    address: Optional[str] = None
    contact_person: Optional[str] = None
    status: Optional[str] = None
    vip_level: Optional[int] = None
    is_active: Optional[bool] = None


class CustomerOut(CustomerBase):
    id: int
    debt: float
    total_purchases: float
    last_purchase_date: Optional[datetime] = None
    is_active: bool
    created_at: datetime
    model_config = {"from_attributes": True}


# ─── WAREHOUSE ────────────────────────────────────────────────────────────────
class WarehouseBase(BaseModel):
    name: str
    location: Optional[str] = None
    manager: Optional[str] = None


class WarehouseCreate(WarehouseBase):
    pass


class WarehouseOut(WarehouseBase):
    id: int
    is_active: bool
    created_at: datetime
    model_config = {"from_attributes": True}


# ─── STOCK MOVEMENT ───────────────────────────────────────────────────────────
class StockMovementCreate(BaseModel):
    product_id: int
    warehouse_id: int
    movement_type: StockMovementType
    quantity: int
    note: Optional[str] = None


class StockMovementOut(BaseModel):
    id: int
    product_id: int
    warehouse_id: int
    movement_type: StockMovementType
    quantity: int
    note: Optional[str] = None
    created_at: datetime
    product: Optional[ProductOut] = None
    warehouse: Optional[WarehouseOut] = None
    model_config = {"from_attributes": True}


# ─── ORDER ────────────────────────────────────────────────────────────────────
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int
    unit_price: float


class OrderItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    total_price: float
    product: Optional[ProductOut] = None
    model_config = {"from_attributes": True}


class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate]
    note: Optional[str] = None


class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    note: Optional[str] = None


class OrderOut(BaseModel):
    id: int
    order_number: str
    customer_id: int
    status: OrderStatus
    total_amount: float
    paid_amount: float
    debt_amount: float
    note: Optional[str] = None
    created_at: datetime
    customer: Optional[CustomerOut] = None
    items: List[OrderItemOut] = []
    model_config = {"from_attributes": True}


# ─── PAYMENT ─────────────────────────────────────────────────────────────────
class PaymentCreate(BaseModel):
    order_id: Optional[int] = None
    customer_id: int
    amount: float
    payment_type: PaymentType
    note: Optional[str] = None


class PaymentOut(BaseModel):
    id: int
    order_id: Optional[int] = None
    customer_id: int
    amount: float
    payment_type: PaymentType
    note: Optional[str] = None
    created_at: datetime
    customer: Optional[CustomerOut] = None
    model_config = {"from_attributes": True}


# ─── NOTIFICATION ─────────────────────────────────────────────────────────────
class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    notification_type: str
    is_read: bool
    created_at: datetime
    model_config = {"from_attributes": True}


# ─── AUDIT LOG ────────────────────────────────────────────────────────────────
class AuditLogOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    action: str
    table_name: Optional[str] = None
    record_id: Optional[int] = None
    details: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime
    user: Optional[UserOut] = None
    model_config = {"from_attributes": True}


# ─── PAGINATION ───────────────────────────────────────────────────────────────
class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    size: int
    pages: int
