import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database import get_db
from app.models import Order, OrderItem, Product, Cart, CartItem, User, ClickstreamEvent
from app.schemas import CheckoutRequest, OrderOut, OrderItemOut, ProductOut
from app.auth import get_current_user

router = APIRouter(prefix="/api/orders", tags=["Orders"])

def build_order_response(order: Order) -> OrderOut:
    items_out = []
    for item in order.items:
        if item.product:
            items_out.append(
                OrderItemOut(
                    id=item.id,
                    product_id=item.product_id,
                    quantity=item.quantity,
                    price=item.price,
                    product=ProductOut.model_validate(item.product)
                )
            )
    return OrderOut(
        id=order.id,
        order_code=order.order_code,
        user_id=order.user_id,
        total_amount=order.total_amount,
        status=order.status,
        payment_method=order.payment_method,
        customer_name=order.customer_name,
        customer_email=order.customer_email,
        customer_phone=order.customer_phone,
        shipping_address=order.shipping_address,
        city=order.city,
        pincode=order.pincode,
        created_at=order.created_at,
        items=items_out
    )

@router.post("/checkout", response_model=OrderOut)
def checkout(request: CheckoutRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    
    # Items can come from request or from DB cart
    items_to_order = []
    if request.items and len(request.items) > 0:
        for item_req in request.items:
            product = db.query(Product).filter(Product.id == item_req.product_id).first()
            if product:
                items_to_order.append((product, item_req.quantity))
    elif cart and len(cart.items) > 0:
        for cart_item in cart.items:
            if cart_item.product:
                items_to_order.append((cart_item.product, cart_item.quantity))

    if not items_to_order:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot place order: Cart is empty"
        )

    # Calculate total and generate order code
    total_amount = sum(prod.price * qty for prod, qty in items_to_order)
    order_code = f"ORD-{uuid.uuid4().hex[:8].upper()}"

    new_order = Order(
        order_code=order_code,
        user_id=current_user.id,
        total_amount=round(total_amount, 2),
        status="COMPLETED",
        payment_method=request.payment_method,
        customer_name=request.customer_name,
        customer_email=request.customer_email,
        customer_phone=request.customer_phone,
        shipping_address=request.shipping_address,
        city=request.city,
        pincode=request.pincode
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    for prod, qty in items_to_order:
        order_item = OrderItem(
            order_id=new_order.id,
            product_id=prod.id,
            quantity=qty,
            price=prod.price
        )
        db.add(order_item)

    # Clear user's cart
    if cart:
        for c_item in cart.items:
            db.delete(c_item)

    db.commit()
    db.refresh(new_order)
    return build_order_response(new_order)

@router.get("", response_model=List[OrderOut])
def get_user_orders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(desc(Order.created_at)).all()
    return [build_order_response(o) for o in orders]

@router.get("/{order_id}", response_model=OrderOut)
def get_order_by_id(order_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != current_user.id and current_user.role != "ADMIN":
        raise HTTPException(status_code=403, detail="Not authorized to view this order")
    return build_order_response(order)
