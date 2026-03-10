from pydantic import BaseModel
from datetime import datetime


class BranchCreate(BaseModel):
    name: str
    location: str


class BranchResponse(BaseModel):
    id: int
    name: str
    location: str
    created_at: datetime

    model_config = {"from_attributes": True}
