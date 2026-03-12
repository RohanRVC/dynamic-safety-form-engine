import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  FileText,
  AlertTriangle,
  Copy,
  Trash2,
  ExternalLink,
  MoreHorizontal,
  Clock,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useForms } from "@/hooks/useFormSchema";
import { formApi, API_BASE } from "@/services/api";
import { useSearchStore } from "@/store/searchStore";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";
import { spring } from "@/lib/motion";

export default function FormTemplatesPage() {
  const { forms, loading, error, refetch } = useForms();
  const navigate = useNavigate();
  const { query } = useSearchStore();

  const filteredForms = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    if (!q) return forms;
    return forms.filter((f) => (f.name || "").toLowerCase().includes(q));
  }, [forms, query]);

  const handleDuplicate = async (id) => {
    try {
      await formApi.duplicate(id);
      toast.success("Form duplicated");
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await formApi.delete(id);
      toast.success("Form deleted");
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Form Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {query.trim() ? `${filteredForms.length} of ${forms.length} templates` : `${forms.length} templates created`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-muted-foreground hidden sm:inline">Create form → use Save Template at bottom</span>
          <Link to="/form-renderer">
            <Button variant="outline">
              <ExternalLink className="h-4 w-4 mr-2" /> Fill Form
            </Button>
          </Link>
          <Link to="/form-builder">
            <Button>
              <Plus className="h-4 w-4 mr-2" /> New Template
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">
          <p className="font-semibold text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Failed to load templates
          </p>
          <p className="mt-2 text-muted-foreground">{error}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            API: <code className="rounded bg-muted px-1">{API_BASE}</code>
            {API_BASE === "/api" && " — Set VITE_API_URL for production."}
          </p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : filteredForms.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold mb-1">
            {query.trim() ? "No matching templates" : "No templates yet"}
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            {query.trim()
              ? "Try a different search in the header."
              : "Create your first form template to get started."}
          </p>
          {!query.trim() && (
            <>
              <p className="text-xs text-muted-foreground mb-4">Click below → add fields → click <strong>Save Template</strong> at the bottom of the builder.</p>
              <Link to="/form-builder">
                <Button>
                  <Plus className="h-4 w-4 mr-2" /> Create Template
                </Button>
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredForms.map((form) => (
              <motion.div
                key={form.id}
                layout
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -8 }}
                transition={spring.gentle}
                whileHover={{ y: -6, transition: spring.smooth }}
                whileTap={{ scale: 0.99 }}
                className="glass-card p-5 flex flex-col hover:shadow-xl hover:shadow-primary/5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant="secondary" className="text-[10px]">
                    v{form.version}
                  </Badge>
                </div>

                <h3 className="font-semibold mb-1">{form.name}</h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Layers className="h-3 w-3" /> {form.field_count} fields
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {formatDate(form.created_at)}
                  </span>
                </div>

                <div className="mt-auto flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/form-builder?edit=${form.id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDuplicate(form.id)}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleDelete(form.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
