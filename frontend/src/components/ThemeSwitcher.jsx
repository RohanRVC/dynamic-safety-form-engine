import { Sun, Moon, Sunset } from "lucide-react";
import { motion } from "framer-motion";
import { useThemeStore, THEME_LIST } from "@/store/themeStore";
import { cn } from "@/lib/utils";

const icons = { light: Sun, dark: Moon, evening: Sunset };
const labels = { light: "Light", dark: "Dark", evening: "Evening" };

export default function ThemeSwitcher() {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="flex items-center gap-0.5 rounded-xl bg-muted/60 p-1 ring-1 ring-border/40">
      {THEME_LIST.map((t) => {
        const Icon = icons[t];
        const active = theme === t;
        return (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className={cn(
              "relative flex items-center justify-center h-8 w-8 rounded-lg transition-all duration-300",
              active ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={labels[t]}
            title={labels[t]}
          >
            {active && (
              <motion.div
                layoutId="theme-pill"
                className="absolute inset-0 rounded-lg bg-background shadow-sm ring-1 ring-border/50"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <Icon className="h-4 w-4 relative z-10" />
          </button>
        );
      })}
    </div>
  );
}
