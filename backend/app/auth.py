from datetime import UTC, datetime, timedelta
import logging

import jwt
from fastapi import HTTPException, Request, Response
from pwdlib import PasswordHash

from app.config import settings
from app.services import clean_doc, new_id, utc_now

logger = logging.getLogger(__name__)
password_hasher = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return password_hasher.verify(password, password_hash)
    except Exception:
        logger.exception("Password hash verification failed")
        return False


def create_access_token(user_id: str) -> str:
    if len(settings.auth_jwt_secret) < 32:
        raise HTTPException(
            status_code=503,
            detail="Authentication is not configured: AUTH_JWT_SECRET must be at least 32 characters",
        )
    now = datetime.now(UTC)
    return jwt.encode(
        {
            "sub": user_id,
            "iat": now,
            "exp": now + timedelta(seconds=settings.auth_cookie_max_age),
            "iss": "careguide-api",
        },
        settings.auth_jwt_secret,
        algorithm="HS256",
    )


def set_auth_cookie(response: Response, user_id: str, token: str | None = None) -> None:
    response.set_cookie(
        key=settings.auth_cookie_name,
        value=token or create_access_token(user_id),
        max_age=settings.auth_cookie_max_age,
        httponly=True,
        secure=settings.environment.lower() in {"production", "prod"},
        samesite="lax",
        path="/",
    )


def clear_auth_cookie(response: Response) -> None:
    response.delete_cookie(
        key=settings.auth_cookie_name,
        httponly=True,
        secure=settings.environment.lower() in {"production", "prod"},
        samesite="lax",
        path="/",
    )


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get(settings.auth_cookie_name)
    if not token or len(settings.auth_jwt_secret) < 32:
        raise HTTPException(status_code=401, detail="Please sign in to continue")
    try:
        payload = jwt.decode(
            token,
            settings.auth_jwt_secret,
            algorithms=["HS256"],
            issuer="careguide-api",
            options={"require": ["sub", "exp", "iat", "iss"]},
        )
    except jwt.InvalidTokenError as exc:
        raise HTTPException(status_code=401, detail="Your session expired; please sign in again") from exc

    database = request.app.state.database
    user = await database.users.find_one({"id": payload["sub"]})
    if user is None:
        raise HTTPException(status_code=401, detail="Account not found; please sign in again")
    return clean_doc(user)


def public_user(user: dict) -> dict:
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "createdAt": user["createdAt"],
    }


async def create_user_session(database, user: dict) -> dict:
    session_id = user.get("sessionId")
    now = utc_now()
    if session_id:
        existing = await database.sessions.find_one(
            {"sessionId": session_id, "userId": user["id"]}
        )
        if existing:
            await database.sessions.update_one(
                {"sessionId": session_id},
                {"$set": {"lastSeenAt": now}},
            )
            return clean_doc(await database.sessions.find_one({"sessionId": session_id}))

    session_id = new_id()
    session = {
        "sessionId": session_id,
        "userId": user["id"],
        "name": user["name"],
        "email": user["email"],
        "selectedCategories": [],
        "concerns": [],
        "goals": [],
        "onboardingCompleted": False,
        "createdAt": now,
        "lastSeenAt": now,
    }
    await database.sessions.insert_one(session)
    await database.users.update_one(
        {"id": user["id"]}, {"$set": {"sessionId": session_id}}
    )
    return clean_doc(session)


async def require_owned_session(database, session_id: str, request: Request) -> dict:
    user = await get_current_user(request)
    session = await database.sessions.find_one(
        {"sessionId": session_id, "userId": user["id"]}
    )
    if session is None:
        raise HTTPException(status_code=404, detail="Care session not found")
    await database.sessions.update_one(
        {"sessionId": session_id, "userId": user["id"]},
        {"$set": {"lastSeenAt": utc_now()}},
    )
    return clean_doc(session)
