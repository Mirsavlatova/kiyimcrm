# Testing Guide — KiyimCRM

## 1. Backend API test (curl)

### Login
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "direktor", "password": "direktor123"}'
```

### Token saqlash
```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "direktor", "password": "direktor123"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

echo $TOKEN
```

### Dashboard
```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/v1/dashboard
```

### Mijozlar
```bash
# List
curl -H "Authorization: Bearer $TOKEN" "http://localhost:8000/api/v1/customers?page=1&size=5"

# Create
curl -X POST http://localhost:8000/api/v1/customers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Test Kompaniya",
    "phone": "+998901234567",
    "region": "Toshkent",
    "status": "active",
    "vip_level": 0
  }'
```

### Mahsulotlar
```bash
# List
curl -H "Authorization: Bearer $TOKEN" "http://localhost:8000/api/v1/products?page=1&size=5"

# Low stock
curl -H "Authorization: Bearer $TOKEN" "http://localhost:8000/api/v1/products?low_stock=true"
```

### Buyurtma yaratish
```bash
curl -X POST http://localhost:8000/api/v1/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "items": [
      {"product_id": 1, "quantity": 2, "unit_price": 50000}
    ],
    "note": "Test buyurtma"
  }'
```

### RBAC tekshirish (403 test)
```bash
# Ombor mudiri bilan hisobotga kirishga urinish
OMBOR_TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "ombor", "password": "ombor123"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

curl -H "Authorization: Bearer $OMBOR_TOKEN" http://localhost:8000/api/v1/reports/sales
# 403 Forbidden kutiladi
```

---

## 2. Swagger UI orqali test

1. Backend ishga tushiring: `uvicorn app.main:app --reload`
2. Brauzerda oching: `http://localhost:8000/docs`
3. "Authorize" tugmasini bosing
4. `/api/v1/auth/login` orqali token oling
5. Token ni `Bearer <token>` formatida kiriting
6. Istalgan endpoint ni sinab ko'ring

---

## 3. Frontend tekshiruv ro'yxati

- [ ] Login sahifasi ochiladi
- [ ] Demo hisoblar bilan kirish ishlaydi
- [ ] Dashboard real ma'lumot ko'rsatadi
- [ ] Mijozlar: qo'shish/tahrirlash/o'chirish ishlaydi
- [ ] Mahsulotlar: CRUD + rasm yuklash ishlaydi
- [ ] Buyurtma yaratishda mahsulot qidiruvi ishlaydi
- [ ] Buyurtma statusini o'zgartirish ishlaydi
- [ ] To'lov qabul qilish mijoz qarzini kamaytiradi
- [ ] Ombor harakati mahsulot sonini o'zgartiradi
- [ ] Bildirishnomalar yangi buyurtmada chiqadi
- [ ] Sidebar RBAC ga mos menyularni ko'rsatadi
- [ ] Hisobotlar sahifasiga faqat direktor/buxgalter kiradi
- [ ] Pagination ishlaydi
- [ ] Qidirish ishlaydi

---

## 4. Database tekshiruv

```bash
# psql da tekshirish
psql -U postgres -d kiyim_kechak

-- Jadvallar
\dt

-- Ma'lumotlar
SELECT COUNT(*) FROM customers;  -- 1000
SELECT COUNT(*) FROM products;   -- 500
SELECT COUNT(*) FROM orders;     -- 300
SELECT COUNT(*) FROM payments;   -- 500
SELECT COUNT(*) FROM warehouses; -- 10
SELECT COUNT(*) FROM users;      -- 4

-- Foydalanuvchilar
SELECT username, role, is_active FROM users;
```

---

## 5. Tez tekshiruv skripti

```bash
#!/bin/bash
BASE="http://localhost:8000/api/v1"

echo "=== KiyimCRM API Test ==="

# Login
echo -n "Login: "
RESPONSE=$(curl -s -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"direktor","password":"direktor123"}')
TOKEN=$(echo $RESPONSE | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('access_token','FAILED'))")
if [ "$TOKEN" != "FAILED" ]; then echo "✅ OK"; else echo "❌ FAILED"; exit 1; fi

H="Authorization: Bearer $TOKEN"

# Dashboard
echo -n "Dashboard: "
CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "$H" $BASE/dashboard)
[ "$CODE" = "200" ] && echo "✅ OK" || echo "❌ $CODE"

# Customers
echo -n "Customers: "
CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "$H" $BASE/customers)
[ "$CODE" = "200" ] && echo "✅ OK" || echo "❌ $CODE"

# Products
echo -n "Products: "
CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "$H" $BASE/products)
[ "$CODE" = "200" ] && echo "✅ OK" || echo "❌ $CODE"

# Orders
echo -n "Orders: "
CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "$H" $BASE/orders)
[ "$CODE" = "200" ] && echo "✅ OK" || echo "❌ $CODE"

echo "=== Test yakunlandi ==="
```
