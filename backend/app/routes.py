from datetime import UTC, date, datetime, timedelta
import re
from uuid import uuid4

from fastapi import APIRouter, File, HTTPException, Query, Request, Response, UploadFile
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError

from app.auth import (
    clear_auth_cookie,
    create_access_token,
    create_user_session,
    get_current_user,
    hash_password,
    public_user,
    set_auth_cookie,
    verify_password,
)
from app.schemas import (
    ChatCreate,
    Category,
    LoginRequest,
    ProgressCreate,
    ProgressUpdate,
    RegisterRequest,
    RoutineCreate,
    RoutineStatus,
    RoutineStatusUpdate,
    RoutineUpdate,
    SessionCreate,
    SessionProductCreate,
    SessionProductUpdate,
    SessionUpdate,
    SupportTicketCreate,
    UploadDelete,
    response,
)
from app.services import (
    answer_with_gemini,
    clean_doc,
    db_from,
    delete_progress_photo,
    get_product,
    new_id,
    record_activity,
    require_session,
    upload_progress_photo,
    utc_now,
)

router = APIRouter()


def _session_id(value) -> str:
    return str(value)


def _session_header(request: Request) -> str:
    session_id = request.headers.get("X-Session-ID", "").strip()
    if not session_id:
        raise HTTPException(status_code=400, detail="X-Session-ID header is required")
    return session_id


def _dump(model, *, exclude_unset: bool = False) -> dict:
    return model.model_dump(by_alias=True, exclude_unset=exclude_unset, mode="json")


def _category_label(value: str | None) -> str:
    normalized = (value or "").strip().lower().replace(" ", "_")
    labels = {
        "hair": "Hair",
        "beard": "Beard",
        "skin": "Skin",
        "general_wellness": "Wellness",
        "other": "Other",
    }
    return labels.get(normalized, "Other")


def _product_out(product: dict | None) -> dict | None:
    if product is None:
        return None
    result = clean_doc(product)
    precautions = result.get("precautions")
    if isinstance(precautions, str):
        result["precautions"] = [precautions] if precautions else []
    result["category"] = _category_label(result.get("category"))
    result["shortDescription"] = result.get("shortDescription") or result.get("description", "")
    result["isActive"] = result.get("isActive", True)
    result.setdefault("ingredients", [])
    result.setdefault("benefits", [])
    result.setdefault("faqs", [])
    return result


async def _my_product_out(database, entry: dict) -> dict:
    result = clean_doc(entry)
    result["personalNotes"] = result.pop("notes", result.get("personalNotes", ""))
    result["product"] = _product_out(await get_product(database, result["productId"]))
    return result


def _routine_out(routine: dict) -> dict:
    result = clean_doc(routine)
    result["scheduledDate"] = result.get("date") or result.get("scheduledDate")
    result["category"] = _category_label(result.get("category"))
    result["timeOfDay"] = result.get("timeOfDay") or result.get("time") or "Morning"
    return result


def _progress_out(entry: dict) -> dict:
    result = clean_doc(entry)
    result["careType"] = _category_label(result.get("category") or result.get("careType"))
    result["entryDate"] = result.get("date") or result.get("entryDate")
    result["condition"] = result.get("condition") or result.get("observationCategory")
    scale = result.get("scale", result.get("rating"))
    result["metrics"] = {"scale": scale} if scale is not None else None
    result.setdefault("photoUrls", [])
    result.setdefault("photoFileIds", [])
    return result


async def _validate_owned_uploads(
    database, user_id: str, photo_urls: list[str], file_ids: list[str]
) -> None:
    if len(photo_urls) != len(file_ids):
        raise HTTPException(
            status_code=422,
            detail="Each progress photo must include its ImageKit file identifier",
        )
    for url, file_id in zip(photo_urls, file_ids, strict=True):
        upload = await database.uploads.find_one(
            {"fileId": file_id, "userId": user_id, "url": url}
        )
        if upload is None:
            raise HTTPException(status_code=403, detail="A progress photo is not owned by this account")


def _faq_out(faq: dict) -> dict:
    result = clean_doc(faq)
    category = (result.get("category") or "").lower()
    if category in {"general", "products", "routines", "orders", "ingredients"}:
        result["category"] = category.title()
        return result
    result["category"] = {
        "hair": "Products",
        "beard": "Products",
        "skin": "Products",
        "general_wellness": "General",
        "other": "General",
    }.get(category, "General")
    return result


