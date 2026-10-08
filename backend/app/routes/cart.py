from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Cart, CartItem, Product, User
from app.schemas import AddToCartRequest, UpdateCartItemRequest, CartOut, CartItemOut, ProductOut
from app.auth import get_current_user

router = APIRouter(prefix="/api/cart", tags=["Cart"])

def get_or_create_cart(user_id: int, db: Session) -> Cart:
    cart = db.query(Cart).filter(Cart.user_id == user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart

def build_cart_response(cart: Cart) -> CartOut:
    items_out = []
    total = 0.0
    for item in cart.items:
        if item.product:
            total += item.product.price * item.quantity
            items_out.append(
                CartItemOut(
                    id=item.id,
                    product_id=item.product_id,
                    quantity=item.quantity,
                    product=ProductOut.model_validate(item.product)
                )
            )
    return CartOut(
        id=cart.id,
        user_id=cart.user_id,
        items=items_out,
        total_amount=round(total, 2)
    )

@router.get("", response_model=CartOut)
def get_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart = get_or_create_cart(current_user.id, db)
    return build_cart_response(cart)

@router.post("/add", response_model=CartOut)
def add_to_cart(request: AddToCartRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == request.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    cart = get_or_create_cart(current_user.id, db)
    cart_item = db.query(CartItem).filter(CartItem.cart_id == cart.id, CartItem.product_id == request.product_id).first()

    if cart_item:
        cart_item.quantity += request.quantity
    else:
        cart_item = CartItem(cart_id=cart.id, product_id=request.product_id, quantity=request.quantity)
        db.add(cart_item)

    db.commit()
    db.refresh(cart)
    return build_cart_response(cart)

@router.put("/item/{item_id}", response_model=CartOut)
def update_cart_item(item_id: int, request: UpdateCartItemRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart = get_or_create_cart(current_user.id, db)
    cart_item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart.id).first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    if request.quantity <= 0:
        db.delete(cart_item)
    else:
        cart_item.quantity = request.quantity

    db.commit()
    db.refresh(cart)
    return build_cart_response(cart)

@router.delete("/item/{item_id}", response_model=CartOut)
def remove_cart_item(item_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart = get_or_create_cart(current_user.id, db)
    cart_item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart.id).first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    db.delete(cart_item)
    db.commit()
    db.refresh(cart)
    return build_cart_response(cart)

@router.delete("/clear")
def clear_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    cart = get_or_create_cart(current_user.id, db)
    for item in cart.items:
        db.delete(item)
    db.commit()
    return {"message": "Cart cleared"}
