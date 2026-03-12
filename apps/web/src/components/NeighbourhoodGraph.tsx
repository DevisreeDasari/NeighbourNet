import { motion } from "framer-motion";

const nodes = [
  { id: "a", x: 18, y: 20, r: 5 },
  { id: "b", x: 58, y: 14, r: 4 },
  { id: "c", x: 86, y: 30, r: 4 },
  { id: "d", x: 26, y: 60, r: 4 },
  { id: "e", x: 58, y: 66, r: 5 },
  { id: "f", x: 88, y: 64, r: 4 }
] as const;

const edges = [
  ["a", "b"],
  ["b", "c"],
  ["a", "d"],
  ["d", "e"],
  ["e", "f"],
  ["b", "e"],
  ["c", "f"]
] as const;

function pos(id: (typeof nodes)[number]["id"]) {
  return nodes.find((n) => n.id === id)!;
}

export default function NeighbourhoodGraph() {
  return (
    <div className="h-40 rounded-xl border border-border bg-bgElevated">
      <svg viewBox="0 0 100 80" className="h-full w-full">
        <defs>
          <linearGradient id="nn_grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7C6AF7" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#F7A26A" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {edges.map(([s, t]) => {
          const a = pos(s);
          const b = pos(t);
          return (
            <motion.line
              key={`${s}-${t}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="url(#nn_grad)"
              strokeWidth="1.5"
              initial={{ opacity: 0.25 }}
              animate={{ opacity: [0.25, 0.75, 0.25] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            />
          );
        })}

        {nodes.map((n, i) => (
          <motion.g
            key={n.id}
            initial={{ opacity: 0.8 }}
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut", delay: i * 0.12 }}
          >
            <circle cx={n.x} cy={n.y} r={n.r + 2.5} fill="#7C6AF7" opacity={0.12} />
            <circle cx={n.x} cy={n.y} r={n.r} fill="url(#nn_grad)" opacity={0.95} />
          </motion.g>
        ))}
      </svg>
    </div>
  );
}