def _order_out(order: dict) -> dict:
    result = clean_doc(order)
    result["id"] = result.get("id") or result.get("orderId")
    result["orderNumber"] = result.get("orderNumber") or result.get("orderId")
    result["orderDate"] = result.get("orderDate") or result.get("createdAt")
    result["totalAmount"] = result.get("totalAmount", result.get("total_amount", 0))
    result["items"] = [
        {
            "id": item.get("id") or item.get("productId") or str(index),
            "productId": item.get("productId") or item.get("id") or "",
            "productName": item.get("productName") or item.get("name", "Item"),
            "quantity": item.get("quantity", 1),
            "price": item.get("price", item.get("unitPrice", 0)),
            "imageUrl": item.get("imageUrl"),
        }
        for index, item in enumerate(result.get("items", []))
    ]
    return result


@router.get("/health")
async def health(request: Request):
    database = db_from(request)
    await database.command("ping")
    return response({"status": "ok", "time": utc_now()})


@router.post("/auth/register", status_code=201)
async def register(body: RegisterRequest, request: Request, response_obj: Response):
    database = db_from(request)
    email = str(body.email).strip().lower()
    user = {
        "id": new_id(),
        "name": body.name.strip(),
        "email": email,
        "emailNormalized": email,
        "passwordHash": hash_password(body.password),
        "createdAt": utc_now(),
    }
    token = create_access_token(user["id"])
    if not user["name"]:
        raise HTTPException(status_code=422, detail="Name cannot be empty")
    try:
        await database.users.insert_one(user)
    except DuplicateKeyError as exc:
        raise HTTPException(status_code=409, detail="An account with this email already exists") from exc
    session = await create_user_session(database, user)
    set_auth_cookie(response_obj, user["id"], token)
    return response({"user": public_user(user), "session": session})


@router.post("/auth/login")
async def login(body: LoginRequest, request: Request, response_obj: Response):
    database = db_from(request)
    user = await database.users.find_one({"emailNormalized": str(body.email).strip().lower()})
    if user is None or not verify_password(body.password, user.get("passwordHash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"])
    session = await create_user_session(database, clean_doc(user))
    set_auth_cookie(response_obj, user["id"], token)
    return response({"user": public_user(clean_doc(user)), "session": session})


@router.get("/auth/me")
async def current_account(request: Request):
    user = await get_current_user(request)
    database = db_from(request)
    session = await create_user_session(database, user)
    return response({"user": public_user(user), "session": session})


@router.post("/auth/logout")
async def logout(response_obj: Response):
    clear_auth_cookie(response_obj)
    return response({"success": True})


@router.post("/session")
async def create_session(body: SessionCreate, request: Request, response_obj: Response):
    database = db_from(request)
    user = await get_current_user(request)
    session_id = _session_id(body.session_id)
    if user.get("sessionId") and user["sessionId"] != session_id:
        raise HTTPException(status_code=409, detail="This account already has an active care session")
    now = utc_now()
    existing = await database.sessions.find_one({"sessionId": session_id})
    if existing and existing.get("userId") != user["id"]:
        raise HTTPException(status_code=404, detail="Care session not found")
    if not existing:
        session = {
            "sessionId": session_id,
            "userId": user["id"],
            "createdAt": now,
            "selectedCategories": body.selected_categories,
            "concerns": body.concerns,
            "goals": body.goals,
            "name": user["name"],
            "onboardingCompleted": body.onboarding_completed,
            "lastSeenAt": now,
        }
        await database.sessions.insert_one(session)
        await database.users.update_one({"id": user["id"]}, {"$set": {"sessionId": session_id}})
    else:
        await database.sessions.update_one(
            {"sessionId": session_id, "userId": user["id"]},
            {"$set": {"lastSeenAt": now}},
        )
        session = await database.sessions.find_one({"sessionId": session_id})
    set_auth_cookie(response_obj, user["id"])
    return response(clean_doc(session))


@router.get("/session")
async def read_session(
    request: Request,
    session_id: str = Query(alias="sessionId", min_length=1, max_length=100),
):
    database = db_from(request)
    session = await require_session(database, session_id, request)
    return response(session)


@router.get("/session/{session_id}")
async def read_session_compat(session_id: str, request: Request):
    database = db_from(request)
    return response(await require_session(database, session_id, request))


@router.put("/session/{session_id}")
async def update_session_compat(session_id: str, body: SessionUpdate, request: Request):
    database = db_from(request)
    await require_session(database, session_id, request)
    updates = _dump(body, exclude_unset=True)
    if updates:
        updates["updatedAt"] = utc_now()
        await database.sessions.update_one(
            {"sessionId": session_id}, {"$set": updates}
        )
    return response(await require_session(database, session_id, request))


async def _reset_session(database, session_id: str, request: Request) -> dict:
    await require_session(database, session_id, request)
    for collection in (
        "session_products",
        "routines",
        "progress_entries",
        "ai_messages",
        "activities",
    ):
        await database[collection].delete_many({"sessionId": session_id})
    session = await database.sessions.find_one({"sessionId": session_id})
    await database.sessions.delete_one({"sessionId": session_id, "userId": session["userId"]})
    await database.users.update_one(
        {"id": session["userId"], "sessionId": session_id},
        {"$unset": {"sessionId": ""}},
    )
    return {"reset": True, "sessionId": session_id}


