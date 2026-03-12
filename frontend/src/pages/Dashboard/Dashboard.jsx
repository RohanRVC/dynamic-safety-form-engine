import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FileText,
  GitBranch,
  CheckSquare,
  AlertTriangle,
  ArrowRight,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formApi, submissionApi, branchApi, API_BASE } from "@/services/api";
import { formatDate } from "@/lib/utils";
import { isAlertSubmission } from "@/lib/alertUtils";
import { staggerContainer, staggerItem, spring } from "@/lib/motion";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    setLoadError(null);
    Promise.allSettled([
      formApi.list(),
      submissionApi.listAll(1, 20),
      branchApi.list(),
    ]).then((results) => {
      const errors = [];
      const forms =
        results[0].status === "fulfilled" && Array.isArray(results[0].value)
          ? results[0].value
          : [];
      if (results[0].status === "rejected") errors.push(`Forms: ${results[0].reason?.message || results[0].reason}`);

      const subs =
        results[1].status === "fulfilled" && results[1].value
          ? results[1].value
          : { items: [], total: 0 };
      if (results[1].status === "rejected") errors.push(`Submissions: ${results[1].reason?.message || results[1].reason}`);

      const branches =
        results[2].status === "fulfilled" && Array.isArray(results[2].value)
          ? results[2].value
          : [];
      if (results[2].status === "rejected") errors.push(`Branches: ${results[2].reason?.message || results[2].reason}`);

      if (errors.length > 0) {
        setLoadError(errors.join(" • "));
      }

      const items = subs.items || [];
      const alertCount = items.filter(isAlertSubmission).length;
      setStats({
        forms: forms.length,
        submissions: subs.total ?? 0,
        branches: branches.length,
        alerts: alertCount,
      });
      setSubmissions(items);
      setLoading(false);
    });
  }, []);

  const statCards = [
    {
      label: "Form Templates",
      value: stats?.forms ?? 0,
      icon: FileText,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/15 dark:bg-blue-500/20",
      accent: "from-blue-500/20 via-blue-500/5 to-transparent",
      borderAccent: "border-l-blue-500/50",
    },
    {
      label: "Total Submissions",
      value: stats?.submissions ?? 0,
      icon: CheckSquare,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/15 dark:bg-emerald-500/20",
      accent: "from-emerald-500/20 via-emerald-500/5 to-transparent",
      borderAccent: "border-l-emerald-500/50",
    },
    {
      label: "Active Branches",
      value: stats?.branches ?? 0,
      icon: GitBranch,
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-500/15 dark:bg-violet-500/20",
      accent: "from-violet-500/20 via-violet-500/5 to-transparent",
      borderAccent: "border-l-violet-500/50",
    },
    {
      label: "Safety Alerts",
      value: stats?.alerts ?? 0,
      icon: AlertTriangle,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/15 dark:bg-amber-500/20",
      accent: "from-amber-500/25 via-amber-500/5 to-transparent",
      borderAccent: "border-l-amber-500/50",
    },
  ];

  return (
    <div className="dashboard-page p-4 sm:p-6 space-y-4 sm:space-y-6 pb-8">
      {loadError && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">
          <p className="font-semibold text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Can&apos;t load data from the API
          </p>
          <p className="mt-2 text-muted-foreground">{loadError}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            API base: <code className="rounded bg-muted px-1 py-0.5">{API_BASE}</code>
            {API_BASE === "/api" && (
              <> — Production builds must set <code className="rounded bg-muted px-1">VITE_API_URL</code> to your backend URL and rebuild.</>
            )}
          </p>
        </div>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Safety inspection overview
          </p>
        </div>
        <Link to="/form-builder" className="shrink-0">
          <Button className="w-full sm:w-auto">
            <FileText className="h-4 w-4 mr-2" /> New Form Template
          </Button>
        </Link>
      </div>

      {/* Stat Cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statCards.map((s) => (
          <motion.div
            key={s.label}
            variants={staggerItem}
            whileHover={{ y: -4, transition: spring.smooth }}
            whileTap={{ scale: 0.99 }}
            className={`dashboard-stat-card p-5 cursor-default relative overflow-hidden border-l-4 ${s.borderAccent}`}
          >
            {/* Soft color wash */}
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${s.accent} opacity-90`}
              aria-hidden
            />
            {loading ? (
              <Skeleton className="h-20 relative rounded-lg" />
            ) : (
              <div className="flex items-start justify-between relative">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
                  <p className="text-3xl font-bold mt-1.5 tabular-nums tracking-tight">
                    {s.value}
                  </p>
                </div>
                <div
                  className={`h-11 w-11 rounded-2xl ${s.bg} flex items-center justify-center shadow-inner ring-1 ring-black/5 dark:ring-white/10`}
                >
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Submissions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring.gentle, delay: 0.15 }}
          className="lg:col-span-2 dashboard-panel"
        >
          <div className="dashboard-panel-header flex items-center justify-between">
            <h3 className="font-semibold">Recent Submissions</h3>
            <Link to="/submissions">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="divide-y divide-border/40 p-1">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-4"><Skeleton className="h-12" /></div>
              ))
            ) : submissions.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No submissions yet
              </div>
            ) : (
              submissions.slice(0, 5).map((sub) => (
                <div
                  key={sub.id}
                  className="dashboard-row flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 p-4 hover:translate-x-0.5"
                >
                  <div className="h-9 w-9 rounded-xl bg-primary/15 dark:bg-primary/25 flex items-center justify-center ring-1 ring-primary/10">
                    <CheckSquare className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{sub.form_name || `Form #${sub.form_id}`}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <GitBranch className="h-3 w-3" />
                      {sub.branch_name || `Branch #${sub.branch_id}`}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(sub.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Safety Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring.gentle, delay: 0.22 }}
          className="glass-card overflow-hidden"
        >
          <div className="p-4 border-b border-border/50">
            <h3 className="font-semibold">Safety Alerts</h3>
          </div>
          <div className="p-4 space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))
            ) : submissions.filter(isAlertSubmission).length === 0 ? (
              <div className="text-center py-6 text-sm text-muted-foreground">
                No active alerts
              </div>
            ) : (
              submissions
                .filter(isAlertSubmission)
                .slice(0, 5)
                .map((sub) => {
                  const d = sub.submission_data || {};
                  const label = d.damage_severity || d.severity || (d.damage === "Yes" ? "Damage reported" : (d.depth >= 4 ? "Safety warning (depth ≥ 4)" : "Alert"));
                  return (
                    <motion.div
                      key={sub.id}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={spring.smooth}
                      className="flex items-start gap-3 p-3.5 rounded-xl bg-gradient-to-br from-amber-500/15 to-orange-500/5 dark:from-amber-500/20 dark:to-orange-500/10 border border-amber-500/20 dark:border-amber-500/25 hover:from-amber-500/20 hover:to-orange-500/10 transition-all duration-300 shadow-sm"
                    >
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          {label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {sub.branch_name} • {formatDate(sub.created_at)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
