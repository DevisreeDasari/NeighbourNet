import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string | null;
};

export default function Input({ label, error, className, ...props }: Props) {
  return (
    <label className="block">
      <div className="mb-2 text-sm font-medium text-textSecondary">{label}</div>
      <input
        className={
          [
            "w-full rounded-xl border border-border bg-bgElevated px-4 py-3 text-textPrimary placeholder:text-textMuted",
            "focus:border-accentPrimary focus:ring-2 focus:ring-[rgba(124,106,247,0.22)]",
            error ? "border-danger" : "",
            className ?? ""
          ].join(" ")
        }
        {...props}
      />
      {error ? <div className="mt-2 text-xs text-danger">{error}</div> : null}
    </label>
  );
}