@router.post("/session/reset")
async def reset_session(body: SessionCreate, request: Request):
    return response(await _reset_session(db_from(request), _session_id(body.session_id), request))


@router.delete("/session")
async def reset_session_compat(
    request: Request,
    session_id: str = Query(alias="sessionId", min_length=1, max_length=100),
):
    return response(await _reset_session(db_from(request), session_id, request))


@router.delete("/session/{session_id}")
async def reset_session_path(session_id: str, request: Request):
    return response(await _reset_session(db_from(request), session_id, request))


@router.get("/dashboard")
async def dashboard(
    request: Request,
    session_id: str = Query(alias="sessionId", min_length=1, max_length=100),
):
    database = db_from(request)
    await require_session(database, session_id, request)
    now = datetime.now(UTC)
    today = now.date().isoformat()
    product_count = await database.session_products.count_documents(
        {"sessionId": session_id}
    )
    active_count = await database.session_products.count_documents(
        {"sessionId": session_id, "status": "active"}
    )
    todays_routines = await database.routines.count_documents(
        {"sessionId": session_id, "date": today}
    )
    completed_today = await database.routines.count_documents(
        {"sessionId": session_id, "date": today, "status": "completed"}
    )
    journal_count = await database.progress_entries.count_documents(
        {"sessionId": session_id}
    )
    today_routines_data = [
        _routine_out(item)
        async for item in database.routines.find(
            {"sessionId": session_id, "date": today}
        ).sort([("time", 1), ("createdAt", 1)])
    ]
    my_products_data = [
        await _my_product_out(database, item)
        async for item in database.session_products.find(
            {"sessionId": session_id}
        ).sort("createdAt", -1).limit(4)
    ]
    recent_progress_data = [
        _progress_out(item)
        async for item in database.progress_entries.find(
            {"sessionId": session_id}
        ).sort("date", -1).limit(3)
    ]
    activities = [
        clean_doc(item)
        async for item in database.activities.find({"sessionId": session_id})
        .sort("createdAt", -1)
        .limit(8)
    ]
    return response(
        {
            "myProducts": product_count,
            "activeProducts": active_count,
            "todaysRoutines": todays_routines,
            "completedRoutines": completed_today,
            "journalEntries": journal_count,
            "recentActivity": activities,
            "asOf": now,
            "stats": {
                "activeProductsCount": active_count,
                "todayRoutinesTotal": todays_routines,
                "todayRoutinesCompleted": completed_today,
                "progressEntriesCount": journal_count,
                "streakDays": await _routine_streak(database, session_id, now.date()),
            },
            "todayRoutines": today_routines_data,
            "myCarePreview": my_products_data,
            "recentProgress": recent_progress_data,
        }
    )


async def _routine_streak(database, session_id: str, today: date) -> int:
    completed_dates = {
        date.fromisoformat(item["date"])
        async for item in database.routines.find(
            {
                "sessionId": session_id,
                "status": "completed",
                "date": {"$lte": today.isoformat()},
            },
            {"date": 1},
        )
    }
    streak = 0
    current = today
    while current in completed_dates:
        streak += 1
        current -= timedelta(days=1)
    return streak


@router.get("/dashboard/analytics")
async def dashboard_analytics(
    request: Request,
    session_id: str = Query(alias="sessionId", min_length=1, max_length=100),
):
    database = db_from(request)
    await require_session(database, session_id, request)
    today = datetime.now(UTC).date()
    first_day = today - timedelta(days=6)
    routine_counts: dict[str, dict[str, int]] = {}
    async for item in database.routines.find(
        {
            "sessionId": session_id,
            "date": {"$gte": first_day.isoformat(), "$lte": today.isoformat()},
        },
        {"date": 1, "status": 1},
    ):
        row = routine_counts.setdefault(item["date"], {"completed": 0, "total": 0})
        row["total"] += 1
        if item.get("status") == RoutineStatus.COMPLETED.value:
            row["completed"] += 1
    completion_trend = [
        {
            "date": (first_day + timedelta(days=offset)).isoformat(),
            **routine_counts.get(
                (first_day + timedelta(days=offset)).isoformat(),
                {"completed": 0, "total": 0},
            ),
        }
        for offset in range(7)
    ]
    category_counts: dict[str, int] = {}
    progress_trend = []
    async for entry in database.progress_entries.find(
        {"sessionId": session_id, "date": {"$gte": first_day.isoformat()}},
        {"category": 1, "date": 1, "condition": 1, "observationCategory": 1, "scale": 1, "rating": 1},
    ).sort("date", 1).limit(200):
        category = _category_label(entry.get("category"))
        category_counts[category] = category_counts.get(category, 0) + 1
        scale = entry.get("scale", entry.get("rating"))
        if scale is not None:
            progress_trend.append(
                {
                    "date": entry.get("date"),
                    "score": scale,
                    "label": entry.get("condition") or entry.get("observationCategory") or category,
                }
            )
    return response(
        {
            "completionRateTrend": completion_trend,
            "categoryDistribution": [
                {"category": category, "count": count}
                for category, count in sorted(category_counts.items())
            ],
            "progressObservationsTrend": progress_trend,
        }
    )


