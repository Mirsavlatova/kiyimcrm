# KiyimCRM — Kiyim-Kechak Ulgurji Savdo Boshqaruv Tizimi

Production-ready CRM tizimi FastAPI backend + React frontend.

---

## 🛠 Texnologiyalar

| Backend | Frontend |
|---------|----------|
| FastAPI | React 18 |
| SQLAlchemy 2.x | Vite 5 |
| Alembic | TailwindCSS |
| PostgreSQL | Zustand |
| JWT Auth | React Query |
| Pydantic v2 | Recharts |

---

## 🚀 Ishga tushirish

### 1. PostgreSQL bazani yarating

```sql
CREATE DATABASE kiyim_kechak;
```

### 2. Backend

```bash
cd backend

# Virtual muhit
python -m venv venv
source venv/Scripts/activate       # Windows (Git Bash)
# source venv/bin/activate          # Linux/Mac

# Dependencylar
pip install -r requirements.txt

# Migration
alembic upgrade head

# Seed ma'lumotlar
python seed.py

# Serverni ishga tushirish
uvicorn app.main:app --reload
```

Backend `http://localhost:8000` da ishlaydi.
Swagger: `http://localhost:8000/docs`

### 3. Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend `http://localhost:5173` da ishlaydi.

---

## 👤 Login ma'lumotlari

| Login | Parol | Rol |
|-------|-------|-----|
| `direktor` | `direktor123` | Direktor |
| `sotuv` | `sotuv123` | Sotuv Menejeri |
| `ombor` | `ombor123` | Ombor Mudiri |
| `buxgalter` | `buxgalter123` | Buxgalter |

---

## 📁 Loyiha tuzilishi

```
kiyim-crm/
├── backend/
│   ├── app/
│   │   ├── core/          # Config, Security (JWT)
│   │   ├── db/            # Database connection
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── routers/       # API endpoints
│   │   └── utils/         # Audit log utility
│   ├── alembic/           # Migrations
│   ├── uploads/products/  # Product images
│   ├── requirements.txt
│   ├── alembic.ini
│   └── seed.py
│
├── frontend/
│   ├── src/
│   │   ├── api/           # Axios API client
│   │   ├── components/    # UI, Layout components
│   │   ├── layouts/       # MainLayout
│   │   ├── pages/         # All pages
│   │   ├── store/         # Zustand stores
│   │   └── utils/         # Formatters, constants
│   ├── package.json
│   └── vite.config.js
│
└── docs/
    └── aws-deploy.md
```

---

## 🔑 RBAC (Role Based Access Control)

| Modul | Direktor | Sotuv | Ombor | Buxgalter |
|-------|----------|-------|-------|-----------|
| Dashboard | ✅ | ✅ | ✅ | ✅ |
| Mijozlar | ✅ | ✅ | ❌ | ✅ |
| Mahsulotlar | ✅ | ✅ | ✅ | ❌ |
| Buyurtmalar | ✅ | ✅ | ❌ | ✅ |
| To'lovlar | ✅ | ✅ | ❌ | ✅ |
| Ombor | ✅ | ❌ | ✅ | ❌ |
| Hisobotlar | ✅ | ❌ | ❌ | ✅ |
| Foydalanuvchilar | ✅ | ❌ | ❌ | ❌ |
| Audit Log | ✅ | ❌ | ❌ | ❌ |

---

## 📡 API Endpoints

```
POST   /api/v1/auth/login
GET    /api/v1/auth/me
GET    /api/v1/dashboard

GET    /api/v1/customers
POST   /api/v1/customers
GET    /api/v1/customers/{id}
PUT    /api/v1/customers/{id}
DELETE /api/v1/customers/{id}

GET    /api/v1/products
POST   /api/v1/products
GET    /api/v1/products/{id}
PUT    /api/v1/products/{id}
DELETE /api/v1/products/{id}
POST   /api/v1/products/{id}/upload-image

GET    /api/v1/orders
POST   /api/v1/orders
GET    /api/v1/orders/{id}
PUT    /api/v1/orders/{id}
DELETE /api/v1/orders/{id}

GET    /api/v1/payments
POST   /api/v1/payments

GET    /api/v1/warehouses
POST   /api/v1/warehouses

GET    /api/v1/stock
POST   /api/v1/stock

GET    /api/v1/notifications
PUT    /api/v1/notifications/{id}/read
PUT    /api/v1/notifications/read-all

GET    /api/v1/audit-logs
GET    /api/v1/reports/sales
```

---

## 🗄️ Database Models

- `users` — Foydalanuvchilar + rollar
- `categories` — Mahsulot kategoriyalari
- `products` — Mahsulotlar (SKU, narx, ombor)
- `customers` — Mijozlar (qarz, VIP)
- `warehouses` — Omborlar
- `stock_movements` — Kirim/chiqim tarixi
- `orders` — Buyurtmalar
- `order_items` — Buyurtma tarkibi
- `payments` — To'lovlar
- `audit_logs` — Barcha o'zgarishlar logi
- `notifications` — Tizim bildirishnomalari
