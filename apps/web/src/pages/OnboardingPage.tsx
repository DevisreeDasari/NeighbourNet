import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Circle, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Button from "../components/ui/Button";
import { useAuthStore } from "../store/auth";
import { apiFetch } from "../lib/api";
import SkillCategoryGrid from "../components/SkillCategoryGrid";
import WeeklyCalendar from "../components/WeeklyCalendar";
import ThemeToggle from "../components/ThemeToggle";

function ClickToSet({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

const radii = [500, 1000, 2000, 5000] as const;

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { accessToken, fetchMe } = useAuthStore();
  const [step, setStep] = useState(1);
  const [lat, setLat] = useState<number>(19.076);
  const [lng, setLng] = useState<number>(72.8777);
  const [radius, setRadius] = useState<(typeof radii)[number]>(2000);
  const [saving, setSaving] = useState(false);

  const [offerCats, setOfferCats] = useState<Set<string>>(new Set());
  const [needCats, setNeedCats] = useState<Set<string>>(new Set());

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bio, setBio] = useState("");
  const [availabilityDays, setAvailabilityDays] = useState<Set<string>>(new Set(["Sat", "Sun"]));

  const progress = useMemo(() => (step / 4) * 100, [step]);

  return (
    <div className="min-h-dvh bg-bgPrimary text-textPrimary">
      <div className="noise pointer-events-none fixed inset-0 opacity-35" />
      <div className="mx-auto max-w-6xl px-5 py-10">
        <div className="rounded-2xl border border-border bg-bgCard p-6 shadow-card">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-heading text-2xl font-extrabold">Onboarding</div>
              <div className="mt-1 text-sm text-textSecondary">Step {step} of 4</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-40 overflow-hidden rounded-full bg-bgElevated">
                <div className="h-full bg-gradient-to-r from-[#7C6AF7] to-[#F7A26A]" style={{ width: `${progress}%` }} />
              </div>
              <ThemeToggle />
            </div>
          </div>

          {step === 1 ? (
            <div className="mt-6 grid gap-6 md:grid-cols-[1fr_320px]">
              <div className="overflow-hidden rounded-2xl border border-border">
                <MapContainer center={[lat, lng]} zoom={13} style={{ height: 420, width: "100%" }}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <ClickToSet
                    onPick={(a, b) => {
                      setLat(a);
                      setLng(b);
                    }}
                  />
                  <Circle center={[lat, lng]} radius={radius} pathOptions={{ color: "#7C6AF7" }} />
                </MapContainer>
              </div>

              <div className="rounded-2xl border border-border bg-bgElevated p-5">
                <div className="font-heading text-lg font-bold">Your Location</div>
                <div className="mt-2 text-sm text-textSecondary">
                  Click on the map to pin your neighbourhood.
                </div>

                <div className="mt-5">
                  <div className="text-sm font-semibold">Radius</div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {radii.map((r) => (
                      <button
                        key={r}
                        type="button"
                        className={[
                          "rounded-xl border px-3 py-2 text-sm font-semibold",
                          r === radius
                            ? "border-accentPrimary bg-white/5"
                            : "border-border bg-bgCard text-textSecondary hover:border-accentPrimary"
                        ].join(" ")}
                        onClick={() => setRadius(r)}
                      >
                        {r < 1000 ? `${r}m` : `${r / 1000}km`}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    fullWidth
                    disabled={saving}
                    onClick={async () => {
                      setSaving(true);
                      try {
                        await apiFetch("/api/users/me", {
                          method: "PUT",
                          accessToken: accessToken ?? undefined,
                          body: JSON.stringify({ lat, lng, radius })
                        });
                        setStep(2);
                      } finally {
                        setSaving(false);
                      }
                    }}
                  >
                    Your neighbourhood is now set
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="mt-6">
              <div className="rounded-2xl border border-border bg-bgElevated p-6">
                <SkillCategoryGrid
                  title="Step 2 — Your Skills"
                  selected={offerCats}
                  onToggle={(cat) => {
                    const next = new Set(offerCats);
                    next.has(cat) ? next.delete(cat) : next.add(cat);
                    setOfferCats(next);
                  }}
                />

                <div className="mt-6 flex gap-3">
                  <Button variant="ghost" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button onClick={() => setStep(3)}>Next</Button>
                </div>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="mt-6">
              <div className="rounded-2xl border border-border bg-bgElevated p-6">
                <SkillCategoryGrid
                  title="Step 3 — Your Needs"
                  selected={needCats}
                  onToggle={(cat) => {
                    const next = new Set(needCats);
                    next.has(cat) ? next.delete(cat) : next.add(cat);
                    setNeedCats(next);
                  }}
                />

                <div className="mt-6 flex gap-3">
                  <Button variant="ghost" onClick={() => setStep(2)}>
                    Back
                  </Button>
                  <Button onClick={() => setStep(4)}>Next</Button>
                </div>
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="mt-6">
              <div className="rounded-2xl border border-border bg-bgElevated p-6">
                <div className="font-heading text-lg font-bold">Step 4 — Profile Setup</div>
                <div className="mt-2 text-sm text-textSecondary">
                  Add a photo, bio, and basic availability.
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">
                  <div>
                    <div className="text-sm font-semibold">Profile photo</div>
                    <div className="mt-3 rounded-2xl border border-border bg-bgCard p-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
                        aria-label="Upload profile photo"
                      />
                      <div className="mt-3 text-xs text-textMuted">
                        Uploads are stored locally in dev.
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold">Bio</div>
                    <div className="mt-3 rounded-2xl border border-border bg-bgCard p-4">
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value.slice(0, 200))}
                        className="h-28 w-full resize-none rounded-xl border border-border bg-bgElevated px-4 py-3 text-sm text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-[rgba(124,106,247,0.22)]"
                        placeholder="Tell neighbours what you love helping with..."
                        aria-label="Bio"
                      />
                      <div className="mt-2 text-xs text-textSecondary">{bio.length}/200</div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-border bg-bgCard p-4">
                  <WeeklyCalendar
                    selected={availabilityDays}
                    onToggle={(day) => {
                      const next = new Set(availabilityDays);
                      next.has(day) ? next.delete(day) : next.add(day);
                      setAvailabilityDays(next);
                    }}
                  />
                </div>

                <div className="mt-6 flex flex-col gap-3 md:flex-row md:justify-between">
                  <Button variant="ghost" onClick={() => setStep(3)}>
                    Back
                  </Button>
                  <Button
                    disabled={saving}
                    onClick={async () => {
                      if (!accessToken) return;
                      setSaving(true);
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
                          body: JSON.stringify({ bio })
                        });

                        await fetchMe();

                        localStorage.setItem(
                          "nn_onboarding",
                          JSON.stringify({
                            offerCategories: Array.from(offerCats),
                            needCategories: Array.from(needCats),
                            availabilityDays: Array.from(availabilityDays)
                          })
                        );

                        navigate("/dashboard");
                      } finally {
                        setSaving(false);
                      }
                    }}
                  >
                    Finish
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

        </div>
      </div>
    </div>
  );
}
