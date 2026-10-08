from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Wishlist, Product, User
from app.schemas import WishlistItemOut, WishlistToggleRequest, ProductOut
from app.auth import get_current_user

router = APIRouter(prefix="/api/wishlist", tags=["Wishlist"])

@router.get("", response_model=List[WishlistItemOut])
def get_wishlist(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    items = db.query(Wishlist).filter(Wishlist.user_id == current_user.id).all()
    results = []
    for item in items:
        if item.product:
            results.append(
                WishlistItemOut(
                    id=item.id,
                    product_id=item.product_id,
                    created_at=item.created_at,
                    product=ProductOut.model_validate(item.product)
                )
            )
    return results

@router.post("/toggle")
def toggle_wishlist(req: WishlistToggleRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == req.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    existing = db.query(Wishlist).filter(
        Wishlist.user_id == current_user.id,
        Wishlist.product_id == req.product_id
    ).first()

    if existing:
        db.delete(existing)
        db.commit()
        return {"action": "removed", "product_id": req.product_id, "in_wishlist": False}
    else:
        new_item = Wishlist(user_id=current_user.id, product_id=req.product_id)
        db.add(new_item)
        db.commit()
        return {"action": "added", "product_id": req.product_id, "in_wishlist": True}

@router.delete("/{product_id}")
def remove_from_wishlist(product_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(Wishlist).filter(
        Wishlist.user_id == current_user.id,
        Wishlist.product_id == product_id
    ).first()
    if existing:
        db.delete(existing)
        db.commit()
    return {"message": "Removed from wishlist"}
