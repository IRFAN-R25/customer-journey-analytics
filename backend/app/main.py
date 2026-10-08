import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import Base, engine
from app.routes import (
    auth,
    products,
    cart,
    wishlist,
    orders,
    events,
    recommendations,
    admin_analytics,
    admin_ai,
    admin_reports,
)
from app.seed.seed_data import ensure_admin_user
from app.ml.predictor import predictor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure tables exist, verify admin account, verify ML model
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized.")

    try:
        logger.info("Ensuring admin user account...")
        ensure_admin_user()
    except Exception as e:
        logger.error("Error verifying admin account: %s", e)

    try:
        logger.info("Checking AI behavior prediction model...")
        predictor.load_or_train()
        logger.info("AI Model ready. Accuracy: %s, F1: %s", predictor.metrics.get("accuracy"), predictor.metrics.get("f1_score"))
    except Exception as e:
        logger.error("Error initializing AI model: %s", e)

    yield
    logger.info("Shutting down application...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    description="Full-stack AI-powered E-Commerce with real clickstream tracking, session journey reconstruction, and machine learning behavioral predictions.",
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow frontend dev & preview servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(auth.router)
app.include_router(products.router)
app.include_router(cart.router)
app.include_router(wishlist.router)
app.include_router(orders.router)
app.include_router(events.router)
app.include_router(recommendations.router)
app.include_router(admin_analytics.router)
app.include_router(admin_ai.router)
app.include_router(admin_reports.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "docs_url": "/docs",
        "api_prefix": "/api"
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "ai_model_trained": predictor.metrics.get("is_trained", False)
    }
