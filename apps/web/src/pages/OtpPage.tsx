import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Button from "../components/ui/Button";
import { useAuthStore } from "../store/auth";

export default function OtpPage() {
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const email = sp.get("email") ?? "";

  const { verifyOtp, loading, error } = useAuthStore();
  const [code, setCode] = useState("");

  const canSubmit = useMemo(() => code.length === 6 && !!email, [code, email]);

  return (
    <div>
      <div className="font-heading text-2xl font-extrabold">Enter OTP</div>
      <div className="mt-2 text-sm text-textSecondary">
        We sent a 6-digit code to <span className="text-textPrimary">{email}</span>.
      </div>

      <form
        className="mt-6"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!canSubmit) return;
          await verifyOtp({ email, code });
          nav("/onboarding");
        }}
      >
        <input
          inputMode="numeric"
          autoComplete="one-time-code"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          className="w-full rounded-2xl border border-border bg-bgElevated px-5 py-5 text-center font-heading text-3xl tracking-[0.6em] focus:border-accentPrimary"
          aria-label="OTP"
        />

        {error ? <div className="mt-4 text-sm text-danger">{error}</div> : null}

        <div className="mt-5">
          <Button type="submit" fullWidth disabled={!canSubmit || loading}>
            Verify
          </Button>
        </div>
      </form>
    </div>
  );
}
