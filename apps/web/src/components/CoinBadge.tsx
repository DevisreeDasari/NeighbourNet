import { motion } from "framer-motion";
import { Coins } from "lucide-react";

export default function CoinBadge({ balance }: { balance: number }) {
  return (
    <div className="flex items-center gap-2 rounded-2xl border border-border bg-bgElevated px-4 py-3 shadow-card">
      <motion.div
        animate={{ rotate: [0, 8, -8, 0] }}
        transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity, repeatDelay: 3 }}
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5"
        aria-hidden
      >
        <Coins className="h-5 w-5 text-accentSecondary" />
      </motion.div>
      <div>
        <div className="font-heading text-lg font-bold leading-none">{balance}</div>
        <div className="mt-1 text-[11px] text-textSecondary">NeighbourCoins</div>
      </div>
    </div>
  );
}
