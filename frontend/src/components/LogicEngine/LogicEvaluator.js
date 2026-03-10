const OPERATORS = {
  "==": (a, b) => a == b,
  "!=": (a, b) => a != b,
  ">": (a, b) => Number(a) > Number(b),
  "<": (a, b) => Number(a) < Number(b),
  ">=": (a, b) => Number(a) >= Number(b),
  "<=": (a, b) => Number(a) <= Number(b),
  in: (a, b) => Array.isArray(b) && b.includes(a),
  not_in: (a, b) => Array.isArray(b) && !b.includes(a),
};

export function evaluateCondition(condition, formValues) {
  const { field, operator, value } = condition;
  const fieldValue = formValues[field];
  if (fieldValue === undefined || fieldValue === null) return false;

  const opFn = OPERATORS[operator];
  if (!opFn) return false;

  try {
    return opFn(fieldValue, value);
  } catch {
    return false;
  }
}

export function evaluateLogicRules(rules, formValues) {
  const effects = {};

  for (const rule of rules || []) {
    const { condition, action } = rule;
    const met = evaluateCondition(condition, formValues);

    if (met && action?.target) {
      if (!effects[action.target]) {
        effects[action.target] = [];
      }
      effects[action.target].push({
        type: action.type,
        style: action.style,
        active: true,
      });
    }
  }

  return effects;
}

/**
 * @param {string} fieldId
 * @param {Record<string, Array<{type: string, active: boolean}>>} effects
 * @param {Array<{condition: object, action: {type: string, target: string}}>} [logicRules] - if provided, fields that are targets of "show" rules are hidden by default until condition is met
 */
export function getFieldVisibility(fieldId, effects, logicRules) {
  const fieldEffects = effects[fieldId] || [];
  const hideEffect = fieldEffects.find((e) => e.type === "hide" && e.active);
  const showEffect = fieldEffects.find((e) => e.type === "show" && e.active);

  if (hideEffect) return false;

  const isTargetOfShowRule = (logicRules || []).some(
    (r) => r.action?.type === "show" && r.action?.target === fieldId
  );
  if (isTargetOfShowRule) {
    return !!showEffect;
  }

  if (showEffect) return true;
  return true;
}

export function getFieldRequired(fieldId, baseRequired, effects) {
  const fieldEffects = effects[fieldId] || [];
  const requireEffect = fieldEffects.find((e) => e.type === "require" && e.active);
  const unrequireEffect = fieldEffects.find((e) => e.type === "unrequire" && e.active);

  if (requireEffect) return true;
  if (unrequireEffect) return false;
  return baseRequired;
}

export function getFieldHighlight(fieldId, effects) {
  const fieldEffects = effects[fieldId] || [];
  const highlightEffect = fieldEffects.find((e) => e.type === "highlight" && e.active);
  return highlightEffect ? "ring-2 ring-orange-400 bg-orange-50 dark:bg-orange-950/30" : "";
}
