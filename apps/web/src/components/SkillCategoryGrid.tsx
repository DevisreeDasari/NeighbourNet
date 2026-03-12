const categories = [
  { label: "Tech & Coding", emoji: "💻" },
  { label: "Teaching & Tutoring", emoji: "📚" },
  { label: "Cooking & Baking", emoji: "🍳" },
  { label: "Home Repair", emoji: "🛠️" },
  { label: "Health & Wellness", emoji: "🧘" },
  { label: "Music & Arts", emoji: "🎨" },
  { label: "Legal & Finance", emoji: "⚖️" },
  { label: "Language Learning", emoji: "🗣️" },
  { label: "Childcare", emoji: "🧸" },
  { label: "Pet Care", emoji: "🐾" },
  { label: "Gardening", emoji: "🌿" },
  { label: "Photography", emoji: "📸" },
  { label: "Fashion & Tailoring", emoji: "🧵" },
  { label: "Transportation", emoji: "🚗" },
  { label: "Elderly Care", emoji: "🤝" },
  { label: "Other", emoji: "✨" }
] as const;

export type Category = (typeof categories)[number]["label"];

export default function SkillCategoryGrid({
  selected,
  onToggle,
  title
}: {
  selected: Set<string>;
  onToggle: (cat: string) => void;
  title: string;
}) {
  return (
    <div>
      <div className="font-heading text-lg font-bold">{title}</div>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((c) => {
          const active = selected.has(c.label);
          return (
            <button
              key={c.label}
              type="button"
              onClick={() => onToggle(c.label)}
              className={[
                "rounded-2xl border p-4 text-left shadow-card transition-all",
                active
                  ? "border-accentPrimary bg-white/5"
                  : "border-border bg-bgCard hover:-translate-y-0.5 hover:border-accentPrimary"
              ].join(" ")}
            >
              <div className="text-2xl">{c.emoji}</div>
              <div className="mt-2 text-sm font-semibold">{c.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
