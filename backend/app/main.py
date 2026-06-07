from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings
from app.db.database import Base, engine

# Import all models so Alembic can detect them
from app.models import all_models  # noqa

from app.routers.auth import router as auth_router
from app.routers.customers import router as customers_router
from app.routers.products import router as products_router, cat_router
from app.routers.orders import router as orders_router
from app.routers.other_routers import (
    payments_router, warehouses_router, stock_router,
    notifications_router, audit_router, dashboard_router, reports_router
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="KiyimCRM — Kiyim-Kechak Ulgurji Savdo Boshqaruv Tizimi",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for product images
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Register routers
prefix = settings.API_PREFIX
app.include_router(auth_router, prefix=prefix)
app.include_router(customers_router, prefix=prefix)
app.include_router(products_router, prefix=prefix)
app.include_router(cat_router, prefix=prefix)
app.include_router(orders_router, prefix=prefix)
app.include_router(payments_router, prefix=prefix)
app.include_router(warehouses_router, prefix=prefix)
app.include_router(stock_router, prefix=prefix)
app.include_router(notifications_router, prefix=prefix)
app.include_router(audit_router, prefix=prefix)
app.include_router(dashboard_router, prefix=prefix)
app.include_router(reports_router, prefix=prefix)


@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
        "status": "running"
    }


@app.get("/health")
def health():
    return {"status": "ok"}
