from datetime import datetime, timedelta
from decimal import Decimal

from sqlmodel import SQLModel, Session, create_engine, select

from app import crud
from app import models as app_models
from app.worklog import models as worklog_models
from app.core.config import settings
from app.models import User, UserCreate

engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))


# make sure all SQLModel models are imported (app.models) before initializing DB
# otherwise, SQLModel might fail to initialize relationships properly
# for more details: https://github.com/fastapi/full-stack-fastapi-template/issues/28


def init_db(session: Session) -> None:
    # Tables should be created with Alembic migrations
    # But if you don't want to use migrations, create
    # the tables un-commenting the next lines
    # Ensure SQLModel metadata is registered before table creation.
    _ = app_models, worklog_models
    SQLModel.metadata.create_all(engine)

    user = session.exec(
        select(User).where(User.email == settings.FIRST_SUPERUSER)
    ).first()
    if not user:
        user_in = UserCreate(
            email=settings.FIRST_SUPERUSER,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            is_superuser=True,
        )
        user = crud.create_user(session=session, user_create=user_in)

    seed_freelancers = [
        ("Alice Johnson", "alice@freelance.io", Decimal("55.00")),
        ("Bob Smith", "bob@freelance.io", Decimal("47.50")),
        ("Carol White", "carol@freelance.io", Decimal("62.00")),
        ("Damon Rivera", "damon@freelance.io", Decimal("58.00")),
        ("Elena Park", "elena@freelance.io", Decimal("52.50")),
        ("Fatima Khan", "fatima@freelance.io", Decimal("64.00")),
    ]
    seed_tasks = [
        (
            "CRM Dashboard Revamp",
            "Redesign and optimize CRM workflows and reporting widgets",
        ),
        (
            "Payment Pipeline Integration",
            "Integrate payout state transitions with internal operations APIs",
        ),
        (
            "Ops Table Performance",
            "Improve table filtering and pagination for large datasets",
        ),
        (
            "Role Permissions Matrix",
            "Implement role-based access and restricted operation controls",
        ),
        (
            "Sales Activity Console",
            "Build internal timeline and activity tracking for account teams",
        ),
        (
            "Billing Exception Queue",
            "Create queue workflows for mismatched and disputed invoices",
        ),
    ]

    existing_freelancers = session.exec(select(worklog_models.Freelancer)).all()
    freelancers_by_email = {freelancer.email: freelancer for freelancer in existing_freelancers}
    for name, email, hourly_rate in seed_freelancers:
        if email not in freelancers_by_email:
            freelancer = worklog_models.Freelancer(
                name=name,
                email=email,
                hourly_rate=hourly_rate,
            )
            session.add(freelancer)
            freelancers_by_email[email] = freelancer
    session.commit()
    freelancers = list(session.exec(select(worklog_models.Freelancer)).all())

    existing_tasks = session.exec(select(worklog_models.Task)).all()
    tasks_by_name = {task.name: task for task in existing_tasks}
    for name, description in seed_tasks:
        if name not in tasks_by_name:
            task = worklog_models.Task(name=name, description=description)
            session.add(task)
            tasks_by_name[name] = task
    session.commit()
    tasks = list(session.exec(select(worklog_models.Task)).all())

    target_worklog_count = 84
    existing_worklogs = session.exec(select(worklog_models.Worklog)).all()
    if len(existing_worklogs) >= target_worklog_count:
        return

    base_date = datetime.utcnow().replace(hour=9, minute=0, second=0, microsecond=0)
    for idx in range(len(existing_worklogs), target_worklog_count):
        freelancer = freelancers[idx % len(freelancers)]
        task = tasks[(idx * 2) % len(tasks)]
        created_at = base_date - timedelta(days=(idx % 45))
        worklog = worklog_models.Worklog(
            freelancer_id=freelancer.id,
            task_id=task.id,
            total_hours=Decimal("0.00"),
            total_earnings=Decimal("0.00"),
            created_at=created_at,
        )
        session.add(worklog)

        entry_count = 3 + (idx % 3)
        total_hours = Decimal("0.00")
        for entry_idx in range(entry_count):
            hours = Decimal(str(2 + ((idx + entry_idx) % 5)))
            total_hours += hours
            session.add(
                worklog_models.TimeEntry(
                    worklog_id=worklog.id,
                    date=created_at + timedelta(days=entry_idx),
                    hours_logged=hours,
                    description=(
                        f"{task.name} - sprint item {entry_idx + 1} "
                        f"for batch {idx + 1}"
                    ),
                )
            )

        worklog.total_hours = total_hours
        worklog.total_earnings = total_hours * freelancer.hourly_rate
        session.add(worklog)

    session.commit()
