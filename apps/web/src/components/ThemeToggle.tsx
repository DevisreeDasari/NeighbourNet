import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "dark" | "light";

function getInitialTheme(): Theme {
  const stored = localStorage.getItem("nn_theme");
  if (stored === "dark" || stored === "light") return stored;
  return "dark";
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("nn_theme", theme);
}

export default function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const Icon = theme === "dark" ? Sun : Moon;
  const label = theme === "dark" ? "Switch to light" : "Switch to dark";

  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      className={[
        "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-bgCard text-textPrimary shadow-card hover:border-accentPrimary",
        className ?? ""
      ].join(" ")}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
