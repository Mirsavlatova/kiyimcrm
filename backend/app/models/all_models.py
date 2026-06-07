from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.database import Base


class RoleEnum(str, enum.Enum):
    direktor = "direktor"
    sotuv_menejeri = "sotuv_menejeri"
    ombor_mudiri = "ombor_mudiri"
    buxgalter = "buxgalter"


class OrderStatus(str, enum.Enum):
    yangi = "yangi"
    tasdiqlangan = "tasdiqlangan"
    jonatilgan = "jonatilgan"
    yetkazilgan = "yetkazilgan"
    bekor_qilingan = "bekor_qilingan"


class PaymentType(str, enum.Enum):
    naqd = "naqd"
    click = "click"
    payme = "payme"
    bank = "bank"


class StockMovementType(str, enum.Enum):
    kirim = "kirim"
    chiqim = "chiqim"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=True)
    hashed_password = Column(String(200), nullable=False)
    role = Column(SAEnum(RoleEnum), nullable=False, default=RoleEnum.sotuv_menejeri)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    orders = relationship("Order", back_populates="created_by_user")
    audit_logs = relationship("AuditLog", back_populates="user")


class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    sku = Column(String(50), unique=True, nullable=False, index=True)
    barcode = Column(String(50), nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    purchase_price = Column(Float, nullable=False, default=0.0)
    sale_price = Column(Float, nullable=False, default=0.0)
    stock_quantity = Column(Integer, default=0)
    min_stock = Column(Integer, default=10)
    image_url = Column(String(300), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    category = relationship("Category", back_populates="products")
    order_items = relationship("OrderItem", back_populates="product")
    stock_movements = relationship("StockMovement", back_populates="product")


class Customer(Base):
    __tablename__ = "customers"
    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(200), nullable=False)
    phone = Column(String(20), nullable=False)
    email = Column(String(100), nullable=True)
    stir = Column(String(20), nullable=True)
    region = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)
    contact_person = Column(String(100), nullable=True)
    status = Column(String(20), default="active")
    debt = Column(Float, default=0.0)
    vip_level = Column(Integer, default=0)
    total_purchases = Column(Float, default=0.0)
    last_purchase_date = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    orders = relationship("Order", back_populates="customer")
    payments = relationship("Payment", back_populates="customer")


class Warehouse(Base):
    __tablename__ = "warehouses"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    location = Column(String(200), nullable=True)
    manager = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    stock_movements = relationship("StockMovement", back_populates="warehouse")


class StockMovement(Base):
    __tablename__ = "stock_movements"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=False)
    movement_type = Column(SAEnum(StockMovementType), nullable=False)
    quantity = Column(Integer, nullable=False)
    note = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    product = relationship("Product", back_populates="stock_movements")
    warehouse = relationship("Warehouse", back_populates="stock_movements")


class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    status = Column(SAEnum(OrderStatus), default=OrderStatus.yangi)
    total_amount = Column(Float, default=0.0)
    paid_amount = Column(Float, default=0.0)
    debt_amount = Column(Float, default=0.0)
    note = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    customer = relationship("Customer", back_populates="orders")
    created_by_user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")


class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    amount = Column(Float, nullable=False)
    payment_type = Column(SAEnum(PaymentType), nullable=False)
    note = Column(Text, nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    customer = relationship("Customer", back_populates="payments")
    order = relationship("Order", back_populates="payments")


class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    table_name = Column(String(100), nullable=True)
    record_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="audit_logs")


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), nullable=False)
    is_read = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
