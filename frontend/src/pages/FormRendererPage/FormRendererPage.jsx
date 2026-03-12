import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, ChevronRight } from "lucide-react";
import FormRenderer from "@/components/FormRenderer/FormRenderer";
import { useFormSchema, useForms } from "@/hooks/useFormSchema";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/motion";

export default function FormRendererPage() {
  const { forms, loading: formsLoading } = useForms();
  const [selectedFormId, setSelectedFormId] = useState(null);
  const { schema, loading: schemaLoading } = useFormSchema(selectedFormId);

  return (
    <div className="flex h-full flex-col lg:flex-row overflow-hidden">
      {/* Form Selector Sidebar */}
      <div className="w-full lg:w-72 flex-shrink-0 border-b lg:border-b-0 lg:border-r flex flex-col max-h-[40vh] lg:max-h-none">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-sm">Available Forms</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Select a form to fill</p>
        </div>
        <div className="flex-1 overflow-auto p-3 space-y-1">
          {formsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-14 rounded-lg" />
            ))
          ) : forms.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No forms available</p>
          ) : (
            forms.map((form) => (
              <button
                key={form.id}
                onClick={() => setSelectedFormId(form.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-300",
                  selectedFormId === form.id
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-muted"
                )}
              >
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{form.name}</p>
                  <p className="text-xs text-muted-foreground">
                    v{form.version} • {form.field_count} fields
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-auto min-h-0">
        {!selectedFormId ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <FileText className="h-12 w-12 mb-3 opacity-20" />
            <p className="text-sm">Select a form from the sidebar to begin</p>
          </div>
        ) : schemaLoading ? (
          <div className="p-8 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : schema ? (
          <div className="max-w-2xl mx-auto p-4 sm:p-8 pb-8">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={spring.gentle}
              className="glass-card p-4 sm:p-6"
            >
              <h2 className="text-xl font-bold mb-1">{schema.name}</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Version {schema.version} • Fill out all required fields
              </p>
              <FormRenderer
                schema={schema.schema_json}
                logicRules={schema.logic_rules}
                formId={schema.id}
              />
            </motion.div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
