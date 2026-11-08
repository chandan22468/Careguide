from datetime import date as Date
from datetime import datetime
from datetime import time as Time
from enum import StrEnum
from typing import Any

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    HttpUrl,
    field_validator,
    model_validator,
)


def to_camel(value: str) -> str:
    first, *rest = value.split("_")
    return first + "".join(part.capitalize() for part in rest)


class Schema(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        extra="forbid",
        str_strip_whitespace=True,
    )


class Category(StrEnum):
    HAIR = "hair"
    BEARD = "beard"
    SKIN = "skin"
    GENERAL_WELLNESS = "general_wellness"
    OTHER = "other"

    @classmethod
    def _missing_(cls, value):
        if isinstance(value, str):
            normalized = value.strip().lower().replace(" ", "_")
            if normalized == "wellness":
                normalized = "general_wellness"
            for category in cls:
                if category.value == normalized:
                    return category
        return None


class SessionStatus(StrEnum):
    ACTIVE = "active"
    PAUSED = "paused"
    DISCONTINUED = "discontinued"


class RoutineStatus(StrEnum):
    PENDING = "pending"
    COMPLETED = "completed"
    SKIPPED = "skipped"


class Recurrence(StrEnum):
    ONCE = "once"
    DAILY = "daily"
    WEEKLY = "weekly"


class SessionCreate(Schema):
    session_id: str = Field(min_length=1, max_length=100)
    selected_categories: list[str] = Field(default_factory=list)
    concerns: list[str] = Field(default_factory=list)
    goals: list[str] = Field(default_factory=list)
    name: str = Field(default="Care Member", min_length=1, max_length=100)
    onboarding_completed: bool = False


class RegisterRequest(Schema):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=10, max_length=128)


class LoginRequest(Schema):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class SessionUpdate(Schema):
    selected_categories: list[str] | None = None
    concerns: list[str] | None = None
    goals: list[str] | None = None
    name: str | None = Field(default=None, min_length=1, max_length=100)
    onboarding_completed: bool | None = None


class ProductFAQ(Schema):
    question: str = Field(min_length=1, max_length=300)
    answer: str = Field(min_length=1, max_length=3000)


class Product(Schema):
    id: str
    name: str
    category: Category
    description: str
    detailed_description: str | None = None
    ingredients: list[str] = Field(default_factory=list)
    benefits: list[str] = Field(default_factory=list)
    usage_instructions: str | None = None
    precautions: str | None = None
    faqs: list[ProductFAQ] = Field(default_factory=list)
    price: float | None = Field(default=None, ge=0)
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    image_url: HttpUrl | None = None
    is_verified: bool = False
    source_name: str | None = None
    updated_at: datetime | None = None


class SessionProductCreate(Schema):
    session_id: str = Field(min_length=1, max_length=100)
    product_id: str = Field(min_length=1, max_length=100)
    start_date: Date | None = None
    status: SessionStatus = SessionStatus.ACTIVE
    notes: str | None = Field(default=None, max_length=2000)
    personal_notes: str | None = Field(default=None, max_length=2000)
    dosage_schedule: str | None = Field(default=None, max_length=500)

    @model_validator(mode="before")
    @classmethod
    def support_frontend_notes(cls, value):
        if isinstance(value, dict):
            value = dict(value)
            if "personalNotes" in value and "notes" not in value:
                value["notes"] = value["personalNotes"]
        return value


class SessionProductUpdate(Schema):
    status: SessionStatus | None = None
    notes: str | None = Field(default=None, max_length=2000)
    start_date: Date | None = None
    personal_notes: str | None = Field(default=None, max_length=2000)
    dosage_schedule: str | None = Field(default=None, max_length=500)

    @model_validator(mode="before")
    @classmethod
    def support_frontend_notes(cls, value):
        if isinstance(value, dict):
            value = dict(value)
            if "personalNotes" in value and "notes" not in value:
                value["notes"] = value["personalNotes"]
        return value


class RoutineCreate(Schema):
    session_id: str = Field(min_length=1, max_length=100)
    activity_name: str = Field(min_length=1, max_length=160)
    category: Category
    product_id: str | None = Field(default=None, max_length=100)
    product_name: str | None = Field(default=None, max_length=160)
    instructions: str | None = Field(default=None, max_length=4000)
    date: Date | None = None
    scheduled_date: Date | None = None
    time: Time | None = None
    time_of_day: str | None = Field(default=None, max_length=40)
    recurrence: Recurrence = Recurrence.ONCE
    notes: str | None = Field(default=None, max_length=2000)

    @model_validator(mode="after")
    def require_date(self):
        if self.date is None and self.scheduled_date is None:
            raise ValueError("date or scheduledDate is required")
        return self


