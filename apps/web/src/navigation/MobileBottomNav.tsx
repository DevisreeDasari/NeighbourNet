import { NavLink } from "react-router-dom";
import { Home, Compass, PlusCircle, Calendar, User } from "lucide-react";

const items = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/dashboard", label: "Explore", icon: Compass },
  { to: "/dashboard", label: "Post", icon: PlusCircle },
  { to: "/dashboard", label: "Bookings", icon: Calendar },
  { to: "/settings", label: "Profile", icon: User }
] as const;

export default function MobileBottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-bgCard/80 backdrop-blur-md">
      <div className="mx-auto grid max-w-6xl grid-cols-5 px-2 py-2">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <NavLink
              key={it.label}
              to={it.to}
              className={({ isActive }) =>
                [
                  "flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-semibold",
                  isActive ? "text-textPrimary" : "text-textSecondary"
                ].join(" ")
              }
            >
              <Icon className="h-5 w-5" />
              {it.label}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
