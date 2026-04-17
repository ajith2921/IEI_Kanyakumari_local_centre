import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";

const navItems = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/members", label: "Members" },
  { to: "/admin/gallery", label: "Gallery" },
  { to: "/admin/newsletters", label: "Newsletters" },
  { to: "/admin/activities", label: "Activities" },
  { to: "/admin/facilities", label: "Facilities" },
  { to: "/admin/downloads", label: "Downloads" },
  { to: "/admin/messages", label: "Contact Messages" },
  { to: "/admin/memberships", label: "Membership Requests" },
];

export default function AdminLayout() {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <section className="min-h-screen bg-slate-100/80">
      <div className="mx-auto max-w-7xl p-4 md:p-6">
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:hidden">
          <p className="text-sm font-semibold text-gray-900">Admin Dashboard</p>
          <Button
            onClick={() => setOpen((prev) => !prev)}
            variant="secondary"
            size="sm"
          >
            {open ? "Close Menu" : "Open Menu"}
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-[250px_1fr]">
          <aside
            className={`rounded-2xl border border-brand-800 bg-gradient-to-b from-brand-900 to-brand-800 p-4 text-white shadow-lg ${
              open ? "block" : "hidden"
            } md:block`}
          >
            <h1 className="mb-4 text-lg font-semibold">Admin Dashboard</h1>
            <nav className="grid gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/admin"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `rounded-xl px-3 py-2 text-sm transition-all duration-300 ${
                      isActive
                        ? "bg-white text-brand-800 shadow-sm"
                        : "text-brand-50 hover:bg-brand-700/75"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <Button type="button" onClick={logout} className="mt-5 w-full">
              Logout
            </Button>
          </aside>

          <main className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
            <Outlet />
          </main>
        </div>
      </div>
    </section>
  );
}
