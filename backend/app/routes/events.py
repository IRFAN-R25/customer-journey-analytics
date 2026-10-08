import json
from typing import Optional, List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.models import ClickstreamEvent, Product, User
from app.schemas import EventCreate, EventOut, ProductOut
from app.auth import get_optional_current_user, get_current_user

router = APIRouter(prefix="/api/events", tags=["Clickstream Events"])

@router.post("", status_code=status.HTTP_201_CREATED)
def record_event(
    event_data: EventCreate,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    metadata_str = None
    if event_data.metadata:
        metadata_str = json.dumps(event_data.metadata)

    event = ClickstreamEvent(
        user_id=current_user.id if current_user else None,
        session_id=event_data.session_id,
        event_type=event_data.event_type,
        page=event_data.page,
        product_id=event_data.product_id,
        metadata_json=metadata_str
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    return {"status": "success", "event_id": event.id}

@router.get("/user-history")
def get_user_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Returns recently viewed products and recent searches for the logged-in user"""
    # Recently viewed products
    recent_views = db.query(ClickstreamEvent).filter(
        ClickstreamEvent.user_id == current_user.id,
        ClickstreamEvent.event_type == "product_view",
        ClickstreamEvent.product_id.isnot(None)
    ).order_by(desc(ClickstreamEvent.timestamp)).limit(10).all()

    viewed_ids = []
    seen = set()
    for ev in recent_views:
        if ev.product_id and ev.product_id not in seen:
            seen.add(ev.product_id)
            viewed_ids.append(ev.product_id)

    viewed_products = []
    if viewed_ids:
        prods = db.query(Product).filter(Product.id.in_(viewed_ids)).all()
        # Preserve order
        prod_map = {p.id: p for p in prods}
        for pid in viewed_ids:
            if pid in prod_map:
                viewed_products.append(ProductOut.model_validate(prod_map[pid]))

    # Recent searches
    recent_searches = db.query(ClickstreamEvent).filter(
        ClickstreamEvent.user_id == current_user.id,
        ClickstreamEvent.event_type == "search"
    ).order_by(desc(ClickstreamEvent.timestamp)).limit(5).all()

    searches = []
    for ev in recent_searches:
        if ev.metadata_json:
            try:
                meta = json.loads(ev.metadata_json)
                q = meta.get("keyword") or meta.get("query")
                if q and q not in searches:
                    searches.append(q)
            except Exception:
                pass

    return {
        "recently_viewed": viewed_products,
        "recent_searches": searches
    }