@router.get("/products")
async def list_products(
    request: Request,
    category: Category | None = None,
    search: str | None = Query(default=None, max_length=120),
    min_price: float | None = Query(default=None, alias="minPrice", ge=0),
    max_price: float | None = Query(default=None, alias="maxPrice", ge=0),
    sort_by: str | None = Query(default=None, alias="sortBy"),
    sort: str | None = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
):
    if min_price is not None and max_price is not None and min_price > max_price:
        raise HTTPException(status_code=422, detail="minPrice must not exceed maxPrice")
    filters: dict = {}
    if category:
        filters["category"] = category.value
    if search:
        filters["$or"] = [
            {"name": {"$regex": re.escape(search.strip()), "$options": "i"}},
            {"description": {"$regex": re.escape(search.strip()), "$options": "i"}},
            {"shortDescription": {"$regex": re.escape(search.strip()), "$options": "i"}},
            {"ingredients": {"$regex": re.escape(search.strip()), "$options": "i"}},
        ]
    price_filter: dict = {}
    if min_price is not None:
        price_filter["$gte"] = min_price
    if max_price is not None:
        price_filter["$lte"] = max_price
    if price_filter:
        filters["price"] = price_filter
    sort_fields = {
        "featured": ("updatedAt", -1),
        "name": ("name", 1),
        "name_asc": ("name", 1),
        "name_desc": ("name", -1),
        "price": ("price", 1),
        "price_asc": ("price", 1),
        "price_desc": ("price", -1),
        "rating": ("rating", -1),
        "newest": ("updatedAt", -1),
        "updatedAt": ("updatedAt", -1),
    }
    selected_sort = sort_by or sort or "name"
    if selected_sort not in sort_fields:
        raise HTTPException(status_code=422, detail="Unsupported sortBy value")
    sort_field, sort_direction = sort_fields[selected_sort]
    database = db_from(request)
    total = await database.products.count_documents(filters)
    items = [
        _product_out(item)
        async for item in database.products.find(filters)
        .sort(sort_field, sort_direction)
        .skip((page - 1) * limit)
        .limit(limit)
    ]
    return response({"items": items, "total": total, "page": page, "limit": limit})


@router.get("/products/compare")
async def compare_products(
    request: Request,
    ids: str = Query(min_length=1, max_length=500),
):
    product_ids = list(dict.fromkeys(item.strip() for item in ids.split(",") if item.strip()))
    if not 2 <= len(product_ids) <= 4:
        raise HTTPException(status_code=422, detail="Compare between 2 and 4 products")
    database = db_from(request)
    documents = [
        _product_out(item)
        async for item in database.products.find({"id": {"$in": product_ids}})
    ]
    by_id = {item["id"]: item for item in documents}
    missing = [product_id for product_id in product_ids if product_id not in by_id]
    if missing:
        raise HTTPException(status_code=404, detail=f"Products not found: {', '.join(missing)}")
    return response([by_id[product_id] for product_id in product_ids])


