import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, MapPin, GitBranch, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { branchApi } from "@/services/api";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";

export default function BranchMetadataPage() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchBranches = () => {
    setLoading(true);
    branchApi
      .list()
      .then(setBranches)
      .catch(() => toast.error("Failed to load branches"))
      .finally(() => setLoading(false));
  };

  useEffect(fetchBranches, []);

  const handleCreate = async () => {
    if (!name.trim() || !location.trim()) {
      toast.error("Name and location are required");
      return;
    }
    setCreating(true);
    try {
      await branchApi.create({ name: name.trim(), location: location.trim() });
      toast.success("Branch created");
      setName("");
      setLocation("");
      fetchBranches();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await branchApi.delete(id);
      toast.success("Branch deleted");
      fetchBranches();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold">Branch Metadata</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage job sites and branches
        </p>
      </div>

      {/* Add Branch */}
      <div className="glass-card p-5">
        <h3 className="font-semibold text-sm mb-4">Add New Branch</h3>
        <div className="flex gap-3 items-end">
          <div className="flex-1 space-y-1.5">
            <Label className="text-xs">Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Downtown Site"
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <Label className="text-xs">Location</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. New York"
            />
          </div>
          <Button onClick={handleCreate} disabled={creating} className="shrink-0">
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
            Add Branch
          </Button>
        </div>
      </div>

      {/* Branch List */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border/50">
          <h3 className="font-semibold text-sm">All Branches ({branches.length})</h3>
        </div>
        <div className="divide-y divide-border/50">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-4"><Skeleton className="h-12" /></div>
            ))
          ) : branches.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">No branches yet</div>
          ) : (
            <AnimatePresence>
              {branches.map((branch) => (
                <motion.div
                  key={branch.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <GitBranch className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{branch.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {branch.location}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">{formatDate(branch.created_at)}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleDelete(branch.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
