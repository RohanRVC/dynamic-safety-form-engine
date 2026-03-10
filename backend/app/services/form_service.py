from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.form_definition import FormDefinition
from app.models.form_submission import FormSubmission
from app.schemas.form_schema import FormDefinitionCreate


def create_form_definition(db: Session, form_data: FormDefinitionCreate) -> FormDefinition:
    existing = (
        db.query(FormDefinition)
        .filter(FormDefinition.name == form_data.name)
        .order_by(FormDefinition.version.desc())
        .first()
    )
    next_version = (existing.version + 1) if existing else 1

    db_form = FormDefinition(
        name=form_data.name,
        schema_json=form_data.schema.model_dump(),
        logic_rules=[r.model_dump() for r in (form_data.logic_rules or [])],
        version=next_version,
    )
    db.add(db_form)
    db.commit()
    db.refresh(db_form)
    return db_form


def get_form_definition(db: Session, form_id: int) -> FormDefinition | None:
    return db.query(FormDefinition).filter(FormDefinition.id == form_id).first()


def update_form_definition(db: Session, form_id: int, form_data: FormDefinitionCreate) -> FormDefinition | None:
    form = get_form_definition(db, form_id)
    if not form:
        return None
    form.name = form_data.name
    form.schema_json = form_data.schema.model_dump()
    form.logic_rules = [r.model_dump() for r in (form_data.logic_rules or [])]
    form.version += 1
    db.commit()
    db.refresh(form)
    return form


def list_form_definitions(db: Session) -> list[FormDefinition]:
    return (
        db.query(FormDefinition)
        .order_by(FormDefinition.created_at.desc())
        .all()
    )


def duplicate_form(db: Session, form_id: int, new_name: str | None = None) -> FormDefinition | None:
    original = get_form_definition(db, form_id)
    if not original:
        return None

    name = new_name or f"{original.name} (Copy)"
    db_form = FormDefinition(
        name=name,
        schema_json=original.schema_json,
        logic_rules=original.logic_rules,
        version=1,
    )
    db.add(db_form)
    db.commit()
    db.refresh(db_form)
    return db_form


def delete_form_definition(db: Session, form_id: int) -> bool:
    form = get_form_definition(db, form_id)
    if not form:
        return False
    # Delete all submissions that reference this form first (foreign key)
    db.query(FormSubmission).filter(FormSubmission.form_id == form_id).delete()
    db.delete(form)
    db.commit()
    return True
