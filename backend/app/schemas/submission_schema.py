from pydantic import BaseModel
from typing import Any
from datetime import datetime


class FormSubmissionCreate(BaseModel):
    branch_id: int
    data: dict[str, Any]


class FormSubmissionResponse(BaseModel):
    id: int
    form_id: int
    branch_id: int
    submission_data: dict[str, Any]
    created_at: datetime
    branch_name: str | None = None
    form_name: str | None = None

    model_config = {"from_attributes": True}


class PaginatedSubmissions(BaseModel):
    items: list[FormSubmissionResponse]
    total: int
    page: int
    page_size: int
    pages: int
