import { motion } from "framer-motion";
import { Moon, Sun, Sunset, Monitor } from "lucide-react";
import { spring } from "@/lib/motion";
import { Label } from "@/components/ui/label";
import { useThemeStore, THEME_LIST } from "@/store/themeStore";
import { cn } from "@/lib/utils";

const themeOptions = [
  { key: "light", label: "Light", desc: "Clean and bright", icon: Sun, preview: "bg-gradient-to-br from-slate-50 to-blue-50" },
  { key: "dark", label: "Dark", desc: "Easy on the eyes", icon: Moon, preview: "bg-gradient-to-br from-slate-900 to-indigo-950" },
  { key: "evening", label: "Evening", desc: "Warm and cozy", icon: Sunset, preview: "bg-gradient-to-br from-[#1A1A2E] to-[#16213E]" },
];

export default function SettingsPage() {
  const { theme, setTheme } = useThemeStore();

  return (
    <motion.div
      className="page-shell p-4 sm:p-6 lg:p-8 space-y-6 max-w-3xl pb-10"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring.gentle}
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Personalize your experience</p>
      </div>

      {/* Appearance */}
      <motion.div
        className="surface-panel p-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring.gentle, delay: 0.05 }}
      >
        <h3 className="font-semibold font-display text-lg mb-1">Appearance</h3>
        <p className="text-sm text-muted-foreground mb-5">Choose your preferred theme</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {themeOptions.map((opt) => {
            const active = theme === opt.key;
            return (
              <button
                key={opt.key}
                onClick={() => setTheme(opt.key)}
                className={cn(
                  "relative flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 group text-left",
                  active
                    ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                    : "border-border/50 hover:border-primary/30 hover:bg-muted/30"
                )}
              >
                <div className={cn("w-full h-20 rounded-xl shadow-inner", opt.preview)} />
                <div className="flex items-center gap-2 w-full">
                  <opt.icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
                  <div>
                    <p className={cn("text-sm font-semibold", active && "text-primary")}>{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.desc}</p>
                  </div>
                </div>
                {active && (
                  <motion.div
                    layoutId="theme-check"
                    className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center"
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  >
                    <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* About */}
      <motion.div
        className="surface-panel p-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring.gentle, delay: 0.1 }}
      >
        <h3 className="font-semibold font-display text-lg mb-1">About</h3>
        <div className="space-y-2 text-sm text-muted-foreground mt-3">
          <p>Dynamic Safety Form Engine <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded-md ml-1">v1.0.0</span></p>
          <p>Built with React, FastAPI, PostgreSQL</p>
          <p>Designed for safety inspection workflows</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
