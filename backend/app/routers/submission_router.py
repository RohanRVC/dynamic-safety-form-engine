import math
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.form_submission import FormSubmission
from app.schemas.submission_schema import (
    FormSubmissionCreate,
    FormSubmissionResponse,
    PaginatedSubmissions,
)
from app.services.validation_service import validate_form_submission

router = APIRouter(prefix="/forms", tags=["Submissions"])


@router.post("/{form_id}/submission", response_model=FormSubmissionResponse, status_code=201)
def submit_form(form_id: int, payload: FormSubmissionCreate, db: Session = Depends(get_db)):
    is_valid, errors, form = validate_form_submission(
        db, form_id, payload.branch_id, payload.data
    )
    if not is_valid:
        raise HTTPException(status_code=422, detail={"validation_errors": errors})

    submission = FormSubmission(
        form_id=form_id,
        branch_id=payload.branch_id,
        submission_data=payload.data,
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    return FormSubmissionResponse(
        id=submission.id,
        form_id=submission.form_id,
        branch_id=submission.branch_id,
        submission_data=submission.submission_data,
        created_at=submission.created_at,
        branch_name=submission.branch.name if submission.branch else None,
        form_name=submission.form.name if submission.form else None,
    )


@router.get("/{form_id}/submissions", response_model=PaginatedSubmissions)
def list_submissions(
    form_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(FormSubmission).filter(FormSubmission.form_id == form_id)
    total = query.count()
    items = (
        query.order_by(FormSubmission.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return PaginatedSubmissions(
        items=[
            FormSubmissionResponse(
                id=s.id,
                form_id=s.form_id,
                branch_id=s.branch_id,
                submission_data=s.submission_data,
                created_at=s.created_at,
                branch_name=s.branch.name if s.branch else None,
                form_name=s.form.name if s.form else None,
            )
            for s in items
        ],
        total=total,
        page=page,
        page_size=page_size,
        pages=math.ceil(total / page_size) if total > 0 else 0,
    )


@router.get("/submissions/all", response_model=PaginatedSubmissions)
def list_all_submissions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(FormSubmission)
    total = query.count()
    items = (
        query.order_by(FormSubmission.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return PaginatedSubmissions(
        items=[
            FormSubmissionResponse(
                id=s.id,
                form_id=s.form_id,
                branch_id=s.branch_id,
                submission_data=s.submission_data,
                created_at=s.created_at,
                branch_name=s.branch.name if s.branch else None,
                form_name=s.form.name if s.form else None,
            )
            for s in items
        ],
        total=total,
        page=page,
        page_size=page_size,
        pages=math.ceil(total / page_size) if total > 0 else 0,
    )
