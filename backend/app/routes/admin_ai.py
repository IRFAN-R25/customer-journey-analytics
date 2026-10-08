from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.database import get_db
from app.models import ClickstreamEvent, User, Order
from app.schemas import PredictionInput, PredictionOutput, PredictionModelStatus
from app.auth import get_current_admin_user
from app.ml.predictor import predictor

router = APIRouter(prefix="/api/admin/ai", tags=["Admin AI Predictions"])

@router.get("/status", response_model=PredictionModelStatus)
def get_model_status(admin: User = Depends(get_current_admin_user)):
    return PredictionModelStatus(**predictor.metrics)

@router.post("/predict", response_model=PredictionOutput)
def predict_behavior(input_data: PredictionInput, admin: User = Depends(get_current_admin_user)):
    res = predictor.predict(input_data.model_dump())
    return PredictionOutput(**res)

@router.post("/train", response_model=PredictionModelStatus)
def retrain_model(admin: User = Depends(get_current_admin_user)):
    metrics = predictor.train()
    return PredictionModelStatus(**metrics)

@router.get("/sessions")
def get_live_ai_evaluated_sessions(db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    """
    Extracts sessions from the database, computes behavior features from real clickstream events,
    and runs the AI model to calculate purchase and abandonment probabilities.
    """
    # Fetch distinct sessions
    recent_events = db.query(ClickstreamEvent).order_by(desc(ClickstreamEvent.timestamp)).limit(500).all()

    # Group by session_id
    sessions_map: Dict[str, List[ClickstreamEvent]] = {}
    for ev in recent_events:
        if ev.session_id not in sessions_map:
            sessions_map[ev.session_id] = []
        sessions_map[ev.session_id].append(ev)

    results = []
    for sess_id, events in sessions_map.items():
        events_sorted = sorted(events, key=lambda x: x.timestamp)
        first_time = events_sorted[0].timestamp
        last_time = events_sorted[-1].timestamp
        duration_secs = max(int((last_time - first_time).total_seconds()), 15)

        user_id = next((e.user_id for e in events if e.user_id), None)
        user_name = "Anonymous Visitor"
        if user_id:
            u = db.query(User).filter(User.id == user_id).first()
            if u:
                user_name = u.name

        # Compute feature counts
        searches_count = sum(1 for e in events if e.event_type == "search")
        product_views_count = sum(1 for e in events if e.event_type == "product_view")
        review_views_count = sum(1 for e in events if e.event_type == "review_view")
        add_to_cart_count = sum(1 for e in events if e.event_type == "add_to_cart")
        wishlist_count = sum(1 for e in events if e.event_type == "wishlist")
        checkout_started = 1 if any(e.event_type == "checkout_started" for e in events) else 0
        has_purchased = any(e.event_type == "purchase" for e in events)

        unique_prods = len(set(e.product_id for e in events if e.product_id))

        prev_purchases = 0
        prev_abandoned = 0
        if user_id:
            prev_purchases = db.query(Order).filter(Order.user_id == user_id).count()

        features = {
            "searches_count": searches_count,
            "product_views_count": product_views_count,
            "review_views_count": review_views_count,
            "add_to_cart_count": add_to_cart_count,
            "wishlist_count": wishlist_count,
            "checkout_started": checkout_started,
            "session_duration_secs": duration_secs,
            "unique_products_viewed": max(unique_prods, 1),
            "previous_purchases": prev_purchases,
            "previous_abandoned_carts": prev_abandoned
        }

        prediction = predictor.predict(features)

        # Actual outcome
        if has_purchased:
            actual_outcome = "Purchased"
        elif add_to_cart_count > 0:
            actual_outcome = "Abandoned Cart"
        else:
            actual_outcome = "Browsing Only"

        results.append({
            "session_id": sess_id,
            "user_id": user_id,
            "user_name": user_name,
            "event_count": len(events),
            "duration_secs": duration_secs,
            "last_active": last_time.strftime("%Y-%m-%d %H:%M:%S"),
            "purchase_probability": prediction["purchase_probability"],
            "cart_abandonment_probability": prediction["cart_abandonment_probability"],
            "risk_level": prediction["risk_level"],
            "features": features,
            "actual_outcome": actual_outcome
        })

    return results
