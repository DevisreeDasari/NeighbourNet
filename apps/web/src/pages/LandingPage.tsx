import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";

function Orb({ className }: { className: string }) {
  return (
    <div
      className={
        "absolute rounded-full blur-3xl opacity-30 animate-[float_14s_ease-in-out_infinite] " +
        className
      }
    />
  );
}

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <Orb className="h-[420px] w-[420px] bg-[radial-gradient(circle_at_center,rgba(124,106,247,0.8),transparent_60%)] -top-32 -left-40" />
        <Orb className="h-[520px] w-[520px] bg-[radial-gradient(circle_at_center,rgba(247,162,106,0.75),transparent_60%)] top-24 -right-56 [animation-duration:18s]" />
        <Orb className="h-[360px] w-[360px] bg-[radial-gradient(circle_at_center,rgba(124,106,247,0.55),transparent_60%)] bottom-[-120px] left-1/2 -translate-x-1/2 [animation-duration:22s]" />
      </div>

      <div className="noise pointer-events-none absolute inset-0 opacity-35" />

      <section className="relative mx-auto flex min-h-dvh max-w-6xl flex-col justify-center px-5 py-16">
        <div className="absolute right-5 top-6">
          <ThemeToggle />
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="font-heading text-[44px] leading-[1.03] tracking-tight sm:text-[64px] md:text-[72px]"
        >
          <span className="bg-gradient-to-r from-[#7C6AF7] to-[#F7A26A] bg-clip-text text-transparent">
            Your neighbourhood. Your skills. Your economy.
          </span>
        </motion.h1>

        <p className="mt-5 max-w-2xl text-base text-textSecondary sm:text-lg">
          Trade skills with people 2km away. No money. Just time.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/login"
            className="group inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#7C6AF7] to-[#9B6AF7] px-5 py-3 font-semibold shadow-glow transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Join Us Now
          </Link>
          <button
            type="button"
            onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
            className="inline-flex items-center justify-center rounded-xl border border-border bg-white/0 px-5 py-3 font-semibold text-textPrimary transition-colors hover:border-accentPrimary hover:bg-white/5"
          >
            See How It Works
          </button>
          <Link
            to="/register"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-white/0 px-5 py-3 font-semibold text-textPrimary transition-colors hover:border-accentPrimary hover:bg-white/5"
          >
            Create Account
          </Link>
        </div>

        <div className="mt-14 grid gap-3 sm:grid-cols-3">
          {[
            { k: "2,847", v: "Skills Shared" },
            { k: "1,203", v: "Neighbours Connected" },
            { k: "4.9★", v: "Trust Score" }
          ].map((s) => (
            <div
              key={s.v}
              className="rounded-2xl border border-border bg-bgCard p-5 shadow-card transition-colors hover:border-accentPrimary"
            >
              <div className="font-heading text-3xl font-bold">{s.k}</div>
              <div className="mt-1 text-sm text-textSecondary">{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="relative mx-auto max-w-6xl px-5 pb-16">
        <div className="rounded-2xl border border-border bg-bgCard p-6 shadow-card">
          <div className="font-heading text-2xl font-extrabold">How it works</div>
          <div className="mt-2 max-w-2xl text-sm text-textSecondary">
            NeighbourNet helps you exchange skills with people around you using a simple credit system.
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              {
                t: "1) Join & verify",
                d: "Create an account, log in via password or OTP. Set your neighbourhood radius."
              },
              {
                t: "2) Earn NeighbourCoins",
                d: "Offer a skill session. When you help, you earn coins and trust."
              },
              {
                t: "3) Spend coins",
                d: "Book help from someone nearby and pay with coins — no cash needed."
              }
            ].map((x) => (
              <div key={x.t} className="rounded-2xl border border-border bg-bgElevated p-5">
                <div className="font-heading text-lg font-bold">{x.t}</div>
                <div className="mt-2 text-sm text-textSecondary">{x.d}</div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#7C6AF7] to-[#9B6AF7] px-5 py-3 font-semibold shadow-glow"
            >
              Join Us Now
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-white/0 px-5 py-3 font-semibold text-textPrimary transition-colors hover:border-accentPrimary hover:bg-white/5"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
