from typing import Any
import operator

OPERATORS = {
    "==": operator.eq,
    "!=": operator.ne,
    ">": operator.gt,
    "<": operator.lt,
    ">=": operator.ge,
    "<=": operator.le,
}


def evaluate_condition(condition: dict[str, Any], data: dict[str, Any]) -> bool:
    field = condition.get("field")
    op = condition.get("operator")
    value = condition.get("value")

    field_value = data.get(field)
    if field_value is None:
        return False

    if op in ("in", "not_in"):
        if op == "in":
            return field_value in value
        return field_value not in value

    op_func = OPERATORS.get(op)
    if not op_func:
        return False

    try:
        return op_func(field_value, value)
    except TypeError:
        return False


def apply_logic_rules(
    rules: list[dict[str, Any]], data: dict[str, Any]
) -> dict[str, Any]:
    """Evaluate logic rules against submission data and return field effects."""
    effects: dict[str, Any] = {}

    for rule in rules:
        condition = rule.get("condition", {})
        action = rule.get("action", {})

        if evaluate_condition(condition, data):
            target = action.get("target")
            action_type = action.get("type")
            if target:
                effects[target] = {
                    "action": action_type,
                    "style": action.get("style"),
                }

    return effects
