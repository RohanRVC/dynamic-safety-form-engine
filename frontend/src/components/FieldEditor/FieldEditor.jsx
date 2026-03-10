import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, Database, Zap, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormStore } from "@/store/formStore";
import { Badge } from "@/components/ui/badge";

const DATA_SOURCES = [
  { value: "none", label: "None (Static Options)" },
  { value: "/metadata/branches", label: "Branches API" },
  { value: "/metadata/severities", label: "Severities API" },
];

const VALIDATION_TYPES = [
  { value: "required", label: "Required" },
  { value: "match_to_list", label: "Match to list" },
];

export default function FieldEditor() {
  const { fields, selectedFieldId, updateField, updateFieldId, selectField, logicRules } = useFormStore();
  const field = fields.find((f) => f.id === selectedFieldId);
  const [localFieldId, setLocalFieldId] = useState(field?.id ?? "");

  useEffect(() => {
    setLocalFieldId(field?.id ?? "");
  }, [field?.id, selectedFieldId]);

  if (!field) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-muted-foreground">
        <AlertCircle className="h-8 w-8 mb-3 opacity-30" />
        <p className="text-sm text-center">Select a field to edit its properties</p>
      </div>
    );
  }

  const fieldRules = logicRules.filter(
    (r) => r.condition?.field === field.id || r.action?.target === field.id
  );

  return (
    <motion.div
      key={field.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="font-semibold text-sm">Field Properties</h3>
          <p className="text-xs text-muted-foreground capitalize mt-0.5">
            {field.type.replace("_", " ")}
          </p>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => selectField(null)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Properties */}
      <div className="flex-1 overflow-auto p-4 space-y-5">
        {/* Label */}
        <div className="space-y-2">
          <Label className="text-xs">Label</Label>
          <Input
            value={field.label}
            onChange={(e) => updateField(field.id, { label: e.target.value })}
          />
        </div>

        {/* Field ID - key used in submission data (e.g. damage_severity for dashboard alerts) */}
        <div className="space-y-2">
          <Label className="text-xs">Field ID</Label>
          <Input
            value={localFieldId}
            onChange={(e) => setLocalFieldId(e.target.value)}
            onBlur={() => {
              const trimmed = localFieldId.trim();
              if (trimmed && trimmed !== field.id) {
                updateFieldId(field.id, trimmed);
              }
              if (!trimmed) setLocalFieldId(field.id);
            }}
            placeholder="e.g. damage_severity"
            className="font-mono text-xs"
          />
          <p className="text-[10px] text-muted-foreground">
            Key in submission data. Use damage_severity, damage, or depth for Safety Alerts.
          </p>
        </div>

        {/* Required */}
        <div className="flex items-center justify-between">
          <Label className="text-xs">Required</Label>
          <Switch
            checked={field.required || false}
            onCheckedChange={(checked) => updateField(field.id, { required: checked })}
          />
        </div>

        {/* Placeholder */}
        <div className="space-y-2">
          <Label className="text-xs">Placeholder</Label>
          <Input
            value={field.placeholder || ""}
            onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
            placeholder="Enter placeholder text..."
          />
        </div>

        {/* Options for select/radio */}
        {(field.type === "select" || field.type === "radio_group") && (
          <div className="space-y-2">
            <Label className="text-xs">Options</Label>
            <div className="space-y-2">
              {(field.options || []).map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...field.options];
                      newOpts[idx] = e.target.value;
                      updateField(field.id, { options: newOpts });
                    }}
                    className="h-8 text-xs"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() => {
                      const newOpts = field.options.filter((_, i) => i !== idx);
                      updateField(field.id, { options: newOpts });
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() =>
                  updateField(field.id, {
                    options: [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`],
                  })
                }
              >
                <Plus className="h-3 w-3 mr-1" /> Add Option
              </Button>
            </div>
          </div>
        )}

        {/* Dynamic Data Source */}
        {field.type === "select" && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-muted-foreground" />
              <Label className="text-xs">Dynamic Data Source</Label>
            </div>
            <Select
              value={field.data_source || "none"}
              onValueChange={(val) =>
                updateField(field.id, { data_source: val === "none" ? null : val })
              }
            >
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATA_SOURCES.map((ds) => (
                  <SelectItem key={ds.value} value={ds.value}>
                    {ds.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.data_source && (
              <p className="text-xs text-muted-foreground">
                Options will be loaded from <code className="text-primary">{field.data_source}</code>
              </p>
            )}
          </div>
        )}

        {/* Validation Rules */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
            <Label className="text-xs">Validation Rules</Label>
          </div>
          <div className="space-y-1.5">
            {VALIDATION_TYPES.map((vt) => (
              <div key={vt.value} className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    field.required && vt.value === "required" ? "bg-primary" : "bg-muted"
                  }`}
                />
                <span className="text-xs">{vt.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Logic Rules */}
        {fieldRules.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-muted-foreground" />
              <Label className="text-xs">Logic Rules</Label>
            </div>
            <div className="space-y-1.5">
              {fieldRules.map((rule, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-muted text-xs">
                  IF <Badge variant="outline" className="text-[10px] mx-0.5">{rule.condition.field}</Badge>
                  {" "}{rule.condition.operator} {String(rule.condition.value)}
                  {" → "}<Badge variant="secondary" className="text-[10px] mx-0.5">{rule.action.type}</Badge>
                  {" "}{rule.action.target}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
