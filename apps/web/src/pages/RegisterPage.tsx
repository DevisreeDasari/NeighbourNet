import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { apiFetch } from "../lib/api";
import { useAuthStore, type User } from "../store/auth";

export default function RegisterPage() {
  const nav = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    colony: "",
    pincode: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return !!form.name && !!form.email && form.password.length >= 8;
  }, [form]);

  return (
    <div>
      <div className="font-heading text-2xl font-extrabold">Create account</div>
      <div className="mt-2 text-sm text-textSecondary">
        Join your neighbourhood economy.
      </div>

      <form
        className="mt-6 space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!canSubmit) return;
          setLoading(true);
          setError(null);
          try {
            const res = await apiFetch<{ user: User; accessToken: string }>("/api/auth/register", {
              method: "POST",
              body: JSON.stringify({
                name: form.name,
                email: form.email,
                phone: form.phone || undefined,
                password: form.password,
                colony: form.colony || undefined,
                pincode: form.pincode || undefined
              })
            });
            setSession({ user: res.user, accessToken: res.accessToken });
            nav("/onboarding");
          } catch (err) {
            setError((err as Error).message);
          } finally {
            setLoading(false);
          }
        }}
      >
        <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <Input
          label="Colony/Society"
          value={form.colony}
          onChange={(e) => setForm({ ...form, colony: e.target.value })}
        />
        <Input
          label="Pincode"
          value={form.pincode}
          onChange={(e) => setForm({ ...form, pincode: e.target.value })}
        />

        {error ? <div className="text-sm text-danger">{error}</div> : null}

        <Button type="submit" fullWidth disabled={!canSubmit || loading}>
          Create Account
        </Button>

        <div className="text-center text-sm text-textSecondary">
          Already have an account?{" "}
          <Link className="font-semibold text-textPrimary hover:underline" to="/login">
            Login
          </Link>
        </div>
      </form>
    </div>
  );
}
