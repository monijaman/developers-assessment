from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class TimeEntryBase(BaseModel):
    """Base time entry schema."""
    date: datetime
    hours_logged: Decimal = Field(gt=0)
    description: str | None = None


class TimeEntryCreate(TimeEntryBase):
    """Create time entry schema."""
    worklog_id: UUID


class TimeEntryResponse(TimeEntryBase):
    """Time entry response schema."""
    id: UUID
    worklog_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class WorklogBase(BaseModel):
    """Base worklog schema."""
    freelancer_id: UUID
    task_id: UUID


class WorklogCreate(WorklogBase):
    """Create worklog schema."""
    pass


class WorklogResponse(WorklogBase):
    """Worklog response schema with computed fields."""
    id: UUID
    freelancer_name: str
    freelancer_hourly_rate: Decimal
    task_name: str
    total_hours: Decimal
    total_earnings: Decimal
    created_at: datetime
    time_entries: list[TimeEntryResponse] = []

    class Config:
        from_attributes = True


class WorklogDetailResponse(WorklogResponse):
    """Worklog detail with freelancer and task info."""
    pass


class PaymentBatchRequest(BaseModel):
    """Payment batch request with date range and exclusions."""
    start_date: datetime
    end_date: datetime
    excluded_worklog_ids: list[UUID] = Field(default_factory=list)
    excluded_freelancer_ids: list[UUID] = Field(default_factory=list)


class PaymentBatchSummary(BaseModel):
    """Payment batch summary before confirmation."""
    worklog_ids: list[UUID]
    total_amount: Decimal = Field(decimal_places=2)
    freelancer_count: int
    entry_count: int


class PaymentBatchConfirm(BaseModel):
    """Confirm payment batch processing."""
    status: str = "confirmed"
