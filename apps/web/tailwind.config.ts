import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"] ,
  theme: {
    extend: {
      fontFamily: {
        heading: ["Syne", "ui-sans-serif", "system-ui"],
        body: ["DM Sans", "ui-sans-serif", "system-ui"]
      },
      colors: {
        bgPrimary: "var(--bg-primary)",
        bgCard: "var(--bg-card)",
        bgElevated: "var(--bg-elevated)",
        accentPrimary: "var(--accent-primary)",
        accentSecondary: "var(--accent-secondary)",
        accentGlow: "var(--accent-glow)",
        textPrimary: "var(--text-primary)",
        textSecondary: "var(--text-secondary)",
        textMuted: "var(--text-muted)",
        border: "var(--border)",
        success: "var(--success)",
        danger: "var(--danger)"
      },
      boxShadow: {
        card: "0 0 0 1px rgba(124,106,247,0.08)",
        glow: "0 0 32px rgba(124,106,247,0.25)"
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem"
      }
    }
  },
  plugins: []
} satisfies Config;
