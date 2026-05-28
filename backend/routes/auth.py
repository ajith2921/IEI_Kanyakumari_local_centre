import os
from fastapi import APIRouter, HTTPException, status, Response, Depends, Request

from auth import create_access_token, verify_password, get_current_active_user
from supabase_db import admin_db
from schemas import LoginRequest, TokenResponse
from limiter import limiter

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
def login(request: Request, payload: LoginRequest, response: Response) -> TokenResponse:
    user = admin_db.select_one("users", {"username": payload.username})

    if not user or not verify_password(payload.password, user.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    token = create_access_token(data={"sub": user["username"]})
    
    # Set HTTP-only cookie
    # Use secure=True only if not running on local dev (you can also use an env var)
    is_prod = os.getenv("ENVIRONMENT", "development").lower() == "production"
    
    response.set_cookie(
        key="admin_token",
        value=token,
        httponly=True,
        samesite="lax",
        secure=is_prod,
        max_age=120 * 60,
    )
    
    return TokenResponse(access_token=token)


@router.post("/logout")
def logout(response: Response):
    """Clear the admin_token cookie"""
    response.delete_cookie("admin_token")
    return {"message": "Logged out successfully"}


@router.get("/me")
def get_me(current_user: dict = Depends(get_current_active_user)):
    """Verify session is valid and return user"""
    return {"username": current_user.get("username", "")}
