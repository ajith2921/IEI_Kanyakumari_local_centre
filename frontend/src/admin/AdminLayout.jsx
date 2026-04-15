import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
    <section className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-7xl p-4">
        <div className="mb-4 flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm md:hidden">
          <p className="text-sm font-black text-brand-800">Admin Dashboard</p>
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="focus-ring rounded-lg border border-brand-200 px-3 py-2 text-sm font-semibold text-brand-700"
          >
            {open ? "Close Menu" : "Open Menu"}
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-[250px_1fr]">
          <aside
            className={`rounded-2xl bg-brand-900 p-4 text-white ${
              open ? "block" : "hidden"
            } md:block`}
          >
            <h1 className="mb-4 text-lg font-black">Admin Dashboard</h1>
            <nav className="grid gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/admin"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm transition ${
                      isActive ? "bg-white text-brand-800" : "text-brand-50 hover:bg-brand-800"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <button
              type="button"
              onClick={logout}
              className="focus-ring mt-5 w-full rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold hover:bg-brand-500"
            >
              Logout
            </button>
          </aside>

          <main className="rounded-2xl bg-white p-5 shadow-sm md:p-7">
            <Outlet />
          </main>
        </div>
      </div>
    </section>
  );
}
