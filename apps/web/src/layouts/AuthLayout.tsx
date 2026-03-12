import { Link, Outlet } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import NeighbourhoodGraph from "../components/NeighbourhoodGraph";

export default function AuthLayout() {
  return (
    <div className="min-h-dvh bg-bgPrimary text-textPrimary">
      <div className="noise pointer-events-none fixed inset-0 opacity-35" />
      <div className="mx-auto min-h-dvh max-w-6xl px-5 py-10">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="text-sm font-semibold text-textPrimary hover:underline">
            Back to home
          </Link>
          <ThemeToggle />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-center">
        <div className="relative hidden overflow-hidden rounded-2xl border border-border bg-bgCard p-8 shadow-card md:block">
          <div className="absolute inset-0 opacity-70">
            <div className="absolute -left-20 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,rgba(124,106,247,0.8),transparent_60%)] blur-3xl" />
            <div className="absolute -right-32 top-24 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(247,162,106,0.75),transparent_60%)] blur-3xl" />
          </div>
          <div className="relative">
            <div className="font-heading text-3xl font-extrabold tracking-tight">
              NeighbourNet
            </div>
            <div className="mt-3 max-w-sm text-sm text-textSecondary">
              A hyperlocal skills exchange. Trade time, earn NeighbourCoins, and build trust in your colony.
            </div>
            <div className="mt-8 rounded-2xl border border-border bg-white/5 p-6">
              <div className="text-sm font-semibold">Neighbourhood graph</div>
              <div className="mt-3">
                <NeighbourhoodGraph />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-bgCard p-6 shadow-card md:p-8">
          <Outlet />
        </div>
        </div>
      </div>
    </div>
  );
}
