import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useThemeStore } from "@/store/themeStore";

export default function SettingsPage() {
  const { dark, toggle } = useThemeStore();

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 max-w-2xl pb-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Application preferences</p>
      </div>

      <div className="glass-card p-5 space-y-6">
        <h3 className="font-semibold">Appearance</h3>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {dark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            <div>
              <Label>Dark Mode</Label>
              <p className="text-xs text-muted-foreground">
                Toggle between light and dark themes
              </p>
            </div>
          </div>
          <Switch checked={dark} onCheckedChange={toggle} />
        </div>
      </div>

      <div className="glass-card p-5 space-y-4">
        <h3 className="font-semibold">About</h3>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Dynamic Safety Form Engine v1.0.0</p>
          <p>Built with React, FastAPI, PostgreSQL</p>
          <p>Designed for safety inspection workflows</p>
        </div>
      </div>
    </div>
  );
}
