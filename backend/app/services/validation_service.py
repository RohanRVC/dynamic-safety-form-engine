from sqlalchemy.orm import Session
from app.models.branch import Branch
from app.models.form_definition import FormDefinition
from app.utils.schema_validator import validate_submission_against_schema


def validate_branch_exists(db: Session, branch_id: int) -> Branch | None:
    return db.query(Branch).filter(Branch.id == branch_id).first()


def validate_form_submission(
    db: Session, form_id: int, branch_id: int, data: dict
) -> tuple[bool, list[str], FormDefinition | None]:
    """Full validation pipeline for form submissions."""
    errors: list[str] = []

    form = db.query(FormDefinition).filter(FormDefinition.id == form_id).first()
    if not form:
        errors.append(f"Form definition with id {form_id} not found")
        return False, errors, None

    branch = validate_branch_exists(db, branch_id)
    if not branch:
        errors.append(f"Branch with id {branch_id} not found")
        return False, errors, form

    schema_errors = validate_submission_against_schema(
        form.schema_json, data, form.logic_rules
    )
    errors.extend(schema_errors)

    return len(errors) == 0, errors, form
