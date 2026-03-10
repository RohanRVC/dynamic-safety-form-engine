from typing import Any
from fastapi import HTTPException


FIELD_TYPE_VALIDATORS = {
    "text": lambda v: isinstance(v, str),
    "textarea": lambda v: isinstance(v, str),
    "number": lambda v: isinstance(v, (int, float)),
    "select": lambda v: isinstance(v, str),
    "radio_group": lambda v: isinstance(v, str),
    "video_upload": lambda v: isinstance(v, str),
    "date": lambda v: isinstance(v, str),
    "checkbox": lambda v: isinstance(v, bool),
}


def validate_submission_against_schema(
    schema_json: dict[str, Any],
    submission_data: dict[str, Any],
    logic_rules: list[dict] | None = None,
) -> list[str]:
    """Validate submitted data against the form schema definition."""
    errors: list[str] = []
    fields = schema_json.get("fields", [])
    field_map = {f["id"]: f for f in fields}

    for field in fields:
        fid = field["id"]
        required = field.get("required", False)
        ftype = field["type"]

        if ftype == "video_upload":
            continue

        value = submission_data.get(fid)

        if required and (value is None or value == ""):
            errors.append(f"Field '{fid}' is required")
            continue

        if value is None or value == "":
            continue

        validator = FIELD_TYPE_VALIDATORS.get(ftype)
        if validator and not validator(value):
            errors.append(
                f"Field '{fid}' expects type '{ftype}' but got '{type(value).__name__}'"
            )

        if ftype in ("select", "radio_group"):
            options = field.get("options", [])
            if options and value not in options:
                if not field.get("data_source"):
                    errors.append(
                        f"Field '{fid}' value '{value}' is not in allowed options"
                    )

    for key in submission_data:
        if key not in field_map:
            errors.append(f"Unknown field '{key}' in submission")

    return errors
