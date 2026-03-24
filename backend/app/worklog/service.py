from datetime import datetime
from decimal import Decimal
from uuid import UUID

from sqlmodel import Session, select

from .models import Freelancer, TimeEntry, Worklog


def get_worklogs_filtered(
    session: Session,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
) -> list[Worklog]:
    """Get worklogs filtered by date range of time entries."""
    query = select(Worklog)
    
    if start_date or end_date:
        # Join with TimeEntry to filter by date range
        query = query.join(TimeEntry)
        
        if start_date:
            query = query.where(TimeEntry.date >= start_date)
        if end_date:
            query = query.where(TimeEntry.date <= end_date)
    
    rows = session.exec(query.distinct()).all()
    return rows


def calculate_worklog_totals(worklog: Worklog, freelancer: Freelancer) -> tuple[Decimal, Decimal]:
    """Calculate total hours and earnings for a worklog."""
    total_hours = sum(
        (entry.hours_logged for entry in worklog.time_entries),
        Decimal("0"),
    )
    total_earnings = total_hours * freelancer.hourly_rate
    return total_hours, total_earnings


def prepare_payment_batch(
    session: Session,
    start_date: datetime,
    end_date: datetime,
    excluded_worklog_ids: list[UUID] | None = None,
    excluded_freelancer_ids: list[UUID] | None = None,
) -> dict:
    """Prepare payment batch summary."""
    excluded_worklog_ids = excluded_worklog_ids or []
    excluded_freelancer_ids = excluded_freelancer_ids or []
    
    # Get worklogs in date range
    worklogs = get_worklogs_filtered(session, start_date, end_date)
    
    # Filter out exclusions
    worklogs = [
        w for w in worklogs
        if (w.id not in excluded_worklog_ids and 
            w.freelancer_id not in excluded_freelancer_ids)
    ]
    
    # Calculate totals
    total_amount = Decimal("0")
    freelancer_ids = set()
    entry_count = 0
    
    for worklog in worklogs:
        for entry in worklog.time_entries:
            if start_date <= entry.date <= end_date:
                total_amount += entry.hours_logged * worklog.freelancer.hourly_rate
                entry_count += 1
        freelancer_ids.add(worklog.freelancer_id)
    
    return {
        "worklog_ids": [w.id for w in worklogs],
        "total_amount": total_amount,
        "freelancer_count": len(freelancer_ids),
        "entry_count": entry_count,
    }


def serialize_worklog(worklog: Worklog) -> dict:
    """Convert DB model to API response shape."""
    entries = sorted(worklog.time_entries, key=lambda entry: entry.date)
    return {
        "id": worklog.id,
        "freelancer_id": worklog.freelancer_id,
        "task_id": worklog.task_id,
        "freelancer_name": worklog.freelancer.name,
        "freelancer_hourly_rate": worklog.freelancer.hourly_rate,
        "task_name": worklog.task.name,
        "total_hours": worklog.total_hours,
        "total_earnings": worklog.total_earnings,
        "created_at": worklog.created_at,
        "time_entries": [
            {
                "id": entry.id,
                "worklog_id": entry.worklog_id,
                "date": entry.date,
                "hours_logged": entry.hours_logged,
                "description": entry.description,
                "created_at": entry.created_at,
            }
            for entry in entries
        ],
    }
