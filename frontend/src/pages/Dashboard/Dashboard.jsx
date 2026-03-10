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
import { formApi, submissionApi, branchApi } from "@/services/api";
import { formatDate } from "@/lib/utils";
import { isAlertSubmission } from "@/lib/alertUtils";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      formApi.list().catch(() => []),
      submissionApi.listAll(1, 20).catch(() => ({ items: [], total: 0 })),
      branchApi.list().catch(() => []),
    ]).then(([forms, subs, branches]) => {
      const items = subs.items || [];
      const alertCount = items.filter(isAlertSubmission).length;
      setStats({
        forms: forms.length,
        submissions: subs.total,
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Safety inspection overview</p>
        </div>
        <Link to="/form-builder">
          <Button>
            <FileText className="h-4 w-4 mr-2" /> New Form Template
          </Button>
        </Link>
      </div>

      {/* Stat Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statCards.map((s) => (
          <motion.div key={s.label} variants={item} className="glass-card p-5">
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
        <div className="lg:col-span-2 glass-card">
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
                <div key={sub.id} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
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
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(sub.created_at)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Safety Alerts */}
        <div className="glass-card">
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
                    <div key={sub.id} className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/5 border border-orange-500/10">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          {label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {sub.branch_name} • {formatDate(sub.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
