import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Zap, RefreshCw, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormStore } from "@/store/formStore";
import { cn } from "@/lib/utils";

const OPERATORS = ["==", "!=", ">", "<", ">=", "<="];
const ACTION_TYPES = [
  { value: "show", label: "Show", color: "bg-green-500" },
  { value: "hide", label: "Hide", color: "bg-gray-500" },
  { value: "require", label: "Require", color: "bg-blue-500" },
  { value: "unrequire", label: "Unrequire", color: "bg-gray-400" },
  { value: "highlight", label: "Highlight", color: "bg-orange-500" },
];

export default function LogicBuilder() {
  const { fields, logicRules, addLogicRule, updateLogicRule, removeLogicRule } = useFormStore();

  const addNewRule = () => {
    if (fields.length < 2) return;
    addLogicRule({
      condition: {
        field: fields[0]?.id || "",
        operator: "==",
        value: "",
      },
      action: {
        type: "show",
        target: fields[1]?.id || fields[0]?.id || "",
      },
    });
  };

  return (
    <div className="glass-card">
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-sm">Logic Builder</h3>
          <RefreshCw className="h-3.5 w-3.5 text-muted-foreground cursor-pointer hover:text-foreground transition-colors" />
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <AnimatePresence>
          {logicRules.map((rule, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-2 flex-wrap"
            >
              <span className="text-xs font-semibold text-muted-foreground w-6">IF</span>

              <Select
                value={rule.condition.field}
                onValueChange={(val) =>
                  updateLogicRule(idx, {
                    ...rule,
                    condition: { ...rule.condition, field: val },
                  })
                }
              >
                <SelectTrigger className="h-8 w-32 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fields.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={rule.condition.operator}
                onValueChange={(val) =>
                  updateLogicRule(idx, {
                    ...rule,
                    condition: { ...rule.condition, operator: val },
                  })
                }
              >
                <SelectTrigger className="h-8 w-16 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {OPERATORS.map((op) => (
                    <SelectItem key={op} value={op}>
                      {op}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                value={rule.condition.value}
                onChange={(e) => {
                  const val = e.target.value;
                  const numVal = Number(val);
                  updateLogicRule(idx, {
                    ...rule,
                    condition: {
                      ...rule.condition,
                      value: !isNaN(numVal) && val !== "" ? numVal : val,
                    },
                  });
                }}
                className="h-8 w-20 text-xs"
                placeholder="Value"
              />

              <span className="text-xs font-semibold text-muted-foreground">THEN</span>

              <Select
                value={rule.action.type}
                onValueChange={(val) =>
                  updateLogicRule(idx, {
                    ...rule,
                    action: { ...rule.action, type: val },
                  })
                }
              >
                <SelectTrigger className="h-8 w-28 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTION_TYPES.map((a) => (
                    <SelectItem key={a.value} value={a.value}>
                      <div className="flex items-center gap-2">
                        <div className={cn("h-2 w-2 rounded-full", a.color)} />
                        {a.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={rule.action.target}
                onValueChange={(val) =>
                  updateLogicRule(idx, {
                    ...rule,
                    action: { ...rule.action, target: val },
                  })
                }
              >
                <SelectTrigger className="h-8 w-32 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fields.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive"
                onClick={() => removeLogicRule(idx)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>

        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs"
          onClick={addNewRule}
          disabled={fields.length < 2}
        >
          <Plus className="h-3 w-3 mr-1" /> Add Rule
        </Button>
      </div>
    </div>
  );
}
