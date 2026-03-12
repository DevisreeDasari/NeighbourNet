import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
  fullWidth?: boolean;
};

export default function Button({
  variant = "primary",
  fullWidth,
  className,
  ...props
}: Props) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-5 py-3 font-semibold transition-transform focus-visible:outline-none hover:scale-[1.02] active:scale-[0.98]";

  const v =
    variant === "primary"
      ? "bg-gradient-to-r from-[#7C6AF7] to-[#9B6AF7] shadow-glow"
      : "border border-border bg-white/0 text-textPrimary transition-colors hover:border-accentPrimary hover:bg-white/5";

  return (
    <button
      className={[base, v, fullWidth ? "w-full" : "", className ?? ""].join(" ")}
      {...props}
    />
  );
}
