import { useEffect, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import VideoUploader from "@/components/VideoUploader/VideoUploader";
import {
  evaluateLogicRules,
  getFieldVisibility,
  getFieldRequired,
  getFieldHighlight,
} from "@/components/LogicEngine/LogicEvaluator";
import { useBranches } from "@/hooks/useFormSchema";
import { submissionApi, branchApi } from "@/services/api";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function FormRenderer({ schema, logicRules = [], formId, onSuccess }) {
  const { control, handleSubmit, watch, formState: { errors }, reset } = useForm();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [dynamicOptions, setDynamicOptions] = useState({});
  const { branches, error: branchesError } = useBranches();

  const formValues = watch();
  const fields = schema?.fields || [];

  const effects = useMemo(
    () => evaluateLogicRules(logicRules, formValues),
    [logicRules, formValues]
  );

  useEffect(() => {
    fields.forEach((field) => {
      if (field.data_source === "/metadata/branches") {
        setDynamicOptions((prev) => ({
          ...prev,
          [field.id]: branches.map((b) => b.name),
        }));
      }
    });
  }, [fields, branches]);

  const onSubmit = async (data) => {
    if (!formId) {
      toast.error("No form selected");
      return;
    }
    const branchId = data._branch_id;
    if (!branchId) {
      toast.error("Please select a branch");
      return;
    }

    const { _branch_id, ...formData } = data;
    setSubmitting(true);
    try {
      await submissionApi.submit(formId, {
        branch_id: Number(branchId),
        data: formData,
      });
      setSubmitted(true);
      toast.success("Form submitted successfully!");
      onSuccess?.();
      setTimeout(() => {
        setSubmitted(false);
        reset();
      }, 3000);
    } catch (err) {
      toast.error(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
        <h3 className="text-xl font-bold mb-2">Submitted!</h3>
        <p className="text-muted-foreground text-sm">Your inspection data has been recorded.</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Branch selector */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Select Branch</Label>
        {branchesError && (
          <p className="text-xs text-destructive rounded-md border border-destructive/30 bg-destructive/10 px-2 py-1.5">
            {branchesError} — fix API connection to load branches.
          </p>
        )}
        <Controller
          name="_branch_id"
          control={control}
          rules={{ required: "Branch is required" }}
          render={({ field: f }) => (
            <Select value={f.value || ""} onValueChange={f.onChange}>
              <SelectTrigger className={cn(errors._branch_id && "border-destructive")}>
                <SelectValue placeholder="Select branch..." />
              </SelectTrigger>
              <SelectContent>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={String(b.id)}>
                    {b.name} — {b.location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors._branch_id && (
          <p className="text-xs text-destructive">{errors._branch_id.message}</p>
        )}
      </div>

      {/* Dynamic fields */}
      <AnimatePresence>
        {fields.map((field) => {
          const visible = getFieldVisibility(field.id, effects, logicRules);
          const required = getFieldRequired(field.id, field.required, effects);
          const highlight = getFieldHighlight(field.id, effects);

          if (!visible) return null;

          return (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={cn("space-y-2 p-3 rounded-lg transition-all", highlight)}
            >
              <Label className="text-sm font-medium">
                {field.label}
                {required && <span className="text-destructive ml-1">*</span>}
              </Label>

              <Controller
                name={field.id}
                control={control}
                rules={required ? { required: `${field.label} is required` } : {}}
                render={({ field: f }) => (
                  <FieldInput
                    fieldDef={field}
                    value={f.value}
                    onChange={f.onChange}
                    dynamicOptions={dynamicOptions[field.id]}
                    error={errors[field.id]}
                  />
                )}
              />

              {errors[field.id] && (
                <p className="text-xs text-destructive">{errors[field.id].message}</p>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>

      <Button type="submit" className="w-full" disabled={submitting} size="lg">
        {submitting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Send className="h-4 w-4 mr-2" />
        )}
        {submitting ? "Submitting..." : "Submit Form"}
      </Button>
    </form>
  );
}

function FieldInput({ fieldDef, value, onChange, dynamicOptions, error }) {
  const options = dynamicOptions || fieldDef.options || [];

  switch (fieldDef.type) {
    case "text":
    case "textarea":
      return fieldDef.type === "textarea" ? (
        <textarea
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={fieldDef.placeholder}
          className={cn(
            "flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none",
            error && "border-destructive"
          )}
        />
      ) : (
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={fieldDef.placeholder}
          className={cn(error && "border-destructive")}
        />
      );

    case "number":
      return (
        <Input
          type="number"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          placeholder={fieldDef.placeholder}
          className={cn(error && "border-destructive")}
        />
      );

    case "date":
      return (
        <Input
          type="date"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className={cn(error && "border-destructive")}
        />
      );

    case "select":
      return (
        <Select value={value || ""} onValueChange={onChange}>
          <SelectTrigger className={cn(error && "border-destructive")}>
            <SelectValue placeholder={fieldDef.placeholder || "Select..."} />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );

    case "radio_group":
      return (
        <RadioGroup value={value || ""} onValueChange={onChange} className="flex gap-4">
          {options.map((opt) => (
            <div key={opt} className="flex items-center space-x-2">
              <RadioGroupItem value={opt} id={`${fieldDef.id}-${opt}`} />
              <Label htmlFor={`${fieldDef.id}-${opt}`} className="text-sm font-normal cursor-pointer">
                {opt}
              </Label>
            </div>
          ))}
        </RadioGroup>
      );

    case "video_upload":
      return <VideoUploader value={value} onChange={onChange} />;

    default:
      return (
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={fieldDef.placeholder}
        />
      );
  }
}
