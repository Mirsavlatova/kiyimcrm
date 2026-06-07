"""
Seed script: 1000 Customer, 500 Product, 300 Order, 500 Payment, 10 Warehouse
"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))

from faker import Faker
from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine
from app.models.all_models import (
    Base, User, Category, Product, Customer, Warehouse,
    Order, OrderItem, Payment, RoleEnum, OrderStatus, PaymentType
)
from app.core.security import get_password_hash
import random, string
from datetime import datetime, timedelta

fake = Faker("ru_RU")
fake_en = Faker("en_US")

REGIONS = ["Toshkent", "Samarqand", "Buxoro", "Andijon", "Farg'ona", "Namangan",
           "Qashqadaryo", "Surxondaryo", "Xorazm", "Navoiy", "Jizzax", "Sirdaryo",
           "Qoraqalpog'iston"]

CATEGORIES = ["Ko'ylaklar", "Shimlar", "Kurtalar", "Kostyumlar", "Kiyimlar",
               "Sport kiyimlari", "Bolalar kiyimi", "Ayollar kiyimi", "Erkaklar kiyimi", "Aksessuarlar"]

def generate_sku():
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=8))


def seed():
    db: Session = SessionLocal()
    print("🌱 Seed boshlandi...")

    # ─── USERS ────────────────────────────────────────────────────────────────
    users_data = [
        ("direktor", "Akbar Toshmatov", "direktor123", RoleEnum.direktor),
        ("sotuv", "Sarvar Xasanov", "sotuv123", RoleEnum.sotuv_menejeri),
        ("ombor", "Jasur Karimov", "ombor123", RoleEnum.ombor_mudiri),
        ("buxgalter", "Nilufar Rahimova", "buxgalter123", RoleEnum.buxgalter),
    ]
    users = []
    for username, full_name, password, role in users_data:
        existing = db.query(User).filter(User.username == username).first()
        if not existing:
            u = User(username=username, full_name=full_name,
                     hashed_password=get_password_hash(password), role=role)
            db.add(u)
            users.append(u)
        else:
            users.append(existing)
    db.commit()
    for u in users:
        db.refresh(u)
    print(f"✅ {len(users_data)} foydalanuvchi yaratildi")

    # ─── CATEGORIES ───────────────────────────────────────────────────────────
    categories = []
    for cat_name in CATEGORIES:
        existing = db.query(Category).filter(Category.name == cat_name).first()
        if not existing:
            c = Category(name=cat_name, description=f"{cat_name} kategoriyasi")
            db.add(c)
            categories.append(c)
        else:
            categories.append(existing)
    db.commit()
    for c in categories:
        db.refresh(c)
    print(f"✅ {len(categories)} kategoriya yaratildi")

    # ─── WAREHOUSES ───────────────────────────────────────────────────────────
    warehouses = []
    for i in range(10):
        w = Warehouse(
            name=f"Ombor #{i+1} - {random.choice(REGIONS)}",
            location=fake_en.address()[:100],
            manager=fake_en.name()
        )
        db.add(w)
        warehouses.append(w)
    db.commit()
    for w in warehouses:
        db.refresh(w)
    print(f"✅ 10 ombor yaratildi")

    # ─── PRODUCTS ─────────────────────────────────────────────────────────────
    products = []
    skus = set()
    for i in range(500):
        sku = generate_sku()
        while sku in skus:
            sku = generate_sku()
        skus.add(sku)
        purchase = round(random.uniform(20000, 200000), 0)
        p = Product(
            name=f"{random.choice(['Premium', 'Classic', 'Standard', 'Elite', 'Basic'])} {fake_en.word().capitalize()} #{i+1}",
            sku=sku,
            barcode=fake_en.ean13(),
            category_id=random.choice(categories).id,
            purchase_price=purchase,
            sale_price=round(purchase * random.uniform(1.3, 2.5), 0),
            stock_quantity=random.randint(0, 500),
            min_stock=random.randint(5, 30),
        )
        db.add(p)
        products.append(p)
    db.commit()
    for p in products:
        db.refresh(p)
    print(f"✅ 500 mahsulot yaratildi")

    # ─── CUSTOMERS ────────────────────────────────────────────────────────────
    customers = []
    for i in range(1000):
        c = Customer(
            company_name=fake_en.company()[:100],
            phone=f"+998{random.randint(90,99)}{random.randint(1000000,9999999)}",
            email=fake_en.email() if random.random() > 0.3 else None,
            stir=str(random.randint(100000000, 999999999)),
            region=random.choice(REGIONS),
            district=fake_en.city()[:50],
            address=fake_en.street_address()[:150],
            contact_person=fake_en.name()[:50],
            status=random.choice(["active", "active", "active", "inactive"]),
            vip_level=random.choices([0, 1, 2, 3], weights=[60, 25, 10, 5])[0],
            debt=0.0,
            total_purchases=0.0,
        )
        db.add(c)
        customers.append(c)
    db.commit()
    for c in customers:
        db.refresh(c)
    print(f"✅ 1000 mijoz yaratildi")

    # ─── ORDERS ───────────────────────────────────────────────────────────────
    orders = []
    all_nums = set()
    for i in range(300):
        num = "ORD-" + "".join(random.choices(string.digits, k=8))
        while num in all_nums:
            num = "ORD-" + "".join(random.choices(string.digits, k=8))
        all_nums.add(num)

        customer = random.choice(customers)
        status = random.choices(
            list(OrderStatus),
            weights=[10, 20, 20, 40, 10]
        )[0]
        days_ago = random.randint(0, 365)
        created = datetime.utcnow() - timedelta(days=days_ago)

        order = Order(
            order_number=num,
            customer_id=customer.id,
            status=status,
            created_by=random.choice(users).id,
            created_at=created
        )
        db.add(order)
        db.flush()

        total = 0.0
        num_items = random.randint(1, 5)
        for _ in range(num_items):
            product = random.choice(products)
            qty = random.randint(1, 20)
            price = product.sale_price
            item_total = qty * price
            total += item_total
            oi = OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=qty,
                unit_price=price,
                total_price=item_total
            )
            db.add(oi)

        paid = round(total * random.uniform(0.0, 1.0), 0) if status != OrderStatus.yangi else 0.0
        order.total_amount = total
        order.paid_amount = paid
        order.debt_amount = total - paid

        customer.total_purchases += total
        customer.debt += (total - paid)
        if not customer.last_purchase_date or customer.last_purchase_date < created:
            customer.last_purchase_date = created

        orders.append(order)

    db.commit()
    for o in orders:
        db.refresh(o)
    print(f"✅ 300 buyurtma yaratildi")

    # ─── PAYMENTS ─────────────────────────────────────────────────────────────
    for i in range(500):
        customer = random.choice(customers)
        order = random.choice(orders) if random.random() > 0.3 else None
        p = Payment(
            order_id=order.id if order else None,
            customer_id=customer.id,
            amount=round(random.uniform(50000, 5000000), 0),
            payment_type=random.choice(list(PaymentType)),
            created_by=random.choice(users).id,
            created_at=datetime.utcnow() - timedelta(days=random.randint(0, 365))
        )
        db.add(p)
    db.commit()
    print(f"✅ 500 to'lov yaratildi")

    db.close()
    print("\n🎉 Seed muvaffaqiyatli tugadi!")
    print("\n👤 Login ma'lumotlari:")
    print("  direktor   / direktor123")
    print("  sotuv      / sotuv123")
    print("  ombor      / ombor123")
    print("  buxgalter  / buxgalter123")


if __name__ == "__main__":
    seed()