class RoutineUpdate(Schema):
    session_id: str | None = Field(default=None, min_length=1, max_length=100)
    activity_name: str | None = Field(default=None, min_length=1, max_length=160)
    category: Category | None = None
    product_id: str | None = Field(default=None, max_length=100)
    product_name: str | None = Field(default=None, max_length=160)
    instructions: str | None = Field(default=None, max_length=4000)
    date: Date | None = None
    scheduled_date: Date | None = None
    time: Time | None = None
    time_of_day: str | None = Field(default=None, max_length=40)
    recurrence: Recurrence | None = None
    notes: str | None = Field(default=None, max_length=2000)
    status: RoutineStatus | None = None

    @model_validator(mode="before")
    @classmethod
    def support_scheduled_date(cls, value):
        if isinstance(value, dict):
            value = dict(value)
            if "scheduledDate" in value and "date" not in value:
                value["date"] = value["scheduledDate"]
                value.pop("scheduledDate")
        return value


class RoutineStatusUpdate(Schema):
    status: RoutineStatus


class ProgressCreate(Schema):
    session_id: str = Field(min_length=1, max_length=100)
    category: Category | None = None
    care_type: Category | None = None
    date: Date | None = None
    entry_date: Date | None = None
    observation_category: str | None = Field(default=None, max_length=120)
    condition: str | None = Field(default=None, max_length=120)
    observations: str = Field(min_length=1, max_length=10000)
    notes: str | None = Field(default=None, max_length=4000)
    rating: int | None = Field(default=None, ge=1, le=10)
    scale: int | None = Field(default=None, ge=1, le=10)
    photo_urls: list[str] = Field(default_factory=list, max_length=10)
    photo_file_ids: list[str] = Field(default_factory=list, max_length=10)

    @model_validator(mode="after")
    def require_frontend_fields(self):
        if self.category is None and self.care_type is None:
            raise ValueError("category or careType is required")
        if self.date is None and self.entry_date is None:
            raise ValueError("date or entryDate is required")
        return self


class ProgressUpdate(Schema):
    session_id: str | None = Field(default=None, min_length=1, max_length=100)
    category: Category | None = None
    care_type: Category | None = None
    date: Date | None = None
    entry_date: Date | None = None
    observation_category: str | None = Field(default=None, max_length=120)
    condition: str | None = Field(default=None, max_length=120)
    observations: str | None = Field(default=None, min_length=1, max_length=10000)
    notes: str | None = Field(default=None, max_length=4000)
    rating: int | None = Field(default=None, ge=1, le=10)
    scale: int | None = Field(default=None, ge=1, le=10)
    photo_urls: list[str] | None = Field(default=None, max_length=10)
    photo_file_ids: list[str] | None = Field(default=None, max_length=10)

    @model_validator(mode="before")
    @classmethod
    def support_frontend_date(cls, value):
        if isinstance(value, dict):
            value = dict(value)
            if "entryDate" in value and "date" not in value:
                value["date"] = value["entryDate"]
                value.pop("entryDate")
        return value


class ChatCreate(Schema):
    session_id: str = Field(min_length=1, max_length=100)
    message: str = Field(min_length=1, max_length=4000)
    context: dict[str, str] | None = None


class ChatMessage(Schema):
    id: str
    role: str
    message: str
    sources: list[dict[str, str]] = Field(default_factory=list)
    suggestions: list[str] = Field(default_factory=list)
    created_at: datetime


class SupportTicketCreate(Schema):
    session_id: str = Field(min_length=1, max_length=100)
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    category: str = Field(min_length=1, max_length=80)
    subject: str = Field(min_length=1, max_length=200)
    message: str = Field(min_length=1, max_length=10000)

    @field_validator("category")
    @classmethod
    def validate_category(cls, value: str) -> str:
        allowed = {
            "Product information",
            "Product Usage",
            "Ingredient Inquiry",
            "Routine Scheduling",
            "Orders & Shipping",
            "General Query",
            "Order-related question",
            "Technical issue",
            "Routine-related question",
            "Other",
        }
        if value not in allowed:
            raise ValueError("Select a supported support category")
        return value


class FAQ(Schema):
    id: str
    question: str
    answer: str
    category: Category | None = None
    source_name: str | None = None
    is_verified: bool = False
    updated_at: datetime | None = None


class OrderItem(Schema):
    name: str
    quantity: int = Field(ge=1)
    unit_price: float | None = Field(default=None, ge=0)


class Order(Schema):
    order_id: str
    order_date: datetime
    items: list[OrderItem]
    total_amount: float = Field(ge=0)
    currency: str = "INR"
    status: str
    estimated_delivery: Date | None = None
    is_demo: bool = True


class UploadDelete(Schema):
    file_id: str | None = Field(default=None, min_length=1, max_length=200)
    public_id: str | None = Field(default=None, max_length=400)

    @model_validator(mode="after")
    def require_identifier(self):
        if not self.file_id and not self.public_id:
            raise ValueError("fileId is required")
        return self


def response(data: Any) -> dict[str, Any]:
    return data
