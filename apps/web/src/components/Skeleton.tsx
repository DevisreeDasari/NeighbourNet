export default function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={[
        "animate-pulse rounded-2xl border border-border bg-bgCard shadow-card",
        className ?? ""
      ].join(" ")}
    />
  );
}
