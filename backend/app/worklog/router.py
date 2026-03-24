from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, HTTPException

from app.api.deps import SessionDep
from .models import Worklog
from .schemas import (
    WorklogResponse,
    WorklogDetailResponse,
    PaymentBatchRequest,
    PaymentBatchSummary,
    PaymentBatchConfirm,
)
from . import service

router = APIRouter(prefix="/worklogs", tags=["worklogs"])


@router.get("", response_model=list[WorklogResponse], status_code=200)
def list_worklogs(
    session: SessionDep,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
) -> list[WorklogResponse]:
    """List all worklogs, optionally filtered by date range."""
    worklogs = service.get_worklogs_filtered(session, start_date, end_date)
    return [service.serialize_worklog(worklog) for worklog in worklogs]


@router.get("/{worklog_id}", response_model=WorklogDetailResponse, status_code=200)
def get_worklog_detail(
    worklog_id: UUID,
    session: SessionDep,
) -> WorklogDetailResponse:
    """Get worklog details with time entries."""
    worklog = session.get(Worklog, worklog_id)
    if not worklog:
        raise HTTPException(status_code=404, detail="Worklog not found")
    return service.serialize_worklog(worklog)


@router.post("/payment-batch/preview", response_model=PaymentBatchSummary, status_code=200)
def preview_payment_batch(
    req: PaymentBatchRequest,
    session: SessionDep,
) -> PaymentBatchSummary:
    """Preview payment batch before confirmation."""
    batch_data = service.prepare_payment_batch(
        session,
        req.start_date,
        req.end_date,
        req.excluded_worklog_ids,
        req.excluded_freelancer_ids,
    )
    return PaymentBatchSummary(**batch_data)


@router.post("/payment-batch/confirm", response_model=PaymentBatchConfirm, status_code=201)
def confirm_payment_batch(
    req: PaymentBatchRequest,
    session: SessionDep,
) -> PaymentBatchConfirm:
    """Confirm and process payment batch."""
    service.prepare_payment_batch(
        session,
        req.start_date,
        req.end_date,
        req.excluded_worklog_ids,
        req.excluded_freelancer_ids,
    )
    # In production: update payment status, commit to accounting system, etc.
    # For now: just return confirmation
    return PaymentBatchConfirm(status="confirmed")
