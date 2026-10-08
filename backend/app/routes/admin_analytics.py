import json
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, distinct
from app.database import get_db
from app.models import User, Product, Order, OrderItem, ClickstreamEvent, CartItem, Wishlist
from app.auth import get_current_admin_user

router = APIRouter(prefix="/api/admin/analytics", tags=["Admin Analytics"])

@router.get("/overview")
def get_overview_metrics(db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    total_customers = db.query(User).filter(User.role == "USER").count()
    total_sessions = db.query(func.count(distinct(ClickstreamEvent.session_id))).scalar() or 0
    total_products = db.query(Product).count()
    total_orders = db.query(Order).count()
    total_revenue = db.query(func.sum(Order.total_amount)).scalar() or 0.0

    product_views = db.query(ClickstreamEvent).filter(ClickstreamEvent.event_type == "product_view").count()
    searches = db.query(ClickstreamEvent).filter(ClickstreamEvent.event_type == "search").count()
    cart_adds = db.query(ClickstreamEvent).filter(ClickstreamEvent.event_type == "add_to_cart").count()
    purchases = db.query(ClickstreamEvent).filter(ClickstreamEvent.event_type == "purchase").count()

    # Conversion rate: purchases / total_sessions * 100
    conversion_rate = round((purchases / total_sessions * 100), 2) if total_sessions > 0 else 0.0

    # Sessions that added to cart vs sessions that purchased
    sessions_carted = db.query(distinct(ClickstreamEvent.session_id)).filter(ClickstreamEvent.event_type == "add_to_cart").all()
    sessions_purchased = db.query(distinct(ClickstreamEvent.session_id)).filter(ClickstreamEvent.event_type == "purchase").all()

    cart_session_set = set(s[0] for s in sessions_carted)
    purchased_session_set = set(s[0] for s in sessions_purchased)

    abandoned_sessions = len(cart_session_set - purchased_session_set)
    cart_abandonment_rate = round((abandoned_sessions / len(cart_session_set) * 100), 2) if len(cart_session_set) > 0 else 0.0

    # Chart 1: Revenue & Orders by date (last 7-14 days)
    recent_orders = db.query(
        func.date(Order.created_at).label("order_date"),
        func.count(Order.id).label("order_count"),
        func.sum(Order.total_amount).label("daily_revenue")
    ).group_by(func.date(Order.created_at)).order_by(func.date(Order.created_at)).limit(14).all()

    revenue_trend = []
    for r in recent_orders:
        revenue_trend.append({
            "date": str(r.order_date),
            "orders": int(r.order_count),
            "revenue": round(float(r.daily_revenue or 0.0), 2)
        })

    # Chart 2: Event type distribution
    event_distribution_query = db.query(
        ClickstreamEvent.event_type,
        func.count(ClickstreamEvent.id)
    ).group_by(ClickstreamEvent.event_type).all()

    event_distribution = [
        {"name": ev[0].replace("_", " ").title(), "type": ev[0], "count": ev[1]}
        for ev in event_distribution_query
    ]

    return {
        "total_customers": total_customers,
        "total_sessions": total_sessions,
        "total_products": total_products,
        "total_orders": total_orders,
        "revenue": round(float(total_revenue), 2),
        "conversion_rate": conversion_rate,
        "cart_abandonment_rate": cart_abandonment_rate,
        "product_views": product_views,
        "searches": searches,
        "revenue_trend": revenue_trend,
        "event_distribution": event_distribution
    }

@router.get("/journeys")
def get_customer_journeys(db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    """Reconstruct customer sessions into visual chronological journeys with outcomes and drop-offs."""
    events = db.query(ClickstreamEvent).order_by(ClickstreamEvent.timestamp.asc()).all()

    # Pre-fetch lookup caches to avoid N+1 queries
    products_map = {p.id: p.name for p in db.query(Product).all()}
    users_map = {u.id: u for u in db.query(User).all()}

    sessions: Dict[str, List[ClickstreamEvent]] = {}
    for ev in events:
        if ev.session_id not in sessions:
            sessions[ev.session_id] = []
        sessions[ev.session_id].append(ev)

    reconstructed_journeys = []
    drop_off_counts = {
        "Home / Landing": 0,
        "Search": 0,
        "Product View": 0,
        "Cart": 0,
        "Checkout": 0
    }

    for session_id, ev_list in sessions.items():
        user_id = next((e.user_id for e in ev_list if e.user_id), None)
        user_name = "Anonymous Visitor"
        user_role = "VISITOR"
        is_admin_session = False

        if user_id and user_id in users_map:
            u = users_map[user_id]
            user_name = u.name
            user_role = u.role
            if u.role == "ADMIN":
                is_admin_session = True

        # Check if session traversed admin-exclusive routes
        if any(e.page and e.page.startswith("/admin") for e in ev_list):
            is_admin_session = True

        first_event = ev_list[0]
        last_event = ev_list[-1]
        duration_secs = max(int((last_event.timestamp - first_event.timestamp).total_seconds()), 10)

        has_purchase = any(e.event_type == "purchase" for e in ev_list)
        has_checkout = any(e.event_type == "checkout_started" for e in ev_list)
        has_cart = any(e.event_type == "add_to_cart" for e in ev_list)
        has_prod_view = any(e.event_type == "product_view" for e in ev_list)
        has_search = any(e.event_type == "search" for e in ev_list)

        if has_purchase:
            outcome = "Purchased"
        elif has_cart:
            outcome = "Abandoned Cart"
        else:
            outcome = "Browsing Only"

        # Determine drop-off point if not purchased - ONLY count real customer sessions!
        if not is_admin_session and not has_purchase:
            if has_checkout:
                drop_off_counts["Checkout"] += 1
            elif has_cart:
                drop_off_counts["Cart"] += 1
            elif has_prod_view:
                drop_off_counts["Product View"] += 1
            elif has_search:
                drop_off_counts["Search"] += 1
            else:
                drop_off_counts["Home / Landing"] += 1

        timeline = []
        for e in ev_list:
            meta = None
            if e.metadata_json:
                try:
                    meta = json.loads(e.metadata_json)
                except Exception:
                    meta = None

            prod_name = None
            if e.product_id:
                prod_name = products_map.get(e.product_id)
            if not prod_name and meta and isinstance(meta, dict):
                prod_name = meta.get("product_name")

            timeline.append({
                "id": e.id,
                "event_type": e.event_type,
                "page": e.page,
                "product_id": e.product_id,
                "product_name": prod_name,
                "timestamp": e.timestamp.strftime("%H:%M:%S"),
                "metadata": meta
            })

        reconstructed_journeys.append({
            "session_id": session_id,
            "user_id": user_id,
            "user_name": user_name,
            "user_role": user_role,
            "is_admin_session": is_admin_session,
            "start_time": first_event.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "duration_secs": duration_secs,
            "event_count": len(ev_list),
            "outcome": outcome,
            "timeline": timeline
        })

    # Sort journeys newest first
    reconstructed_journeys.sort(key=lambda j: j["start_time"], reverse=True)

    return {
        "journeys": reconstructed_journeys[:50],
        "drop_off_summary": [
            {"stage": k, "count": v} for k, v in drop_off_counts.items()
        ]
    }

@router.get("/funnel")
def get_funnel_analytics(db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    """
    Funnel calculation:
    Visitors (Distinct Sessions) -> Product Views -> Add to Cart -> Checkout -> Purchase
    """
    total_sessions = db.query(func.count(distinct(ClickstreamEvent.session_id))).scalar() or 0
    sessions_viewed = db.query(func.count(distinct(ClickstreamEvent.session_id))).filter(ClickstreamEvent.event_type == "product_view").scalar() or 0
    sessions_carted = db.query(func.count(distinct(ClickstreamEvent.session_id))).filter(ClickstreamEvent.event_type == "add_to_cart").scalar() or 0
    sessions_checkout = db.query(func.count(distinct(ClickstreamEvent.session_id))).filter(ClickstreamEvent.event_type == "checkout_started").scalar() or 0
    sessions_purchased = db.query(func.count(distinct(ClickstreamEvent.session_id))).filter(ClickstreamEvent.event_type == "purchase").scalar() or 0

    stages = [
        {"stage": "Visitors", "count": total_sessions},
        {"stage": "Product Views", "count": sessions_viewed},
        {"stage": "Add to Cart", "count": sessions_carted},
        {"stage": "Checkout Started", "count": sessions_checkout},
        {"stage": "Purchase Completed", "count": sessions_purchased}
    ]

    funnel_data = []
    base_count = max(total_sessions, 1)

    for i, s in enumerate(stages):
        cnt = s["count"]
        pct_of_total = round((cnt / base_count) * 100, 1)
        conv_from_prev = 100.0
        drop_from_prev = 0.0
        if i > 0:
            prev_cnt = stages[i - 1]["count"]
            if prev_cnt > 0:
                conv_from_prev = round((cnt / prev_cnt) * 100, 1)
                drop_from_prev = round(100.0 - conv_from_prev, 1)

        funnel_data.append({
            "stage": s["stage"],
            "count": cnt,
            "conversion_rate": pct_of_total,
            "step_conversion": conv_from_prev,
            "drop_off_rate": drop_from_prev
        })

    return funnel_data

@router.get("/customers")
def get_customer_segments(db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    """Customer analytics classified into segments: New Visitor, Browsing, Engaged, Returning Customer, Buyer."""
    users = db.query(User).filter(User.role == "USER").all()

    customers_list = []
    segment_counts = {
        "New Visitor": 0,
        "Browsing": 0,
        "Engaged": 0,
        "Returning Customer": 0,
        "Buyer": 0
    }

    for u in users:
        order_count = db.query(Order).filter(Order.user_id == u.id).count()
        total_spend = db.query(func.sum(Order.total_amount)).filter(Order.user_id == u.id).scalar() or 0.0
        session_count = db.query(func.count(distinct(ClickstreamEvent.session_id))).filter(ClickstreamEvent.user_id == u.id).scalar() or 1
        event_count = db.query(ClickstreamEvent).filter(ClickstreamEvent.user_id == u.id).count()

        # Classification rules:
        if order_count >= 2:
            segment = "Returning Customer"
        elif order_count == 1:
            segment = "Buyer"
        elif event_count > 10:
            segment = "Engaged"
        elif event_count > 2:
            segment = "Browsing"
        else:
            segment = "New Visitor"

        segment_counts[segment] += 1

        customers_list.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "created_at": u.created_at.strftime("%Y-%m-%d"),
            "segment": segment,
            "sessions": session_count,
            "orders": order_count,
            "total_spend": round(float(total_spend), 2),
            "events_count": event_count
        })

    return {
        "customers": customers_list,
        "segment_summary": [
            {"segment": k, "count": v} for k, v in segment_counts.items()
        ]
    }

@router.get("/products")
def get_product_analytics(db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    """Analytics per product: views, searches, wishlist, cart adds, purchases, abandonment."""
    products = db.query(Product).all()
    results = []

    for p in products:
        views = db.query(ClickstreamEvent).filter(
            ClickstreamEvent.product_id == p.id,
            ClickstreamEvent.event_type == "product_view"
        ).count()

        cart_adds = db.query(ClickstreamEvent).filter(
            ClickstreamEvent.product_id == p.id,
            ClickstreamEvent.event_type == "add_to_cart"
        ).count()

        wishlists = db.query(Wishlist).filter(Wishlist.product_id == p.id).count()

        purchases = db.query(func.sum(OrderItem.quantity)).filter(OrderItem.product_id == p.id).scalar() or 0
        revenue = db.query(func.sum(OrderItem.price * OrderItem.quantity)).filter(OrderItem.product_id == p.id).scalar() or 0.0

        abandonment = max(cart_adds - int(purchases), 0)

        results.append({
            "id": p.id,
            "name": p.name,
            "category": p.category,
            "price": p.price,
            "stock": p.stock,
            "views": views,
            "cart_adds": cart_adds,
            "wishlists": wishlists,
            "purchases": int(purchases),
            "revenue": round(float(revenue), 2),
            "abandonment_count": abandonment
        })

    # Sort by views descending
    results.sort(key=lambda x: x["views"], reverse=True)
    return results

@router.get("/clickstream")
def get_clickstream_logs(
    event_type: Optional[str] = None,
    session_id: Optional[str] = None,
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    query = db.query(ClickstreamEvent)
    if event_type and event_type.lower() != "all":
        query = query.filter(ClickstreamEvent.event_type == event_type)
    if session_id:
        query = query.filter(ClickstreamEvent.session_id == session_id)

    events = query.order_by(desc(ClickstreamEvent.timestamp)).limit(limit).all()

    logs = []
    for e in events:
        user_name = "Anonymous"
        if e.user_id:
            u = db.query(User).filter(User.id == e.user_id).first()
            if u:
                user_name = u.name

        prod_name = None
        if e.product_id:
            p = db.query(Product).filter(Product.id == e.product_id).first()
            if p:
                prod_name = p.name

        meta = None
        if e.metadata_json:
            try:
                meta = json.loads(e.metadata_json)
            except Exception:
                pass

        logs.append({
            "id": e.id,
            "session_id": e.session_id,
            "user_name": user_name,
            "event_type": e.event_type,
            "page": e.page,
            "product_name": prod_name,
            "timestamp": e.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "metadata": meta
        })

    return logs

@router.get("/recommendations")
def get_recommendation_analytics(db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    rec_events = db.query(ClickstreamEvent).filter(ClickstreamEvent.event_type == "recommendation_click").all()
    
    total_clicks = len(rec_events)
    clicks_per_product: Dict[int, int] = {}
    for ev in rec_events:
        if ev.product_id:
            clicks_per_product[ev.product_id] = clicks_per_product.get(ev.product_id, 0) + 1

    top_clicked = []
    for pid, clicks in sorted(clicks_per_product.items(), key=lambda x: x[1], reverse=True)[:10]:
        p = db.query(Product).filter(Product.id == pid).first()
        if p:
            top_clicked.append({
                "product_id": pid,
                "product_name": p.name,
                "category": p.category,
                "clicks": clicks
            })

    return {
        "total_recommendation_clicks": total_clicks,
        "top_clicked_recommendations": top_clicked
    }
