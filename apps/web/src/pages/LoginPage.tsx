import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useAuthStore } from "../store/auth";

export default function LoginPage() {
  const nav = useNavigate();
  const { login, sendOtp, loading, error } = useAuthStore();

  const [mode, setMode] = useState<"password" | "otp">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const canSubmit = useMemo(() => {
    if (!email) return false;
    if (mode === "password") return !!password;
    return true;
  }, [email, mode, password]);

  return (
    <div>
      <div className="font-heading text-2xl font-extrabold">Welcome back</div>
      <div className="mt-2 text-sm text-textSecondary">
        Log in to trade skills and NeighbourCoins.
      </div>

      <div className="mt-6 flex gap-2 rounded-xl border border-border bg-bgElevated p-1">
        <button
          className={[
            "flex-1 rounded-lg px-3 py-2 text-sm font-semibold",
            mode === "password" ? "bg-bgCard" : "text-textSecondary"
          ].join(" ")}
          onClick={() => setMode("password")}
          type="button"
        >
          Password
        </button>
        <button
          className={[
            "flex-1 rounded-lg px-3 py-2 text-sm font-semibold",
            mode === "otp" ? "bg-bgCard" : "text-textSecondary"
          ].join(" ")}
          onClick={() => setMode("otp")}
          type="button"
        >
          OTP
        </button>
      </div>

      <form
        className="mt-6 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!canSubmit) return;

          if (mode === "password") {
            await login({ email, password });
            nav("/dashboard");
            return;
          }

          await sendOtp({ email });
          nav(`/otp?email=${encodeURIComponent(email)}`);
        }}
      >
        <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

        {mode === "password" ? (
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        ) : null}

        {error ? <div className="text-sm text-danger">{error}</div> : null}

        <Button type="submit" fullWidth disabled={!canSubmit || loading}>
          {mode === "password" ? "Login" : "Send OTP"}
        </Button>

        <div className="text-center text-sm text-textSecondary">
          New here?{" "}
          <Link className="font-semibold text-textPrimary hover:underline" to="/register">
            Create an account
          </Link>
        </div>
      </form>
    </div>
  );
}
