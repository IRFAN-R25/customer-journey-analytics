from datetime import datetime
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, EmailStr

# Auth Schemas
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token: Optional[str] = None
    token_type: str = "bearer"
    user: UserOut

# Product Schemas
class ProductOut(BaseModel):
    id: int
    name: str
    description: str
    price: float
    category: str
    image: str
    rating: float
    stock: int
    created_at: datetime

    class Config:
        from_attributes = True

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    image: str
    rating: float = 4.5
    stock: int = 50

# Cart Schemas
class AddToCartRequest(BaseModel):
    product_id: int
    quantity: int = 1

class UpdateCartItemRequest(BaseModel):
    quantity: int

class CartItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    product: ProductOut

    class Config:
        from_attributes = True

class CartOut(BaseModel):
    id: int
    user_id: int
    items: List[CartItemOut] = []
    total_amount: float = 0.0

    class Config:
        from_attributes = True

# Wishlist Schemas
class WishlistToggleRequest(BaseModel):
    product_id: int

class WishlistItemOut(BaseModel):
    id: int
    product_id: int
    created_at: datetime
    product: ProductOut

    class Config:
        from_attributes = True

# Order Schemas
class CheckoutItem(BaseModel):
    product_id: int
    quantity: int

class CheckoutRequest(BaseModel):
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    shipping_address: str
    city: str
    pincode: str
    payment_method: str = "Demo Card"
    items: Optional[List[CheckoutItem]] = None # If null, checkout from DB cart

class OrderItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    price: float
    product: ProductOut

    class Config:
        from_attributes = True

class OrderOut(BaseModel):
    id: int
    order_code: str
    user_id: int
    total_amount: float
    status: str
    payment_method: str
    customer_name: str
    customer_email: str
    customer_phone: str
    shipping_address: str
    city: str
    pincode: str
    created_at: datetime
    items: List[OrderItemOut] = []

    class Config:
        from_attributes = True

# Clickstream Schemas
class EventCreate(BaseModel):
    session_id: str
    event_type: str
    page: str
    product_id: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None

class EventOut(BaseModel):
    id: int
    user_id: Optional[int]
    session_id: str
    event_type: str
    page: str
    product_id: Optional[int]
    timestamp: datetime
    metadata: Optional[Dict[str, Any]] = None

# AI Prediction Schemas
class PredictionInput(BaseModel):
    searches_count: int = 0
    product_views_count: int = 0
    review_views_count: int = 0
    add_to_cart_count: int = 0
    wishlist_count: int = 0
    checkout_started: int = 0 # 0 or 1
    session_duration_secs: int = 60
    unique_products_viewed: int = 1
    previous_purchases: int = 0
    previous_abandoned_carts: int = 0

class PredictionOutput(BaseModel):
    purchase_probability: float
    cart_abandonment_probability: float
    risk_level: str # "High Purchase Probability", "Medium Probability", "High Abandonment Risk"
    features_summary: Dict[str, Any]

class PredictionModelStatus(BaseModel):
    model_name: str
    trained_at: Optional[str]
    is_trained: bool
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    sample_count: int
