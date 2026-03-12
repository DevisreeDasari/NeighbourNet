import { Link, NavLink } from "react-router-dom";
import {
  Bell,
  Compass,
  Crown,
  Home,
  MessageSquare,
  Settings,
  Sparkles
} from "lucide-react";
import { useAuthStore } from "../store/auth";
import CoinBadge from "../components/CoinBadge";
import { resolveMediaUrl } from "../lib/media";

const nav = [
  { to: "/dashboard", label: "Feed", icon: Home },
  { to: "/dashboard", label: "Explore Skills", icon: Compass },
  { to: "/dashboard", label: "My Skills", icon: Sparkles },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/leaderboard", label: "Leaderboard", icon: Crown },
  { to: "/settings", label: "Settings", icon: Settings }
] as const;

export default function Sidebar() {
  const { user } = useAuthStore();
  const balance = (user as any)?.coinBalance ?? 0;
  const avatarUrl = resolveMediaUrl(user?.avatar ?? null);

  return (
    <div className="sticky top-[72px] rounded-2xl border border-border bg-bgCard p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-r from-[#7C6AF7] to-[#F7A26A]" />
          <div>
            <div className="font-heading text-lg font-extrabold leading-none">NeighbourNet</div>
            <div className="mt-1 text-[11px] text-textSecondary">Hyperlocal skills exchange</div>
          </div>
        </Link>
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-bgElevated p-4">
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile"
              className="h-10 w-10 rounded-full border border-border object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-full border border-border bg-bgCard" />
          )}
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{user?.name ?? "Neighbour"}</div>
            <div className="truncate text-xs text-textSecondary">{user?.email ?? ""}</div>
          </div>
        </div>

        <div className="mt-4">
          <CoinBadge balance={balance} />
        </div>
      </div>

      <nav className="mt-5 space-y-1">
        {nav.map((n) => {
          const Icon = n.icon;
          return (
            <NavLink
              key={n.label}
              to={n.to}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold",
                  isActive
                    ? "bg-white/5 text-textPrimary"
                    : "text-textSecondary hover:bg-white/5 hover:text-textPrimary"
                ].join(" ")
              }
            >
              <Icon className="h-4 w-4" />
              {n.label}
            </NavLink>
          );
        })}
      </nav>

      <button
        type="button"
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-white/0 px-4 py-3 text-sm font-semibold text-textPrimary transition-colors hover:border-accentPrimary hover:bg-white/5"
      >
        <Bell className="h-4 w-4" />
        Invite Neighbour
      </button>
    </div>
  );
}
