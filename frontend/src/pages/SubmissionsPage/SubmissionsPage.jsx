import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useSearchParams, Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  GitBranch,
  Clock,
  FileText,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { submissionApi, API_BASE } from "@/services/api";
import { formatDate } from "@/lib/utils";
import { spring } from "@/lib/motion";
import { useSearchStore } from "@/store/searchStore";
import { isAlertSubmission } from "@/lib/alertUtils";

export default function SubmissionsPage() {
  const [searchParams] = useSearchParams();
  const alertsOnly = searchParams.get("alerts") === "1";
  const [subs, setSubs] = useState({ items: [], total: 0, page: 1, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedSub, setSelectedSub] = useState(null);
  const [listError, setListError] = useState(null);
  const { query } = useSearchStore();

  useEffect(() => {
    setLoading(true);
    setListError(null);
    submissionApi
      .listAll(page, 15)
      .then(setSubs)
      .catch((err) => {
        setListError(err?.message || "Failed to load submissions");
        setSubs({ items: [], total: 0, page: 1, pages: 0 });
      })
      .finally(() => setLoading(false));
  }, [page]);

  const filteredItems = useMemo(() => {
    let list = subs.items || [];
    if (alertsOnly) list = list.filter(isAlertSubmission);
    const q = (query || "").trim().toLowerCase();
    if (q) {
      list = list.filter(
        (s) =>
          (s.form_name || "").toLowerCase().includes(q) ||
          (s.branch_name || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [subs.items, alertsOnly, query]);

  return (
    <motion.div
      className="p-4 sm:p-6 space-y-4 sm:space-y-6 pb-8"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring.gentle}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">Submissions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {alertsOnly
              ? `Showing ${filteredItems.length} safety alert${filteredItems.length !== 1 ? "s" : ""}`
              : query.trim()
                ? `${filteredItems.length} of ${subs.total} submissions`
                : `${subs.total} total submissions`}
          </p>
        </div>
        {alertsOnly && (
          <Link to="/submissions" className="text-sm text-primary hover:underline">
            Show all submissions
          </Link>
        )}
      </div>

      {listError && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">
          <p className="font-semibold text-destructive flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {listError}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            API: <code className="rounded bg-muted px-1">{API_BASE}</code>
          </p>
        </div>
      )}

      <motion.div
        className="glass-card overflow-hidden"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring.gentle, delay: 0.06 }}
      >
        {/* Table: horizontal scroll on small screens */}
        <div className="overflow-x-auto -mx-px">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 sm:gap-4 p-3 sm:p-4 border-b bg-muted/30 text-[10px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide min-w-[640px]">
          <div className="col-span-1">#</div>
          <div className="col-span-3">Form</div>
          <div className="col-span-2">Branch</div>
          <div className="col-span-3">Data Summary</div>
          <div className="col-span-2">Submitted</div>
          <div className="col-span-1">Action</div>
        </div>

        {/* Rows */}
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="p-4">
              <Skeleton className="h-10" />
            </div>
          ))
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            {alertsOnly ? "No safety alerts in this page." : subs.items.length === 0 ? "No submissions found" : "No matching submissions"}
          </div>
        ) : (
          filteredItems.map((sub) => (
            <div
              key={sub.id}
              className="grid grid-cols-12 gap-2 sm:gap-4 p-3 sm:p-4 border-b hover:bg-muted/40 transition-all duration-300 items-center min-w-[640px] hover:shadow-sm"
            >
              <div className="col-span-1 text-sm text-muted-foreground">
                {sub.id}
              </div>
              <div className="col-span-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm font-medium truncate">
                  {sub.form_name || `Form #${sub.form_id}`}
                </span>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <GitBranch className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="text-sm truncate">
                  {sub.branch_name || `Branch #${sub.branch_id}`}
                </span>
              </div>
              <div className="col-span-3">
                <div className="flex flex-wrap gap-1">
                  {Object.entries(sub.submission_data || {})
                    .slice(0, 2)
                    .map(([key, val]) => (
                      <Badge key={key} variant="secondary" className="text-[10px]">
                        {key}: {String(val).slice(0, 15)}
                      </Badge>
                    ))}
                  {Object.keys(sub.submission_data || {}).length > 2 && (
                    <Badge variant="outline" className="text-[10px]">
                      +{Object.keys(sub.submission_data).length - 2} more
                    </Badge>
                  )}
                </div>
              </div>
              <div className="col-span-2 text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDate(sub.created_at)}
              </div>
              <div className="col-span-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setSelectedSub(sub)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
        </div>

        {/* Pagination */}
        {subs.pages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-2 p-4 border-t">
            <p className="text-sm text-muted-foreground">
              Page {subs.page} of {subs.pages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= subs.pages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedSub} onOpenChange={() => setSelectedSub(null)}>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-lg sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Submission #{selectedSub?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Form:</span>{" "}
                <span className="font-medium">{selectedSub?.form_name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Branch:</span>{" "}
                <span className="font-medium">{selectedSub?.branch_name}</span>
              </div>
            </div>
            <div className="border rounded-lg divide-y">
              {selectedSub &&
                Object.entries(selectedSub.submission_data || {}).map(
                  ([key, val]) => (
                    <div key={key} className="flex justify-between p-3 text-sm">
                      <span className="text-muted-foreground capitalize">
                        {key.replace(/_/g, " ")}
                      </span>
                      <span className="font-medium">{String(val)}</span>
                    </div>
                  )
                )}
            </div>
            <p className="text-xs text-muted-foreground">
              Submitted {selectedSub && formatDate(selectedSub.created_at)}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
