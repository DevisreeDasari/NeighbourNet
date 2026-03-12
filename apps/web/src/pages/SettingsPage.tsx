import { useEffect, useMemo, useState } from "react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import ThemeToggle from "../components/ThemeToggle";
import { apiFetch } from "../lib/api";
import { resolveMediaUrl } from "../lib/media";
import { useAuthStore } from "../store/auth";

export default function SettingsPage() {
  const { accessToken, user, fetchMe, logout } = useAuthStore();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    name: user?.name ?? "",
    bio: (user as any)?.bio ?? "",
    colony: (user as any)?.colony ?? "",
    pincode: (user as any)?.pincode ?? "",
    city: (user as any)?.city ?? ""
  });

  useEffect(() => {
    setForm({
      name: user?.name ?? "",
      bio: (user as any)?.bio ?? "",
      colony: (user as any)?.colony ?? "",
      pincode: (user as any)?.pincode ?? "",
      city: (user as any)?.city ?? ""
    });
  }, [user]);

  const avatarUrl = useMemo(() => resolveMediaUrl(user?.avatar ?? null), [user?.avatar]);

  return (
    <div className="rounded-2xl border border-border bg-bgCard p-6 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="font-heading text-2xl font-extrabold">Settings</div>
          <div className="mt-2 text-sm text-textSecondary">Update your profile and preferences.</div>
        </div>
        <ThemeToggle />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_360px]">
        <div>
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!accessToken) return;
              setSaving(true);
              setError(null);
              try {
                if (avatarFile) {
                  const fd = new FormData();
                  fd.append("photo", avatarFile);
                  await apiFetch("/api/users/me/photo", {
                    method: "POST",
                    accessToken,
                    body: fd
                  });
                }

                await apiFetch("/api/users/me", {
                  method: "PUT",
                  accessToken,
                  body: JSON.stringify({
                    name: form.name,
                    bio: form.bio,
                    colony: form.colony || undefined,
                    pincode: form.pincode || undefined,
                    city: form.city || undefined
                  })
                });

                await fetchMe();
                setAvatarFile(null);
              } catch (err) {
                setError((err as Error).message);
              } finally {
                setSaving(false);
              }
            }}
          >
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

            <div>
              <label className="mb-1 block text-sm font-semibold">Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value.slice(0, 200) })}
                className="h-28 w-full resize-none rounded-xl border border-border bg-bgElevated px-4 py-3 text-sm text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-[rgba(124,106,247,0.22)]"
                placeholder="Tell neighbours about you"
              />
              <div className="mt-2 text-xs text-textSecondary">{form.bio.length}/200</div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Colony"
                value={form.colony}
                onChange={(e) => setForm({ ...form, colony: e.target.value })}
              />
              <Input
                label="Pincode"
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              />
            </div>

            <Input label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />

            {error ? <div className="text-sm text-danger">{error}</div> : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" disabled={saving}>
                Save changes
              </Button>
              <Button
                type="button"
                variant="ghost"
                disabled={saving}
                onClick={async () => {
                  await logout();
                  window.location.href = "/login";
                }}
              >
                Logout
              </Button>
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-border bg-bgElevated p-5">
          <div className="text-sm font-semibold">Profile photo</div>

          <div className="mt-4 flex items-center gap-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="h-16 w-16 rounded-full border border-border object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full border border-border bg-bgCard" />
            )}
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{user?.name ?? ""}</div>
              <div className="truncate text-xs text-textSecondary">{user?.email ?? ""}</div>
            </div>
          </div>

          <div className="mt-5">
            <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)} />
            <div className="mt-2 text-xs text-textMuted">Choose an image then press Save.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
