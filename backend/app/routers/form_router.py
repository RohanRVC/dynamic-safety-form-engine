from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.form_schema import (
    FormDefinitionCreate,
    FormDefinitionResponse,
    FormDefinitionListResponse,
)
from app.services.form_service import (
    create_form_definition,
    get_form_definition,
    list_form_definitions,
    duplicate_form,
    delete_form_definition,
    update_form_definition,
)

router = APIRouter(prefix="/forms", tags=["Forms"])


@router.post("/definitions", response_model=FormDefinitionResponse, status_code=201)
def create_form(payload: FormDefinitionCreate, db: Session = Depends(get_db)):
    return create_form_definition(db, payload)


@router.get("/definitions", response_model=list[FormDefinitionListResponse])
def list_forms(db: Session = Depends(get_db)):
    forms = list_form_definitions(db)
    result = []
    for f in forms:
        field_count = len(f.schema_json.get("fields", [])) if f.schema_json else 0
        result.append(
            FormDefinitionListResponse(
                id=f.id,
                name=f.name,
                version=f.version,
                field_count=field_count,
                created_at=f.created_at,
            )
        )
    return result


@router.get("/definitions/{form_id}", response_model=FormDefinitionResponse)
def get_form(form_id: int, db: Session = Depends(get_db)):
    form = get_form_definition(db, form_id)
    if not form:
        raise HTTPException(status_code=404, detail="Form definition not found")
    return form


@router.put("/definitions/{form_id}", response_model=FormDefinitionResponse)
def update_form(form_id: int, payload: FormDefinitionCreate, db: Session = Depends(get_db)):
    form = update_form_definition(db, form_id, payload)
    if not form:
        raise HTTPException(status_code=404, detail="Form definition not found")
    return form


@router.post("/definitions/{form_id}/duplicate", response_model=FormDefinitionResponse)
def duplicate_form_route(form_id: int, new_name: str | None = None, db: Session = Depends(get_db)):
    form = duplicate_form(db, form_id, new_name)
    if not form:
        raise HTTPException(status_code=404, detail="Original form not found")
    return form


@router.delete("/definitions/{form_id}", status_code=204)
def delete_form(form_id: int, db: Session = Depends(get_db)):
    if not delete_form_definition(db, form_id):
        raise HTTPException(status_code=404, detail="Form definition not found")