@router.get("/products/{product_id}")
async def product_details(product_id: str, request: Request):
    product = await get_product(db_from(request), product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return response(_product_out(product))


@router.get("/my-products")
async def list_my_products(
    request: Request,
    session_id: str = Query(alias="sessionId", min_length=1, max_length=100),
    status: str | None = None,
):
    database = db_from(request)
    await require_session(database, session_id, request)
    filters = {"sessionId": session_id}
    if status:
        if status not in {"active", "paused", "discontinued"}:
            raise HTTPException(status_code=422, detail="Unsupported product status")
        filters["status"] = status
    entries = [
        clean_doc(item)
        async for item in database.session_products.find(filters).sort("createdAt", -1)
    ]
    product_ids = [entry["productId"] for entry in entries]
    products = {
        item["id"]: clean_doc(item)
        async for item in database.products.find({"id": {"$in": product_ids}})
    } if product_ids else {}
    for entry in entries:
        entry["personalNotes"] = entry.pop("notes", entry.get("personalNotes", ""))
        entry["product"] = _product_out(products.get(entry["productId"]))
    return response(entries)


@router.post("/my-products", status_code=201)
async def add_my_product(body: SessionProductCreate, request: Request):
    database = db_from(request)
    session_id = _session_id(body.session_id)
    await require_session(database, session_id, request)
    product = await get_product(database, body.product_id)
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    entry = _dump(body)
    entry.update(
        {
            "id": new_id(),
            "sessionId": session_id,
            "startDate": body.start_date.isoformat() if body.start_date else datetime.now(UTC).date().isoformat(),
            "notes": body.notes or body.personal_notes,
            "personalNotes": body.notes or body.personal_notes,
            "createdAt": utc_now(),
            "updatedAt": utc_now(),
        }
    )
    try:
        await database.session_products.insert_one(entry)
    except DuplicateKeyError as exc:
        raise HTTPException(status_code=409, detail="Product is already in My Care") from exc
    entry = clean_doc(entry)
    entry["personalNotes"] = entry.pop("notes", entry.get("personalNotes", ""))
    entry["product"] = _product_out(product)
    await record_activity(database, session_id, "product_added", f"Added {product['name']} to My Care", entry["id"])
    return response(entry)


@router.patch("/my-products/{entry_id}")
async def update_my_product(entry_id: str, body: SessionProductUpdate, request: Request):
    database = db_from(request)
    session_id = _session_header(request)
    await require_session(database, session_id, request)
    updates = _dump(body, exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=422, detail="Provide at least one field to update")
    if "startDate" in updates and body.start_date:
        updates["startDate"] = body.start_date.isoformat()
    updates["updatedAt"] = utc_now()
    if "personalNotes" in updates:
        updates["notes"] = updates["personalNotes"]
    entry = await database.session_products.find_one_and_update(
        {"id": entry_id, "sessionId": session_id},
        {"$set": updates},
        return_document=ReturnDocument.AFTER,
    )
    if entry is None:
        raise HTTPException(status_code=404, detail="My Care product not found")
    entry = clean_doc(entry)
    entry["personalNotes"] = entry.pop("notes", entry.get("personalNotes", ""))
    entry["product"] = _product_out(await get_product(database, entry["productId"]))
    await record_activity(database, entry["sessionId"], "product_updated", "Updated a My Care product", entry_id)
    return response(entry)


@router.delete("/my-products/{entry_id}")
async def delete_my_product(entry_id: str, request: Request):
    database = db_from(request)
    session_id = _session_header(request)
    await require_session(database, session_id, request)
    entry = clean_doc(
        await database.session_products.find_one(
            {"id": entry_id, "sessionId": session_id}
        )
    )
    if entry is None:
        raise HTTPException(status_code=404, detail="My Care product not found")
    await database.session_products.delete_one(
        {"id": entry_id, "sessionId": session_id}
    )
    await record_activity(database, entry["sessionId"], "product_removed", "Removed a product from My Care", entry_id)
    return response({"deleted": True, "id": entry_id})


@router.get("/routines")
async def list_routines(
    request: Request,
    session_id: str = Query(alias="sessionId", min_length=1, max_length=100),
    category: Category | None = None,
    from_date: date | None = Query(default=None, alias="fromDate"),
    to_date: date | None = Query(default=None, alias="toDate"),
):
    if from_date and to_date and from_date > to_date:
        raise HTTPException(status_code=422, detail="fromDate must not be after toDate")
    database = db_from(request)
    await require_session(database, session_id, request)
    filters: dict = {"sessionId": session_id}
    if category:
        filters["category"] = category.value
    if from_date or to_date:
        filters["date"] = {}
        if from_date:
            filters["date"]["$gte"] = from_date.isoformat()
        if to_date:
            filters["date"]["$lte"] = to_date.isoformat()
    routines = [
        _routine_out(item)
        async for item in database.routines.find(filters).sort([("date", 1), ("time", 1)])
    ]
    return response(routines)


@router.get("/routines/summary")
async def routines_summary(
    request: Request,
    session_id: str = Query(alias="sessionId", min_length=1, max_length=100),
):
    database = db_from(request)
    await require_session(database, session_id, request)
    counts = {
        status.value: await database.routines.count_documents(
            {"sessionId": session_id, "status": status.value}
        )
        for status in RoutineStatus
    }
    total = sum(counts.values())
    percentage = round(counts["completed"] * 100 / total, 1) if total else 0
    counts["total"] = total
    counts["completionPercentage"] = percentage
    counts["completionRate"] = percentage
    return response(counts)


@router.post("/routines", status_code=201)
async def create_routine(body: RoutineCreate, request: Request):
    database = db_from(request)
    session_id = _session_id(body.session_id)
    await require_session(database, session_id, request)
    scheduled_date = body.date or body.scheduled_date
    routine = _dump(body)
    routine.update(
        {
            "id": new_id(),
            "sessionId": session_id,
            "date": scheduled_date.isoformat(),
            "time": body.time.isoformat() if body.time else None,
            "productName": body.product_name,
            "status": RoutineStatus.PENDING.value,
            "createdAt": utc_now(),
            "updatedAt": utc_now(),
        }
    )
    await database.routines.insert_one(routine)
    await record_activity(database, session_id, "routine_created", f"Created routine: {body.activity_name}", routine["id"])
    return response(_routine_out(routine))


@router.patch("/routines/{routine_id}")
async def update_routine(routine_id: str, body: RoutineUpdate, request: Request):
    database = db_from(request)
    session_id = _session_header(request)
    await require_session(database, session_id, request)
    updates = _dump(body, exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=422, detail="Provide at least one field to update")
    supplied_session_id = updates.pop("sessionId", None)
    if supplied_session_id and supplied_session_id != session_id:
        raise HTTPException(status_code=403, detail="Session ID does not match request header")
    if body.date is not None:
        updates["date"] = body.date.isoformat()
    if body.time is not None:
        updates["time"] = body.time.isoformat()
    updates["updatedAt"] = utc_now()
    routine = await database.routines.find_one_and_update(
        {"id": routine_id, "sessionId": session_id},
        {"$set": updates},
        return_document=ReturnDocument.AFTER,
    )
    if routine is None:
        raise HTTPException(status_code=404, detail="Routine not found")
    routine = clean_doc(routine)
    await record_activity(database, routine["sessionId"], "routine_updated", "Updated a routine", routine_id)
    return response(_routine_out(routine))


@router.patch("/routines/{routine_id}/status")
async def update_routine_status(routine_id: str, body: RoutineStatusUpdate, request: Request):
    database = db_from(request)
    session_id = _session_header(request)
    await require_session(database, session_id, request)
    routine = await database.routines.find_one_and_update(
        {"id": routine_id, "sessionId": session_id},
        {"$set": {"status": body.status.value, "updatedAt": utc_now()}},
        return_document=ReturnDocument.AFTER,
    )
    if routine is None:
        raise HTTPException(status_code=404, detail="Routine not found")
    routine = clean_doc(routine)
    await record_activity(
        database,
        routine["sessionId"],
        f"routine_{body.status.value}",
        f"Marked routine {body.status.value}",
        routine_id,
    )
    return response(_routine_out(routine))


@router.delete("/routines/{routine_id}")
async def delete_routine(routine_id: str, request: Request):
    database = db_from(request)
    session_id = _session_header(request)
    await require_session(database, session_id, request)
    routine = clean_doc(
        await database.routines.find_one(
            {"id": routine_id, "sessionId": session_id}
        )
    )
    if routine is None:
        raise HTTPException(status_code=404, detail="Routine not found")
    await database.routines.delete_one(
        {"id": routine_id, "sessionId": session_id}
    )
    await record_activity(database, routine["sessionId"], "routine_deleted", "Deleted a routine", routine_id)
    return response({"deleted": True, "id": routine_id})


@router.get("/progress")
async def list_progress(
    request: Request,
    session_id: str = Query(alias="sessionId", min_length=1, max_length=100),
    category: Category | None = None,
    from_date: date | None = Query(default=None, alias="fromDate"),
    to_date: date | None = Query(default=None, alias="toDate"),
):
    if from_date and to_date and from_date > to_date:
        raise HTTPException(status_code=422, detail="fromDate must not be after toDate")
    database = db_from(request)
    await require_session(database, session_id, request)
    filters: dict = {"sessionId": session_id}
    if category:
        filters["category"] = category.value
    if from_date or to_date:
        filters["date"] = {}
        if from_date:
            filters["date"]["$gte"] = from_date.isoformat()
        if to_date:
            filters["date"]["$lte"] = to_date.isoformat()
    entries = [
        _progress_out(item)
        async for item in database.progress_entries.find(filters).sort("date", -1)
    ]
    return response(entries)


@router.post("/progress", status_code=201)
async def create_progress(body: ProgressCreate, request: Request):
    database = db_from(request)
    session_id = _session_id(body.session_id)
    session = await require_session(database, session_id, request)
    entry_date = body.date or body.entry_date
    category = body.category or body.care_type
    scale = body.scale if body.scale is not None else body.rating
    photo_urls = [str(url) for url in body.photo_urls]
    await _validate_owned_uploads(database, session["userId"], photo_urls, body.photo_file_ids)
    entry = _dump(body)
    entry.update(
        {
            "id": new_id(),
            "sessionId": session_id,
            "category": category.value,
            "date": entry_date.isoformat(),
            "condition": body.condition or body.observation_category,
            "notes": body.notes,
            "scale": scale,
            "photoUrls": photo_urls,
            "photoFileIds": body.photo_file_ids,
            "createdAt": utc_now(),
            "updatedAt": utc_now(),
        }
    )
    await database.progress_entries.insert_one(entry)
    await record_activity(database, session_id, "journal_created", "Created a progress journal entry", entry["id"])
    return response(_progress_out(entry))


@router.get("/progress/{entry_id}")
async def get_progress_entry(entry_id: str, request: Request):
    database = db_from(request)
    session_id = _session_header(request)
    await require_session(database, session_id, request)
    entry = await database.progress_entries.find_one(
        {"id": entry_id, "sessionId": session_id}
    )
    if entry is None:
        raise HTTPException(status_code=404, detail="Progress entry not found")
    return response(_progress_out(entry))


@router.patch("/progress/{entry_id}")
@router.put("/progress/{entry_id}")
async def update_progress(entry_id: str, body: ProgressUpdate, request: Request):
    database = db_from(request)
    session_id = _session_header(request)
    session = await require_session(database, session_id, request)
    updates = _dump(body, exclude_unset=True)
    if not updates:
        raise HTTPException(status_code=422, detail="Provide at least one field to update")
    supplied_session_id = updates.pop("sessionId", None)
    if supplied_session_id and supplied_session_id != session_id:
        raise HTTPException(status_code=403, detail="Session ID does not match request header")
    updates.pop("entryDate", None)
    updates.pop("careType", None)
    updates.pop("scale", None)
    if body.date is not None or body.entry_date is not None:
        updates["date"] = (body.date or body.entry_date).isoformat()
    if body.care_type is not None:
        updates["category"] = body.care_type.value
    if body.condition is not None:
        updates["condition"] = body.condition
    if body.scale is not None:
        updates["scale"] = body.scale
    if body.photo_urls is not None:
        updates["photoUrls"] = [str(url) for url in body.photo_urls]
    if body.photo_file_ids is not None:
        updates["photoFileIds"] = body.photo_file_ids
    photo_urls = updates.get("photoUrls")
    file_ids = updates.get("photoFileIds")
    if photo_urls is not None or file_ids is not None:
        existing_entry = await database.progress_entries.find_one(
            {"id": entry_id, "sessionId": session_id}
        )
        if existing_entry is None:
            raise HTTPException(status_code=404, detail="Progress entry not found")
        await _validate_owned_uploads(
            database,
            session["userId"],
            photo_urls if photo_urls is not None else existing_entry.get("photoUrls", []),
            file_ids if file_ids is not None else existing_entry.get("photoFileIds", []),
        )
    updates.pop("observationCategory", None)
    updates["updatedAt"] = utc_now()
    entry = await database.progress_entries.find_one_and_update(
        {"id": entry_id, "sessionId": session_id},
        {"$set": updates},
        return_document=ReturnDocument.AFTER,
    )
    if entry is None:
        raise HTTPException(status_code=404, detail="Progress entry not found")
    entry = clean_doc(entry)
    await record_activity(database, entry["sessionId"], "journal_updated", "Updated a progress journal entry", entry_id)
    return response(_progress_out(entry))


@router.delete("/progress/{entry_id}")
async def delete_progress(entry_id: str, request: Request):
    database = db_from(request)
    session_id = _session_header(request)
    session = await require_session(database, session_id, request)
    entry = clean_doc(
        await database.progress_entries.find_one(
            {"id": entry_id, "sessionId": session_id}
        )
    )
    if entry is None:
        raise HTTPException(status_code=404, detail="Progress entry not found")
    for file_id in entry.get("photoFileIds", []):
        upload = await database.uploads.find_one(
            {"fileId": file_id, "userId": session["userId"]}
        )
        if upload:
            await delete_progress_photo(file_id)
            await database.uploads.delete_one(
                {"fileId": file_id, "userId": session["userId"]}
            )
    await database.progress_entries.delete_one(
        {"id": entry_id, "sessionId": session_id}
    )
    await record_activity(database, entry["sessionId"], "journal_deleted", "Deleted a progress journal entry", entry_id)
    return response({"deleted": True, "id": entry_id})


@router.post("/ai/chat")
async def chat(body: ChatCreate, request: Request):
    database = db_from(request)
    session_id = _session_id(body.session_id)
    await require_session(database, session_id, request)
    prompt_message = body.message
    if body.context:
        context_parts = [
            f"{key}: {value}"
            for key, value in body.context.items()
            if key in {"productId", "productName", "category"} and value.strip()
        ]
        if context_parts:
            prompt_message += "\n\nCurrent page context: " + "; ".join(context_parts)
    answer, raw_sources = await answer_with_gemini(database, session_id, prompt_message)
    sources = [
        {
            "title": source.get("name", "CareGuide information"),
            **({"url": source["url"]} if source.get("url") else {}),
            "snippet": source.get("type", ""),
        }
        for source in raw_sources
    ]
    now = utc_now()
    user_message = {
        "id": new_id(),
        "sessionId": session_id,
        "role": "user",
        "message": body.message,
        "sources": [],
        "suggestions": [],
        "createdAt": now,
    }
    assistant_message = {
        "id": new_id(),
        "sessionId": session_id,
        "role": "assistant",
        "message": answer,
        "sources": sources,
        "suggestions": [],
        "createdAt": now + timedelta(microseconds=1),
    }
    await database.ai_messages.insert_many([user_message, assistant_message])
    return response(
        {
            "response": answer,
            "sources": sources,
            "suggestions": [],
        }
    )


@router.get("/ai/history")
async def ai_history(
    request: Request,
    session_id: str = Query(alias="sessionId", min_length=1, max_length=100),
):
    database = db_from(request)
    await require_session(database, session_id, request)
    messages = [
        clean_doc(item)
        async for item in database.ai_messages.find({"sessionId": session_id})
        .sort("createdAt", 1)
        .limit(500)
    ]
    for message in messages:
        message["sources"] = [
            {
                "title": source.get("title") or source.get("name", "CareGuide information"),
                "snippet": source.get("snippet") or source.get("type", ""),
            }
            for source in message.get("sources", [])
        ]
    return response(messages)


@router.delete("/ai/history")
async def clear_ai_history(
    request: Request,
    session_id: str = Query(alias="sessionId", min_length=1, max_length=100),
):
    database = db_from(request)
    await require_session(database, session_id, request)
    result = await database.ai_messages.delete_many({"sessionId": session_id})
    return response({"deleted": result.deleted_count})


@router.get("/ai/suggestions")
async def ai_suggestions():
    return response([])


@router.post("/uploads/progress-photo", status_code=201)
async def upload_photo(request: Request, file: UploadFile = File(...)):
    user = await get_current_user(request)
    uploaded = await upload_progress_photo(file)
    uploaded["userId"] = user["id"]
    uploaded["createdAt"] = utc_now()
    await db_from(request).uploads.insert_one(uploaded)
    uploaded = clean_doc(uploaded)
    uploaded.pop("userId")
    uploaded.pop("createdAt")
    return response(uploaded)


@router.delete("/uploads/progress-photo")
@router.post("/uploads/delete")
async def remove_photo(body: UploadDelete, request: Request):
    user = await get_current_user(request)
    file_id = body.file_id or body.public_id
    if not file_id:
        raise HTTPException(status_code=422, detail="fileId is required")
    upload = await db_from(request).uploads.find_one(
        {"fileId": file_id, "userId": user["id"]}
    )
    if upload is None:
        raise HTTPException(status_code=404, detail="Image not found")
    await delete_progress_photo(file_id)
    await db_from(request).uploads.delete_one({"fileId": file_id, "userId": user["id"]})
    return response({"deleted": True, "fileId": file_id})


@router.get("/orders/{order_id}")
async def order_lookup(order_id: str, request: Request):
    database = db_from(request)
    order = clean_doc(
        await database.orders.find_one({"orderId": order_id.strip().upper()})
    )
    if order is None:
        raise HTTPException(status_code=404, detail="Order not found in demonstration data")
    order["isDemo"] = True
    return response(_order_out(order))


@router.post("/support/tickets", status_code=201)
async def create_support_ticket(body: SupportTicketCreate, request: Request):
    database = db_from(request)
    session_id = _session_id(body.session_id)
    await require_session(database, session_id, request)
    ticket_id = f"CG-{uuid4().hex[:10].upper()}"
    ticket = _dump(body)
    ticket.update(
        {
            "id": new_id(),
            "ticketId": ticket_id,
            "sessionId": session_id,
            "status": "received",
            "isDemo": True,
            "createdAt": utc_now(),
        }
    )
    await database.support_tickets.insert_one(ticket)
    ticket = clean_doc(ticket)
    ticket["status"] = "Open"
    return response(ticket)


@router.get("/support/tickets")
async def list_support_tickets(
    request: Request,
    session_id: str = Query(alias="sessionId", min_length=1, max_length=100),
):
    database = db_from(request)
    await require_session(database, session_id, request)
    tickets = [
        clean_doc(item)
        async for item in database.support_tickets.find(
            {"sessionId": session_id}
        ).sort("createdAt", -1)
    ]
    for ticket in tickets:
        if ticket.get("status") == "received":
            ticket["status"] = "Open"
    return response(tickets)


@router.get("/faqs")
async def list_faqs(
    request: Request,
    search: str | None = Query(default=None, max_length=120),
    category: Category | None = None,
):
    filters: dict = {"isVerified": True}
    if category:
        filters["category"] = category.value
    if search:
        filters["$or"] = [
            {"question": {"$regex": re.escape(search.strip()), "$options": "i"}},
            {"answer": {"$regex": re.escape(search.strip()), "$options": "i"}},
        ]
    database = db_from(request)
    faqs = [
        clean_doc(item)
        async for item in database.faqs.find(filters).sort("question", 1).limit(200)
    ]
    return response([_faq_out(faq) for faq in faqs])
