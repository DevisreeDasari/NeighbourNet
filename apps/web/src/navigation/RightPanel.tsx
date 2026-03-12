import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { apiFetch } from "../lib/api";
import { useAuthStore } from "../store/auth";
import Button from "../components/ui/Button";

export default function RightPanel() {
  const { accessToken } = useAuthStore();
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    if (!accessToken) return;
    (async () => {
      const res = await apiFetch<{ balance: number }>("/api/wallet/balance", { accessToken });
      setBalance(res.balance);
    })();
  }, [accessToken]);

  return (
    <div className="sticky top-6 space-y-4">
      <div className="rounded-2xl border border-border bg-bgCard p-4 shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Your Stats</div>
            <div className="mt-1 text-xs text-textSecondary">Live wallet snapshot</div>
          </div>
          <TrendingUp className="h-4 w-4 text-textMuted" />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-border bg-bgElevated p-3">
            <div className="font-heading text-xl font-bold">{balance}</div>
            <div className="mt-1 text-xs text-textSecondary">Coins</div>
          </div>
          <div className="rounded-2xl border border-border bg-bgElevated p-3">
            <div className="font-heading text-xl font-bold">—</div>
            <div className="mt-1 text-xs text-textSecondary">This month</div>
          </div>
        </div>

        <div className="mt-4">
          <Button fullWidth>Quick Request</Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-bgCard p-4 shadow-card">
        <div className="text-sm font-semibold">Neighbours Online Now</div>
        <div className="mt-3 flex -space-x-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="relative h-9 w-9 rounded-full border border-border bg-bgElevated"
            >
              <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-bgCard bg-success" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-bgCard p-4 shadow-card">
        <div className="text-sm font-semibold">Upcoming Sessions</div>
        <div className="mt-3 space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-bgElevated p-3">
              <div className="text-sm font-semibold">No sessions yet</div>
              <div className="mt-1 text-xs text-textSecondary">Book a skill to get started.</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
