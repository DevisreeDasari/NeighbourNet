import { Link, Outlet, useLocation } from "react-router-dom";
import Sidebar from "../navigation/Sidebar";
import RightPanel from "../navigation/RightPanel";
import MobileBottomNav from "../navigation/MobileBottomNav";
import ThemeToggle from "../components/ThemeToggle";

export default function AppLayout() {
  const location = useLocation();
  const title = (() => {
    const p = location.pathname;
    if (p.startsWith("/dashboard")) return "Feed";
    if (p.startsWith("/messages")) return "Messages";
    if (p.startsWith("/settings")) return "Settings";
    if (p.startsWith("/leaderboard")) return "Leaderboard";
    return "";
  })();

  return (
    <div className="min-h-dvh bg-bgPrimary text-textPrimary">
      <div className="noise pointer-events-none fixed inset-0 opacity-35" />

      <header className="sticky top-0 z-40 border-b border-border bg-bgPrimary/80 backdrop-blur-md">
        <div className="relative mx-auto flex max-w-[1240px] items-center justify-between px-4 py-3">
          <Link to="/dashboard" className="flex min-w-0 items-center gap-2">
            <div className="h-8 w-8 shrink-0 rounded-xl bg-gradient-to-r from-[#7C6AF7] to-[#F7A26A]" />
            <div className="min-w-0">
              <div className="truncate font-heading text-base font-extrabold leading-none">NeighbourNet</div>
              <div className="mt-1 truncate text-[11px] text-textSecondary">Hyperlocal skills exchange</div>
            </div>
          </Link>

          {title ? (
            <div className="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 md:block">
              <div className="font-heading text-lg font-extrabold">{title}</div>
            </div>
          ) : null}

          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto grid min-h-dvh max-w-[1240px] grid-cols-1 gap-6 px-4 py-6 pb-24 md:grid-cols-[240px_1fr_320px] md:pb-6">
        <aside className="hidden md:block min-w-0">
          <Sidebar />
        </aside>

        <main className="min-w-0 md:pl-1">
          <Outlet />
        </main>

        <aside className="hidden md:block">
          <RightPanel />
        </aside>
      </div>

      <div className="md:hidden">
        <MobileBottomNav />
      </div>
    </div>
  );
}
