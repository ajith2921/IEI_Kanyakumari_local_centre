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
  { to: "/admin/conference", label: "Conference" },
  { to: "/admin/facilities", label: "Facilities" },
  { to: "/admin/downloads", label: "Downloads" },
  { to: "/admin/messages", label: "Contact Messages" },
];

const superAdminNavItems = [
  { to: "/admin/users", label: "Admin Users" },
  { to: "/admin/audit-logs", label: "Audit Logs" },
  { to: "/admin/login-history", label: "Login History" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  return (
    <section className="min-h-screen bg-slate-100/80">
      <div className="mx-auto w-full max-w-screen-2xl p-4 md:p-6 lg:p-8">
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

        <div className="flex flex-col gap-6 md:flex-row">
          <aside
            className={`w-full shrink-0 rounded-2xl border border-brand-800 bg-gradient-to-b from-brand-900 to-brand-800 p-4 text-white shadow-lg md:w-[260px] ${
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

              {isSuperAdmin && (
                <>
                  <div className="my-2 h-px bg-brand-700/50" />
                  <p className="px-3 pb-1 text-xs font-semibold text-brand-200 uppercase tracking-wider">Super Admin</p>
                  {superAdminNavItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
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
                </>
              )}
            </nav>
            <Button type="button" onClick={logout} className="mt-5 w-full">
              Logout
            </Button>
          </aside>

          <main className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
            <Outlet />
          </main>
        </div>
      </div>
    </section>
  );
}
