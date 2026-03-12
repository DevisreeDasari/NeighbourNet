const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export default function WeeklyCalendar({
  selected,
  onToggle
}: {
  selected: Set<string>;
  onToggle: (day: string) => void;
}) {
  return (
    <div>
      <div className="text-sm font-semibold">Availability</div>
      <div className="mt-3 grid grid-cols-7 gap-2">
        {days.map((d) => {
          const active = selected.has(d);
          return (
            <button
              key={d}
              type="button"
              onClick={() => onToggle(d)}
              className={[
                "rounded-xl border px-2 py-2 text-xs font-semibold",
                active
                  ? "border-accentPrimary bg-white/5 text-textPrimary"
                  : "border-border bg-bgCard text-textSecondary hover:border-accentPrimary"
              ].join(" ")}
            >
              {d}
            </button>
          );
        })}
      </div>
      <div className="mt-2 text-xs text-textMuted">
        (Time-range selection UI comes next — this stores selected days for now.)
      </div>
    </div>
  );
}
