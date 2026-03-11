import { useEffect, useState, useRef } from "react";
import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  GitBranch,
  FileText,
  CheckSquare,
  Settings,
  Shield,
  Moon,
  Sun,
  Search,
  Bell,
  ChevronRight,
  AlertTriangle,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/store/themeStore";
import { useSearchStore } from "@/store/searchStore";
import { submissionApi } from "@/services/api";
import { isAlertSubmission } from "@/lib/alertUtils";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/branches", icon: GitBranch, label: "Branch Metadata" },
  { to: "/form-templates", icon: FileText, label: "Form Templates" },
  { to: "/submissions", icon: CheckSquare, label: "Submissions" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

const pathToBreadcrumb = {
  "/": "Dashboard",
  "/branches": "Branch Metadata",
  "/form-templates": "Form Templates",
  "/form-builder": "Form Builder",
  "/form-renderer": "Fill Form",
  "/submissions": "Submissions",
  "/settings": "Settings",
};

export default function Layout() {
  const { dark, toggle } = useThemeStore();
  const { query, setQuery } = useSearchStore();
  const location = useLocation();
  const [alertCount, setAlertCount] = useState(0);
  const [bellOpen, setBellOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bellRef = useRef(null);

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Apply dark class to <html> so entire app (body, main, cards) gets dark theme
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  // Fetch recent submissions to count safety alerts for notification bell
  useEffect(() => {
    submissionApi
      .listAll(1, 50)
      .then((res) => {
        const items = res.items || [];
        setAlertCount(items.filter(isAlertSubmission).length);
      })
      .catch(() => setAlertCount(0));
  }, [location.pathname]);

  // Close bell dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (bellRef.current && !bellRef.current.contains(e.target)) setBellOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const pathname = location.pathname || "/";
  const breadcrumbLabel =
    pathToBreadcrumb[pathname] ??
    (pathname.replace(/^\//, "").replace(/-/g, " ") || "Dashboard");

  return (
    <div className={cn("flex h-screen overflow-hidden", dark && "dark")}>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Sidebar: drawer on mobile, fixed column on lg+ */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 flex-shrink-0 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-200 ease-out lg:relative lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-5 flex items-center gap-3 border-b border-white/10">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden -ml-1 shrink-0 text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="h-9 w-9 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
            <Shield className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight">Dynamic Safety</h1>
            <p className="text-xs text-sidebar-muted">Form Engine</p>
            <p className="text-[10px] text-sidebar-muted/80 mt-0.5">Safety inspections</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all group",
                  isActive
                    ? "bg-sidebar-accent text-white font-medium"
                    : "text-sidebar-muted hover:text-white hover:bg-sidebar-accent/50"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1">{item.label}</span>
              <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/30 flex items-center justify-center text-xs font-bold">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Admin</p>
              <p className="text-xs text-sidebar-muted truncate">admin@safety.io</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        {/* Top Bar */}
        <header className="min-h-14 border-b bg-background/80 backdrop-blur-lg flex flex-wrap items-center justify-between gap-2 px-3 py-2 sm:px-6 sm:py-0 sm:h-14 sm:flex-nowrap flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0 w-full sm:w-auto">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden shrink-0"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="relative flex-1 min-w-0 max-w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-9 w-full rounded-lg border bg-muted/50 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative" ref={bellRef}>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setBellOpen((o) => !o)}
              >
                <Bell className="h-4 w-4" />
                {alertCount > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
                )}
              </Button>
              {bellOpen && (
                <div className="absolute right-0 top-full mt-1 w-64 rounded-lg border bg-popover text-popover-foreground shadow-lg z-50 p-3">
                  <p className="text-xs font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    Safety alerts
                  </p>
                  {alertCount > 0 ? (
                    <>
                      <p className="text-sm text-muted-foreground mb-3">
                        You have {alertCount} safety alert{alertCount !== 1 ? "s" : ""}.
                      </p>
                      <div className="flex flex-col gap-1">
                        <Link
                          to="/"
                          className="text-sm text-primary hover:underline"
                          onClick={() => setBellOpen(false)}
                        >
                          View on Dashboard
                        </Link>
                        <Link
                          to="/submissions?alerts=1"
                          className="text-sm text-primary hover:underline"
                          onClick={() => setBellOpen(false)}
                        >
                          View in Submissions
                        </Link>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No active alerts</p>
                  )}
                </div>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={toggle}>
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <div className="flex items-center gap-2 ml-2 pl-2 border-l">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">A</span>
              </div>
              <span className="text-sm font-medium hidden sm:inline">Admin</span>
            </div>
          </div>
        </header>

        {/* Breadcrumb bar (thin line under header on larger screens) */}
        <div className="hidden md:block px-6 py-1.5 border-b bg-muted/20 text-xs text-muted-foreground">
          <span className="capitalize">{breadcrumbLabel}</span>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-background">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full min-h-full bg-background"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
