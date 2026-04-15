import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const primaryLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/technical-activities", label: "Events" },
  { to: "/members", label: "Members" },
  { to: "/gallery", label: "Gallery" },
  { to: "/links-downloads", label: "Resources" },
  { to: "/contact", label: "Contact" },
];

const secondaryLinks = [
  { to: "/newsletter", label: "Newsletter" },
  { to: "/facilities", label: "Facilities" },
];

function NavItem({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `rounded-lg px-3 py-2 text-sm font-semibold transition ${
          isActive
            ? "bg-brand-600 text-white"
            : "text-brand-800 hover:bg-brand-100 hover:text-brand-700"
        }`
      }
    >
      {label}
    </NavLink>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/95 shadow-[0_10px_30px_-24px_rgba(14,65,134,0.9)] backdrop-blur">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-700 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>

      <div className="hidden border-b border-brand-100 bg-brand-50 md:block">
        <div className="page-shell flex items-center justify-between py-2 text-xs font-semibold text-brand-700">
          <p>Engineering excellence through collaboration and practice.</p>
          <div className="flex items-center gap-4">
            <Link to="/links-downloads" className="hover:text-brand-900">
              Downloads
            </Link>
            <Link to="/newsletter" className="hover:text-brand-900">
              Newsletter
            </Link>
          </div>
        </div>
      </div>

      <div className="page-shell flex items-center justify-between py-3.5">
        <Link to="/" className="flex flex-col">
          <span className="font-heading text-lg font-black text-brand-700 md:text-xl">
            IEI Kanyakumari Local Centre
          </span>
          <span className="text-xs text-brand-500">Institutional Excellence Hub</span>
        </Link>

        <button
          type="button"
          className="focus-ring rounded-lg border border-brand-200 px-3 py-2 text-brand-700 transition hover:bg-brand-50 lg:hidden"
          onClick={() => setOpen((prev) => !prev)}
        >
          Menu
        </button>

        <nav className="hidden items-center gap-1 lg:flex">
          {primaryLinks.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
          {secondaryLinks.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
          <Link
            to="/membership-form"
            className="focus-ring ml-2 rounded-lg bg-brand-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-800"
          >
            Membership
          </Link>
          <Link
            to="/admin/login"
            className="focus-ring rounded-lg border border-brand-200 px-3 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
          >
            Admin
          </Link>
        </nav>
      </div>

      {open && (
        <div className="border-t border-brand-100 bg-white lg:hidden">
          <div className="page-shell grid gap-2 py-3">
            {primaryLinks.map((item) => (
              <NavItem key={item.to} {...item} onClick={() => setOpen(false)} />
            ))}
            <p className="mt-1 text-xs font-black uppercase tracking-wide text-brand-500">
              More
            </p>
            {secondaryLinks.map((item) => (
              <NavItem key={item.to} {...item} onClick={() => setOpen(false)} />
            ))}
            <Link
              to="/membership-form"
              onClick={() => setOpen(false)}
              className="focus-ring mt-2 rounded-lg bg-brand-700 px-3 py-2 text-center text-sm font-semibold text-white"
            >
              Membership
            </Link>
            <Link
              to="/admin/login"
              onClick={() => setOpen(false)}
              className="focus-ring rounded-lg border border-brand-200 px-3 py-2 text-center text-sm font-semibold text-brand-700"
            >
              Admin
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
