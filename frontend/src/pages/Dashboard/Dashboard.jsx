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
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AnimatedCounter from "@/components/AnimatedCounter";
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
      const forms = results[0].status === "fulfilled" && Array.isArray(results[0].value) ? results[0].value : [];
      if (results[0].status === "rejected") errors.push(`Forms: ${results[0].reason?.message || results[0].reason}`);

      const subs = results[1].status === "fulfilled" && results[1].value ? results[1].value : { items: [], total: 0 };
      if (results[1].status === "rejected") errors.push(`Submissions: ${results[1].reason?.message || results[1].reason}`);

      const branches = results[2].status === "fulfilled" && Array.isArray(results[2].value) ? results[2].value : [];
      if (results[2].status === "rejected") errors.push(`Branches: ${results[2].reason?.message || results[2].reason}`);

      if (errors.length > 0) setLoadError(errors.join(" • "));

      const items = subs.items || [];
      const alertCount = items.filter(isAlertSubmission).length;
      setStats({ forms: forms.length, submissions: subs.total ?? 0, branches: branches.length, alerts: alertCount });
      setSubmissions(items);
      setLoading(false);
    });
  }, []);

  const statCards = [
    {
      label: "Form Templates",
      value: stats?.forms ?? 0,
      icon: FileText,
      gradient: "from-blue-500 to-blue-600",
      lightBg: "bg-blue-50 dark:bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Total Submissions",
      value: stats?.submissions ?? 0,
      icon: CheckSquare,
      gradient: "from-emerald-500 to-emerald-600",
      lightBg: "bg-emerald-50 dark:bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Active Branches",
      value: stats?.branches ?? 0,
      icon: GitBranch,
      gradient: "from-violet-500 to-violet-600",
      lightBg: "bg-violet-50 dark:bg-violet-500/10",
      iconColor: "text-violet-600 dark:text-violet-400",
    },
    {
      label: "Safety Alerts",
      value: stats?.alerts ?? 0,
      icon: AlertTriangle,
      gradient: "from-amber-500 to-orange-500",
      lightBg: "bg-amber-50 dark:bg-amber-500/10",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div className="dashboard-page p-4 sm:p-6 lg:p-8 space-y-6 pb-10">
      {loadError && (
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm">
          <p className="font-semibold text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Can&apos;t load data from the API
          </p>
          <p className="mt-2 text-muted-foreground">{loadError}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            API base: <code className="rounded-lg bg-muted px-1.5 py-0.5">{API_BASE}</code>
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back! Here&apos;s your safety inspection overview.
          </p>
        </div>
        <Link to="/form-builder" className="shrink-0">
          <Button size="lg" className="shadow-lg shadow-primary/20 gap-2">
            <FileText className="h-4 w-4" /> New Form Template
          </Button>
        </Link>
      </div>

      {/* Stat Cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5"
      >
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            variants={staggerItem}
            whileHover={{ y: -4, transition: spring.smooth }}
            className="stat-card p-5 cursor-default group glow-hover"
          >
            {loading ? (
              <Skeleton className="h-24 rounded-xl" />
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className={`h-11 w-11 rounded-xl ${s.lightBg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                    <s.icon className={`h-5 w-5 ${s.iconColor}`} />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <TrendingUp className="h-3 w-3" />
                    <span>Active</span>
                  </div>
                </div>
                <p className="text-3xl font-bold font-display tabular-nums tracking-tight animate-count">
                  <AnimatedCounter value={s.value} />
                </p>
                <p className="text-sm text-muted-foreground mt-1 font-medium">{s.label}</p>
              </>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
        {/* Recent Submissions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring.gentle, delay: 0.2 }}
          className="lg:col-span-2 dashboard-panel"
        >
          <div className="dashboard-panel-header flex items-center justify-between">
            <h3 className="font-semibold font-display text-base">Recent Submissions</h3>
            <Link to="/submissions">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
          <div className="divide-y divide-border/30">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-4 px-5"><Skeleton className="h-12 rounded-xl" /></div>
              ))
            ) : submissions.length === 0 ? (
              <div className="p-10 text-center">
                <CheckSquare className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
                <p className="text-sm text-muted-foreground font-medium">No submissions yet</p>
                <p className="text-xs text-muted-foreground mt-1">Submit a form to see data here.</p>
              </div>
            ) : (
              submissions.slice(0, 5).map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/30 transition-colors group"
                >
                  <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                    <CheckSquare className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{sub.form_name || `Form #${sub.form_id}`}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <GitBranch className="h-3 w-3 shrink-0" />
                      {sub.branch_name || `Branch #${sub.branch_id}`}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                    <Clock className="h-3 w-3" />
                    {formatDate(sub.created_at)}
                  </p>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Safety Alerts */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring.gentle, delay: 0.3 }}
          className="dashboard-panel"
        >
          <div className="dashboard-panel-header flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <h3 className="font-semibold font-display text-base">Safety Alerts</h3>
          </div>
          <div className="p-4 space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))
            ) : submissions.filter(isAlertSubmission).length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
                <p className="text-sm text-muted-foreground font-medium">No active alerts</p>
                <p className="text-xs text-muted-foreground mt-1">All inspections are clear.</p>
              </div>
            ) : (
              submissions
                .filter(isAlertSubmission)
                .slice(0, 5)
                .map((sub) => {
                  const d = sub.submission_data || {};
                  const label = d.damage_severity || d.severity || (d.damage === "Yes" ? "Damage reported" : (d.depth >= 4 ? "Safety warning" : "Alert"));
                  return (
                    <motion.div
                      key={sub.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={spring.smooth}
                      className="flex items-start gap-3 p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/15 hover:from-amber-500/15 hover:to-orange-500/10 transition-all duration-300"
                    >
                      <div className="h-8 w-8 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0 mt-0.5">
                        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
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
