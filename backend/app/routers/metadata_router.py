from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.branch import Branch
from app.schemas.branch_schema import BranchCreate, BranchResponse

router = APIRouter(prefix="/metadata", tags=["Metadata"])


@router.get("/branches", response_model=list[BranchResponse])
def list_branches(db: Session = Depends(get_db)):
    return db.query(Branch).order_by(Branch.name).all()


@router.post("/branches", response_model=BranchResponse, status_code=201)
def create_branch(payload: BranchCreate, db: Session = Depends(get_db)):
    branch = Branch(name=payload.name, location=payload.location)
    db.add(branch)
    db.commit()
    db.refresh(branch)
    return branch


@router.delete("/branches/{branch_id}", status_code=204)
def delete_branch(branch_id: int, db: Session = Depends(get_db)):
    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")
    db.delete(branch)
    db.commit()
