import { useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Eye } from "lucide-react";
import { useFormStore } from "@/store/formStore";
import FormRenderer from "@/components/FormRenderer/FormRenderer";
import { cn } from "@/lib/utils";

export default function LivePreview() {
  const { fields, logicRules, formName } = useFormStore();

  const schema = useMemo(() => ({ fields }), [fields]);

  if (fields.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-muted-foreground">
        <Eye className="h-8 w-8 mb-3 opacity-30" />
        <p className="text-sm text-center">Add fields to see a live preview</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm">Live Form Preview</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{formName}</p>
      </div>
      <div className="flex-1 overflow-auto p-4">
        <div className="glass-card p-5">
          <h4 className="font-bold text-base mb-4">{formName}</h4>
          <FormRenderer
            schema={schema}
            logicRules={logicRules}
            formId={null}
          />
        </div>
      </div>
    </div>
  );
}
