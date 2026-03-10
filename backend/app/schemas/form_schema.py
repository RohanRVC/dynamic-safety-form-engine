from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Any, Optional
from datetime import datetime


class FieldSchema(BaseModel):
    id: str
    type: str
    label: str
    options: Optional[list[str]] = None
    required: Optional[bool] = False
    placeholder: Optional[str] = None
    data_source: Optional[str] = None
    validation: Optional[dict[str, Any]] = None

    @field_validator("type")
    @classmethod
    def validate_type(cls, v: str) -> str:
        allowed = {"text", "number", "select", "radio_group", "video_upload", "textarea", "date", "checkbox"}
        if v not in allowed:
            raise ValueError(f"Field type must be one of {allowed}")
        return v


class FormSchemaBody(BaseModel):
    fields: list[FieldSchema]


class LogicCondition(BaseModel):
    field: str
    operator: str
    value: Any

    @field_validator("operator")
    @classmethod
    def validate_operator(cls, v: str) -> str:
        allowed = {"==", "!=", ">", "<", ">=", "<=", "in", "not_in"}
        if v not in allowed:
            raise ValueError(f"Operator must be one of {allowed}")
        return v


class LogicAction(BaseModel):
    type: str
    target: str
    style: Optional[dict[str, str]] = None

    @field_validator("type")
    @classmethod
    def validate_action_type(cls, v: str) -> str:
        allowed = {"show", "hide", "require", "unrequire", "highlight"}
        if v not in allowed:
            raise ValueError(f"Action type must be one of {allowed}")
        return v


class LogicRule(BaseModel):
    condition: LogicCondition
    action: LogicAction


class FormDefinitionCreate(BaseModel):
    name: str
    form_schema: FormSchemaBody = Field(alias="schema")
    logic_rules: Optional[list[LogicRule]] = []

    model_config = {"populate_by_name": True}


class FormDefinitionResponse(BaseModel):
    id: int
    name: str
    form_schema_json: dict[str, Any] = Field(alias="schema_json")
    logic_rules: list[dict[str, Any]]
    version: int
    created_at: datetime

    model_config = {"from_attributes": True, "populate_by_name": True}

    @model_validator(mode="before")
    @classmethod
    def map_orm_schema_json(cls, data: Any) -> Any:
        """When building from ORM, map schema_json -> form_schema_json so we don't shadow BaseModel."""
        if hasattr(data, "schema_json"):
            return {
                "id": data.id,
                "name": data.name,
                "form_schema_json": getattr(data, "schema_json"),
                "logic_rules": getattr(data, "logic_rules", []) or [],
                "version": data.version,
                "created_at": data.created_at,
            }
        return data


class FormDefinitionListResponse(BaseModel):
    id: int
    name: str
    version: int
    field_count: int
    created_at: datetime

    model_config = {"from_attributes": True}
