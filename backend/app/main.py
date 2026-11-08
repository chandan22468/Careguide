import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import settings
from app.database import lifespan
from app.routes import router

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title=settings.app_name,
    description="Backend API for the CareGuide personal care demonstration application.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Accept", "X-Session-ID"],
)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    message = exc.detail if isinstance(exc.detail, str) else "Request could not be completed"
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": message,
            "message": message,
            "success": False,
            "error": {"code": f"http_{exc.status_code}", "message": message},
        },
        headers=exc.headers,
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    issues = [
        {
            "field": ".".join(str(part) for part in error["loc"] if part != "body"),
            "message": error["msg"],
        }
        for error in exc.errors()
    ]
    return JSONResponse(
        status_code=422,
        content={
            "detail": "Request validation failed",
            "message": "Request validation failed",
            "success": False,
            "error": {"code": "validation_error", "message": "Request validation failed", "issues": issues},
        },
    )


app.include_router(router, prefix=settings.api_v1_prefix)
