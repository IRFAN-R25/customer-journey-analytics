import json
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.database import get_db
from app.models import Product, ClickstreamEvent, Wishlist, CartItem, Cart, User
from app.schemas import ProductOut
from app.auth import get_optional_current_user

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])

@router.get("", response_model=List[ProductOut])
def get_recommendations(
    product_id: Optional[int] = None,
    limit: int = Query(6, ge=1, le=20),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Explainable Product Recommendations:
    1. If product_id is given (Product Details page): Recommend products in the same category, excluding current product.
    2. If user is logged in: Check categories of their recent views, wishlist, cart, or purchases.
    3. Fallback: Top-rated and popular products.
    """
    recommended = []
    excluded_ids = set()

    if product_id:
        excluded_ids.add(product_id)
        current_prod = db.query(Product).filter(Product.id == product_id).first()
        if current_prod:
            same_cat = db.query(Product).filter(
                Product.category == current_prod.category,
                Product.id != product_id
            ).order_by(desc(Product.rating)).limit(limit).all()
            recommended.extend(same_cat)
            for p in same_cat:
                excluded_ids.add(p.id)

    # If still need more and user is logged in:
    if len(recommended) < limit and current_user:
        # Check user's recent product views to determine preferred category
        recent_events = db.query(ClickstreamEvent).filter(
            ClickstreamEvent.user_id == current_user.id,
            ClickstreamEvent.event_type.in_(["product_view", "add_to_cart", "wishlist"])
        ).order_by(desc(ClickstreamEvent.timestamp)).limit(15).all()

        category_counts = {}
        for ev in recent_events:
            if ev.product_id:
                p = db.query(Product).filter(Product.id == ev.product_id).first()
                if p:
                    category_counts[p.category] = category_counts.get(p.category, 0) + 1

        if category_counts:
            fav_cat = max(category_counts, key=category_counts.get)
            cat_prods = db.query(Product).filter(
                Product.category == fav_cat,
                ~Product.id.in_(list(excluded_ids) or [0])
            ).order_by(desc(Product.rating)).limit(limit - len(recommended)).all()

            for p in cat_prods:
                recommended.append(p)
                excluded_ids.add(p.id)

    # Fallback to highest rated / popular products
    if len(recommended) < limit:
        needed = limit - len(recommended)
        top_prods = db.query(Product).filter(
            ~Product.id.in_(list(excluded_ids) or [0])
        ).order_by(desc(Product.rating), desc(Product.stock)).limit(needed).all()
        recommended.extend(top_prods)

    return [ProductOut.model_validate(p) for p in recommended[:limit]]
