import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  GitBranch,
  FileText,
  CheckSquare,
  ExternalLink,
  Plus,
  ListChecks,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { spring } from "@/lib/motion";

const sections = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    body: "Your home base. See counts for form templates, submissions, branches, and safety alerts. Open Recent Submissions or jump to alerts from here.",
  },
  {
    title: "Branch Metadata",
    icon: GitBranch,
    body: "Add and manage job sites (branches). Every submission is tied to a branch—create branches first so inspectors can select the right location when filling a form.",
  },
  {
    title: "Form Templates",
    icon: FileText,
    body: "Lists all saved templates. Duplicate or delete from the card actions. Use New Template to open the builder, or Fill Form to complete an existing template as an inspector.",
  },
  {
    title: "Form Builder",
    icon: Plus,
    body: "Drag fields onto the canvas, edit labels and options in the field panel, set logic rules if needed, then use Save Template at the bottom. Edit an existing template via Form Templates → Edit.",
  },
  {
    title: "Fill Form (Form Renderer)",
    icon: ListChecks,
    body: "Pick a template from the sidebar, choose a branch, then complete the dynamic fields. Submit sends data to the server; you’ll get a success confirmation.",
  },
  {
    title: "Submissions",
    icon: CheckSquare,
    body: "Browse all submissions with pagination. Use the header search to filter by form or branch name. Open the eye icon to view full submission details.",
  },
  {
    title: "Safety alerts",
    icon: AlertTriangle,
    body: "Submissions that match alert rules appear on the Dashboard and in the bell menu. Filter Submissions with the alerts link when you only want to review those.",
  },
];

export default function HowToUsePage() {
  return (
    <motion.div
      className="page-shell p-4 sm:p-6 lg:p-8 space-y-6 max-w-3xl pb-10"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring.gentle}
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight">
          How to use the form engine
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Quick guide to branches, templates, filling forms, and submissions—no backend changes required;
          this page is help only.
        </p>
      </div>

      <div className="surface-panel p-6 space-y-6">
        <p className="text-sm text-muted-foreground">
          Typical flow:{" "}
          <strong className="text-foreground">Branches</strong> →{" "}
          <strong className="text-foreground">Form Templates / Builder</strong> →{" "}
          <strong className="text-foreground">Fill Form</strong> →{" "}
          <strong className="text-foreground">Submissions</strong>.
        </p>

        <ol className="space-y-5">
          {sections.map((s, i) => (
            <li key={s.title} className="flex gap-4">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold">
                {i + 1}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <s.icon className="h-4 w-4 text-muted-foreground" />
                  <h2 className="font-semibold font-display">{s.title}</h2>
                </div>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/form-builder">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Open Form Builder
          </Button>
        </Link>
        <Link to="/form-renderer">
          <Button variant="outline" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Fill a form
          </Button>
        </Link>
        <Link to="/form-templates">
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Form Templates
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
