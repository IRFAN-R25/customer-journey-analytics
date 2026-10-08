import io
import csv
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.models import Order, ClickstreamEvent, Product, User
from app.auth import get_current_admin_user
from app.ml.predictor import predictor

router = APIRouter(prefix="/api/admin/reports", tags=["Admin Reports"])

def get_date_filter(period: str):
    now = datetime.utcnow()
    if period == "today":
        return now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "7days":
        return now - timedelta(days=7)
    elif period == "30days":
        return now - timedelta(days=30)
    return None

@router.get("/export-csv")
def export_csv_report(
    report_type: str = Query(..., description="sales, events, products, customers"),
    period: str = Query("30days", description="today, 7days, 30days, all"),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin_user)
):
    output = io.StringIO()
    writer = csv.writer(output)
    date_cutoff = get_date_filter(period)

    if report_type == "sales":
        writer.writerow(["Order Code", "Customer Name", "Customer Email", "Total Amount (₹)", "Payment Method", "Status", "Date"])
        q = db.query(Order)
        if date_cutoff:
            q = q.filter(Order.created_at >= date_cutoff)
        orders = q.order_by(desc(Order.created_at)).all()
        for o in orders:
            writer.writerow([o.order_code, o.customer_name, o.customer_email, o.total_amount, o.payment_method, o.status, o.created_at.strftime("%Y-%m-%d %H:%M")])
        filename = f"sales_report_{period}.csv"

    elif report_type == "events":
        writer.writerow(["Event ID", "Session ID", "User ID", "Event Type", "Page", "Product ID", "Timestamp"])
        q = db.query(ClickstreamEvent)
        if date_cutoff:
            q = q.filter(ClickstreamEvent.timestamp >= date_cutoff)
        events = q.order_by(desc(ClickstreamEvent.timestamp)).limit(500).all()
        for e in events:
            writer.writerow([e.id, e.session_id, e.user_id or "Anonymous", e.event_type, e.page, e.product_id or "", e.timestamp.strftime("%Y-%m-%d %H:%M:%S")])
        filename = f"clickstream_report_{period}.csv"

    elif report_type == "products":
        writer.writerow(["Product ID", "Name", "Category", "Price (₹)", "Rating", "Stock"])
        products = db.query(Product).order_by(Product.id).all()
        for p in products:
            writer.writerow([p.id, p.name, p.category, p.price, p.rating, p.stock])
        filename = f"products_report_{period}.csv"

    else: # customers
        writer.writerow(["User ID", "Name", "Email", "Role", "Registered Date"])
        users = db.query(User).filter(User.role == "USER").all()
        for u in users:
            writer.writerow([u.id, u.name, u.email, u.role, u.created_at.strftime("%Y-%m-%d")])
        filename = f"customers_report_{period}.csv"

    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
