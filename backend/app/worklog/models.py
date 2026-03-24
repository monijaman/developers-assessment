from datetime import datetime
from decimal import Decimal
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel, Relationship


class Freelancer(SQLModel, table=True):
    """Freelancer model for worklog system."""
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(index=True)
    email: str = Field(unique=True, index=True)
    hourly_rate: Decimal = Field(decimal_places=2, max_digits=10)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    worklogs: list["Worklog"] = Relationship(back_populates="freelancer", cascade_delete=True)


class Task(SQLModel, table=True):
    """Task model for worklog system."""
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    name: str = Field(index=True)
    description: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    worklogs: list["Worklog"] = Relationship(back_populates="task", cascade_delete=True)


class Worklog(SQLModel, table=True):
    """Worklog model linking freelancer and task."""
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    freelancer_id: UUID = Field(foreign_key="freelancer.id", index=True)
    task_id: UUID = Field(foreign_key="task.id", index=True)
    total_hours: Decimal = Field(decimal_places=2, default=0)
    total_earnings: Decimal = Field(decimal_places=2, default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    freelancer: Freelancer = Relationship(back_populates="worklogs")
    task: Task = Relationship(back_populates="worklogs")
    time_entries: list["TimeEntry"] = Relationship(back_populates="worklog", cascade_delete=True)


class TimeEntry(SQLModel, table=True):
    """Time entry model under a worklog."""
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    worklog_id: UUID = Field(foreign_key="worklog.id", index=True)
    date: datetime = Field(index=True)
    hours_logged: Decimal = Field(decimal_places=2)
    description: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    worklog: Worklog = Relationship(back_populates="time_entries")
