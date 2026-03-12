import { useEffect, useMemo, useState } from "react";
import { MapPin, Search } from "lucide-react";
import Button from "../components/ui/Button";
import { apiFetch } from "../lib/api";
import { useAuthStore } from "../store/auth";
import Skeleton from "../components/Skeleton";

type Skill = {
  id: string;
  title: string;
  description: string;
  category: string;
  coinsPerHour: number;
  proficiency: string;
  distanceMeters?: number | null;
  user: {
    id: string;
    name: string;
    avatar?: string | null;
    colony?: string | null;
    city?: string | null;
    trustScore: number;
    isVerified: boolean;
  };
};

function SkillCard({ skill }: { skill: Skill }) {
  return (
    <div className="rounded-2xl border border-border bg-bgCard p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-accentPrimary">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full border border-border bg-bgElevated" />
          <div>
            <div className="text-sm font-semibold">{skill.user.name}</div>
            <div className="text-xs text-textSecondary">
              {(skill.user.colony || "Your colony") + (skill.distanceMeters ? ` • ${(skill.distanceMeters / 1000).toFixed(1)}km away` : "")}
            </div>
          </div>
        </div>
        <div className="rounded-full border border-border bg-bgElevated px-3 py-1 text-xs text-textSecondary">
          {skill.coinsPerHour} coin/hr
        </div>
      </div>

      <div className="mt-4 font-heading text-xl font-bold">{skill.title}</div>
      <div className="mt-2 line-clamp-2 text-sm text-textSecondary">{skill.description}</div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-textSecondary">
            {skill.category}
          </span>
          {skill.user.isVerified ? (
            <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-textSecondary">
              Verified
            </span>
          ) : null}
        </div>
      </div>

      <div className="mt-5">
        <Button fullWidth>Request Session</Button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { accessToken, user, fetchMe } = useAuthStore();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const geo = useMemo(() => {
    const anyUser = user as any;
    return {
      lat: typeof anyUser?.lat === "number" ? (anyUser.lat as number) : 19.076,
      lng: typeof anyUser?.lng === "number" ? (anyUser.lng as number) : 72.8777,
      radius: typeof anyUser?.radius === "number" ? (anyUser.radius as number) : 2000
    };
  }, [user]);

  useEffect(() => {
    if (!accessToken) return;
    void fetchMe();
  }, [accessToken, fetchMe]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const q = new URLSearchParams();
        if (search) q.set("search", search);
        q.set("lat", String(geo.lat));
        q.set("lng", String(geo.lng));
        q.set("radius", String(geo.radius));

        const res = await apiFetch<{ skills: Skill[] }>(`/api/skills?${q.toString()}`);
        if (!cancelled) setSkills(res.skills);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [search, geo.lat, geo.lng, geo.radius]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-sm text-textSecondary">
            Welcome{user?.name ? `, ${user.name}` : ""}. Explore skills nearby.
          </div>
        </div>

        <div className="flex w-full items-center gap-2 rounded-xl border border-border bg-bgCard px-4 py-3 shadow-card md:w-auto">
          <Search className="h-4 w-4 text-textMuted" />
          <input
            className="w-full bg-transparent text-sm text-textPrimary placeholder:text-textMuted focus:outline-none md:w-64"
            placeholder="Search skills"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search"
          />
          <div className="hidden items-center gap-1 text-xs text-textSecondary md:flex">
            <MapPin className="h-3.5 w-3.5" />
            {(geo.radius / 1000).toFixed(0)}km
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[220px]" />
          ))}
        </div>
      ) : skills.length === 0 ? (
        <div className="rounded-2xl border border-border bg-bgCard p-8 shadow-card">
          <div className="font-heading text-xl font-bold">No skills nearby yet</div>
          <div className="mt-2 text-sm text-textSecondary">
            Try adjusting your radius on onboarding, or be the first to post a skill.
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {skills.map((s) => (
            <SkillCard key={s.id} skill={s} />
          ))}
        </div>
      )}
    </div>
  );
}
