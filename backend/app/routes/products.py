from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from app.database import get_db
from app.models import Product, User
from app.schemas import ProductOut, ProductCreate
from app.auth import get_current_admin_user

router = APIRouter(prefix="/api/products", tags=["Products"])

@router.get("", response_model=List[ProductOut])
def get_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: Optional[str] = "featured", # "price_asc", "price_desc", "rating", "newest"
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    query = db.query(Product)

    if category and category.lower() != "all":
        query = query.filter(Product.category.ilike(category))

    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(or_(Product.name.ilike(term), Product.description.ilike(term), Product.category.ilike(term)))

    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    if sort_by == "price_asc":
        query = query.order_by(asc(Product.price))
    elif sort_by == "price_desc":
        query = query.order_by(desc(Product.price))
    elif sort_by == "rating":
        query = query.order_by(desc(Product.rating))
    elif sort_by == "newest":
        query = query.order_by(desc(Product.created_at))
    else:
        query = query.order_by(Product.id.asc())

    products = query.offset(offset).limit(limit).all()
    return [ProductOut.model_validate(p) for p in products]

@router.get("/categories")
def get_categories(db: Session = Depends(get_db)):
    categories = db.query(Product.category).distinct().all()
    return [c[0] for c in categories]

@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return ProductOut.model_validate(product)

@router.post("", response_model=ProductOut)
def create_product(data: ProductCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    product = Product(**data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return ProductOut.model_validate(product)

@router.put("/{product_id}", response_model=ProductOut)
def update_product(product_id: int, data: ProductCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for key, val in data.model_dump().items():
        setattr(product, key, val)
    db.commit()
    db.refresh(product)
    return ProductOut.model_validate(product)

@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), admin: User = Depends(get_current_admin_user)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully"}
