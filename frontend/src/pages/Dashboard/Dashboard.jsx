import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FileText,
  GitBranch,
  CheckSquare,
  AlertTriangle,
  TrendingUp,
  Video,
  ArrowRight,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    { label: "Form Templates", value: stats?.forms ?? 0, icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Total Submissions", value: stats?.submissions ?? 0, icon: CheckSquare, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Active Branches", value: stats?.branches ?? 0, icon: GitBranch, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Safety Alerts", value: stats?.alerts ?? 0, icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 pb-8">
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
          <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Safety inspection overview</p>
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
            className="glass-card p-5 hover:shadow-xl hover:shadow-primary/5 cursor-default"
          >
            {loading ? (
              <Skeleton className="h-20" />
            ) : (
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-3xl font-bold mt-1">{s.value}</p>
                </div>
                <div className={`h-10 w-10 rounded-xl ${s.bg} flex items-center justify-center`}>
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
          className="lg:col-span-2 glass-card overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <h3 className="font-semibold">Recent Submissions</h3>
            <Link to="/submissions">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="divide-y divide-border/50">
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
                  className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 p-4 hover:bg-muted/50 transition-all duration-300 rounded-lg mx-1 hover:translate-x-0.5"
                >
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
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
                      className="flex items-start gap-3 p-3 rounded-xl bg-orange-500/5 border border-orange-500/10 hover:bg-orange-500/10 transition-colors duration-300"
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
