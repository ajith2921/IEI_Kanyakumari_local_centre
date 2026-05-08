from fastapi import APIRouter, HTTPException, status

from auth import create_access_token, verify_password
from supabase_db import admin_db
from schemas import LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest) -> TokenResponse:
    user = admin_db.select_one("users", {"username": payload.username})

    if not user or not verify_password(payload.password, user.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    token = create_access_token(data={"sub": user["username"]})
    return TokenResponse(access_token=token)
