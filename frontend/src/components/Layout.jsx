import { useEffect, useState, useRef } from "react";
import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { spring } from "@/lib/motion";
import {
  LayoutDashboard,
  GitBranch,
  FileText,
  CheckSquare,
  Settings,
  BookOpen,
  Shield,
  Search,
  Bell,
  ChevronRight,
  AlertTriangle,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeSwitcher from "@/components/ThemeSwitcher";
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
  { to: "/guide", icon: BookOpen, label: "How to use" },
];

const pathToBreadcrumb = {
  "/": "Dashboard",
  "/branches": "Branch Metadata",
  "/form-templates": "Form Templates",
  "/form-builder": "Form Builder",
  "/form-renderer": "Fill Form",
  "/submissions": "Submissions",
  "/settings": "Settings",
  "/guide": "How to use",
};

export default function Layout() {
  const { theme } = useThemeStore();
  const { query, setQuery } = useSearchStore();
  const location = useLocation();
  const [alertCount, setAlertCount] = useState(0);
  const [bellOpen, setBellOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bellRef = useRef(null);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "evening");
    if (theme === "dark") root.classList.add("dark");
    else if (theme === "evening") root.classList.add("dark", "evening");
  }, [theme]);

  useEffect(() => {
    submissionApi
      .listAll(1, 50)
      .then((res) => {
        const items = res.items || [];
        setAlertCount(items.filter(isAlertSubmission).length);
      })
      .catch(() => setAlertCount(0));
  }, [location.pathname]);

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

  const isDark = theme !== "light";

  return (
    <div className={cn("flex h-screen overflow-hidden", isDark && "dark", theme === "evening" && "evening")}>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.button
            type="button"
            aria-label="Close menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ─── SIDEBAR ─── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[260px] flex-shrink-0 flex flex-col sidebar-shell text-sidebar-foreground border-r border-white/[0.06] lg:relative transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand */}
        <div className="px-5 py-5 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden -ml-1 shrink-0 text-sidebar-foreground hover:bg-white/10 rounded-xl"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <h1 className="font-display font-bold text-sm leading-tight">Dynamic Safety</h1>
            <p className="text-[11px] text-sidebar-muted">Form Engine</p>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 h-px bg-white/[0.06]" />

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] uppercase tracking-widest text-sidebar-muted/60 font-semibold">Menu</p>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-primary/15 text-primary-foreground shadow-sm"
                    : "text-sidebar-muted hover:text-sidebar-foreground hover:bg-white/[0.04]"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg transition-all shrink-0",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                        : "bg-white/[0.04] group-hover:bg-white/[0.08]"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                  </span>
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="h-1.5 w-1.5 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] p-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-primary-foreground shadow-md">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">Admin</p>
              <p className="text-[11px] text-sidebar-muted truncate">admin@safety.io</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── MAIN ─── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background app-surface">
        {/* Top Bar */}
        <header className="h-16 border-b border-border/50 bg-background/70 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 flex-shrink-0 gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden shrink-0"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Breadcrumb */}
            <div className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground">
              <span>Pages</span>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="font-semibold text-foreground font-display">{breadcrumbLabel}</span>
            </div>

            {/* Search */}
            <div className="relative flex-1 max-w-xs ml-auto sm:ml-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                placeholder="Search…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-9 w-full rounded-xl border border-border/60 bg-muted/40 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/40 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Bell */}
            <div className="relative" ref={bellRef}>
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setBellOpen((o) => !o)}
              >
                <Bell className="h-4.5 w-4.5" />
                {alertCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive" />
                  </span>
                )}
              </Button>
              <AnimatePresence>
                {bellOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={spring.snappy}
                    className="absolute right-0 top-full mt-2 w-72 rounded-2xl border bg-popover/95 backdrop-blur-xl text-popover-foreground shadow-2xl z-50 p-4 origin-top-right"
                  >
                    <p className="text-xs font-semibold mb-3 flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                      Safety Alerts
                    </p>
                    {alertCount > 0 ? (
                      <>
                        <p className="text-sm mb-3">
                          You have <span className="font-bold text-primary">{alertCount}</span> active alert{alertCount !== 1 ? "s" : ""}.
                        </p>
                        <div className="flex flex-col gap-1.5">
                          <Link to="/" className="text-sm text-primary hover:underline font-medium" onClick={() => setBellOpen(false)}>
                            View on Dashboard
                          </Link>
                          <Link to="/submissions?alerts=1" className="text-sm text-primary hover:underline font-medium" onClick={() => setBellOpen(false)}>
                            View in Submissions
                          </Link>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">No active alerts</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme */}
            <ThemeSwitcher />

            {/* Avatar */}
            <div className="flex items-center gap-2.5 ml-1 pl-3 border-l border-border/50">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                <span className="text-xs font-bold text-primary-foreground">A</span>
              </div>
              <span className="text-sm font-semibold hidden sm:inline">Admin</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={spring.gentle}
            className="min-h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
