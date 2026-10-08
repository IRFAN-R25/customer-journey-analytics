from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, Cart
from app.schemas import UserRegister, UserLogin, UserOut, TokenResponse
from app.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists"
        )
    
    hashed = hash_password(user_data.password)
    new_user = User(
        name=user_data.name.strip(),
        email=user_data.email.lower().strip(),
        password_hash=hashed,
        role="USER"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Initialize empty cart for user
    cart = Cart(user_id=new_user.id)
    db.add(cart)
    db.commit()

    token = create_access_token(data={"sub": str(new_user.id), "email": new_user.email, "role": new_user.role})
    return TokenResponse(access_token=token, token=token, token_type="bearer", user=UserOut.model_validate(new_user))

@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    identifier = credentials.email.lower().strip()
    user = db.query(User).filter(User.email == identifier).first()
    if not user and identifier == "admin":
        user = db.query(User).filter(User.role == "ADMIN").first()

    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Ensure cart exists
    if not user.cart:
        cart = Cart(user_id=user.id)
        db.add(cart)
        db.commit()

    token = create_access_token(data={"sub": str(user.id), "email": user.email, "role": user.role})
    return TokenResponse(access_token=token, token=token, token_type="bearer", user=UserOut.model_validate(user))

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return UserOut.model_validate(current_user)

@router.put("/profile", response_model=UserOut)
def update_profile(data: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if "name" in data and data["name"].strip():
        current_user.name = data["name"].strip()
    db.commit()
    db.refresh(current_user)
    return UserOut.model_validate(current_user)
