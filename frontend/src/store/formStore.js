import { create } from "zustand";

const defaultField = () => ({
  id: `field_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  type: "text",
  label: "New Field",
  placeholder: "",
  required: false,
  options: [],
  data_source: null,
  validation: null,
});

export const useFormStore = create((set, get) => ({
  formName: "Untitled Form",
  fields: [],
  logicRules: [],
  selectedFieldId: null,
  previewMode: false,

  setFormName: (name) => set({ formName: name }),

  addField: (type = "text") => {
    const field = { ...defaultField(), type };
    if (type === "select" || type === "radio_group") {
      field.options = ["Option 1", "Option 2"];
    }
    set((s) => ({ fields: [...s.fields, field] }));
    return field.id;
  },

  updateField: (id, updates) =>
    set((s) => ({
      fields: s.fields.map((f) => (f.id === id ? { ...f, ...updates } : f)),
    })),

  updateFieldId: (oldId, newId) => {
    const trimmed = String(newId ?? "").trim();
    if (!trimmed || trimmed === oldId) return;
    set((s) => {
      const exists = s.fields.some((f) => f.id === trimmed && f.id !== oldId);
      if (exists) return s;
      return {
        fields: s.fields.map((f) => (f.id === oldId ? { ...f, id: trimmed } : f)),
        selectedFieldId: s.selectedFieldId === oldId ? trimmed : s.selectedFieldId,
        logicRules: s.logicRules.map((r) => ({
          ...r,
          condition: r.condition?.field === oldId ? { ...r.condition, field: trimmed } : r.condition,
          action: r.action?.target === oldId ? { ...r.action, target: trimmed } : r.action,
        })),
      };
    });
  },

  removeField: (id) =>
    set((s) => ({
      fields: s.fields.filter((f) => f.id !== id),
      selectedFieldId: s.selectedFieldId === id ? null : s.selectedFieldId,
      logicRules: s.logicRules.filter(
        (r) => r.condition.field !== id && r.action.target !== id
      ),
    })),

  reorderFields: (startIdx, endIdx) =>
    set((s) => {
      const items = [...s.fields];
      const [removed] = items.splice(startIdx, 1);
      items.splice(endIdx, 0, removed);
      return { fields: items };
    }),

  selectField: (id) => set({ selectedFieldId: id }),

  addLogicRule: (rule) =>
    set((s) => ({ logicRules: [...s.logicRules, rule] })),

  updateLogicRule: (index, rule) =>
    set((s) => ({
      logicRules: s.logicRules.map((r, i) => (i === index ? rule : r)),
    })),

  removeLogicRule: (index) =>
    set((s) => ({
      logicRules: s.logicRules.filter((_, i) => i !== index),
    })),

  togglePreview: () => set((s) => ({ previewMode: !s.previewMode })),

  loadForm: (form) =>
    set({
      formName: form.name,
      fields: form.schema_json?.fields || [],
      logicRules: form.logic_rules || [],
      selectedFieldId: null,
    }),

  resetForm: () =>
    set({
      formName: "Untitled Form",
      fields: [],
      logicRules: [],
      selectedFieldId: null,
      previewMode: false,
    }),

  getFormPayload: () => {
    const { formName, fields, logicRules } = get();
    return {
      name: formName,
      schema: { fields },
      logic_rules: logicRules,
    };
  },
}));
