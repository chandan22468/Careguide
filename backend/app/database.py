from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
import json
import logging
from pathlib import Path

from fastapi import FastAPI, Request
from pymongo import ASCENDING, DESCENDING, AsyncMongoClient

from app.config import settings

logger = logging.getLogger(__name__)

DEMO_ACCOUNT_EMAIL = "test@gmail.com"
DEMO_ACCOUNT_PASSWORD = "test123456"
PRODUCT_CATALOGUE_PATH = Path(__file__).with_name("data") / "products.json"


async def create_indexes(database) -> None:
    await database.users.create_index("emailNormalized", unique=True)
    await database.sessions.create_index("sessionId", unique=True)
    await database.sessions.create_index("userId", unique=True, sparse=True)
    await database.products.create_index([("category", ASCENDING), ("name", ASCENDING)])
    await database.products.create_index([("name", ASCENDING)])
    await database.session_products.create_index(
        [("sessionId", ASCENDING), ("productId", ASCENDING)], unique=True
    )
    await database.session_products.create_index(
        [("sessionId", ASCENDING), ("status", ASCENDING)]
    )
    await database.routines.create_index(
        [("sessionId", ASCENDING), ("date", ASCENDING)]
    )
    await database.progress_entries.create_index(
        [("sessionId", ASCENDING), ("date", DESCENDING)]
    )
    await database.ai_messages.create_index(
        [("sessionId", ASCENDING), ("createdAt", ASCENDING)]
    )
    await database.activities.create_index(
        [("sessionId", ASCENDING), ("createdAt", DESCENDING)]
    )
    await database.orders.create_index("orderId", unique=True)
    await database.support_tickets.create_index("ticketId", unique=True)
    await database.faqs.create_index([("category", ASCENDING), ("question", ASCENDING)])
    await database.uploads.create_index("fileId", unique=True)
    await database.uploads.create_index([("userId", ASCENDING), ("createdAt", DESCENDING)])


async def seed_product_catalogue(database) -> int:
    with PRODUCT_CATALOGUE_PATH.open(encoding="utf-8") as catalogue_file:
        products = json.load(catalogue_file)
    if not isinstance(products, list):
        raise ValueError(f"{PRODUCT_CATALOGUE_PATH} must contain a JSON array")

    inserted = 0
    for product in products:
        if not isinstance(product, dict) or not product.get("id"):
            raise ValueError(f"Invalid product record in {PRODUCT_CATALOGUE_PATH}")
        seeded_product = {
            **product,
            "category": (
                "general_wellness"
                if str(product.get("category", "")).lower() == "wellness"
                else str(product.get("category", "other")).lower()
            ),
            "isVerified": False,
            "sourceName": "CareGuide frontend demo catalogue",
        }
        result = await database.products.update_one(
            {"id": seeded_product["id"]},
            {"$setOnInsert": seeded_product},
            upsert=True,
        )
        inserted += int(result.upserted_id is not None)
    logger.info(
        "Product catalogue ready: %d existing frontend products (%d newly added)",
        len(products),
        inserted,
    )
    return inserted


async def provision_demo_account(database) -> None:
    if not settings.demo_account_enabled or settings.environment.lower() in {"production", "prod"}:
        logger.info("Shared demo account provisioning is disabled")
        return

    from app.auth import create_user_session, hash_password
    from app.services import new_id, utc_now
    from pymongo.errors import DuplicateKeyError

    user = await database.users.find_one({"emailNormalized": DEMO_ACCOUNT_EMAIL})
    if user is None:
        user = {
            "id": new_id(),
            "name": "CareGuide Demo",
            "email": DEMO_ACCOUNT_EMAIL,
            "emailNormalized": DEMO_ACCOUNT_EMAIL,
            "passwordHash": hash_password(DEMO_ACCOUNT_PASSWORD),
            "createdAt": utc_now(),
            "isDemo": True,
        }
        try:
            await database.users.insert_one(user)
        except DuplicateKeyError:
            user = await database.users.find_one({"emailNormalized": DEMO_ACCOUNT_EMAIL})
            if user is None:
                raise
    elif user.get("isDemo"):
        await database.users.update_one(
            {"id": user["id"]},
            {"$set": {"passwordHash": hash_password(DEMO_ACCOUNT_PASSWORD)}},
        )
    else:
        logger.warning(
            "Shared demo account was not provisioned because %s is already a non-demo account",
            DEMO_ACCOUNT_EMAIL,
        )
        return

    await create_user_session(database, user)
    logger.info("Shared demo account is ready for local development")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    client = AsyncMongoClient(
        settings.mongodb_uri,
        serverSelectionTimeoutMS=5000,
        connectTimeoutMS=5000,
    )
    try:
        await client.admin.command("ping")
        database = client[settings.mongodb_database]
        await create_indexes(database)
        await seed_product_catalogue(database)
        await provision_demo_account(database)
        app.state.mongo_client = client
        app.state.database = database
        logger.info("Connected to MongoDB database %s", settings.mongodb_database)
        yield
    except Exception:
        await client.close()
        logger.exception("Could not initialize MongoDB")
        raise
    finally:
        await client.close()


def get_database(request: Request):
    database = getattr(request.app.state, "database", None)
    if database is None:
        raise RuntimeError("The database connection is not initialized")
    return database
