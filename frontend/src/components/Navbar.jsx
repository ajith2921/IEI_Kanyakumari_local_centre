import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import Button from "./ui/Button";

const primaryLinks = [
  { to: "/", label: "Home" },
  { to: "/conference", label: "Conference" },
  { to: "/technical-activities", label: "Events" },
  { to: "/members", label: "Committee" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
];

const moreLinks = [
  { to: "/newsletter", label: "Newsletter" },
  { to: "/facilities", label: "Facilities" },
  { to: "/links-downloads", label: "Resources" },
];

function NavItem({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200 ${
          isActive
            ? "bg-brand-600 text-white shadow-sm"
            : "text-gray-700 hover:bg-slate-100 hover:text-gray-900"
        }`
      }
    >
      {label}
    </NavLink>
  );
}

/* ── "More" dropdown ─────────────────────────────── */
function MoreDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const location = useLocation();

  /* close on route change */
  useEffect(() => setOpen(false), [location.pathname]);

  /* close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const isChildActive = moreLinks.some((l) => location.pathname === l.to);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200 ${
          isChildActive
            ? "bg-brand-600 text-white shadow-sm"
            : "text-gray-700 hover:bg-slate-100 hover:text-gray-900"
        }`}
      >
        More ▾
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
          {moreLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2 text-sm transition ${
                  isActive
                    ? "bg-brand-50 font-semibold text-brand-700"
                    : "text-gray-700 hover:bg-slate-50 hover:text-gray-900"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-700 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>

      {/* Top info bar */}
      <div className="hidden border-b border-slate-200/70 bg-slate-50/80 md:block">
        <div className="page-shell flex items-center justify-between py-1.5 text-xs font-medium text-gray-600">
          <p>The Institution of Engineers (India) — Kanyakumari Local Centre</p>
          <div className="flex items-center gap-4">
            <a
              href="https://wa.me/919443993659"
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-green-700"
            >
              WhatsApp
            </a>
            <Link to="/links-downloads" className="transition hover:text-gray-900">
              Downloads
            </Link>
            <Link to="/newsletter" className="transition hover:text-gray-900">
              Newsletter
            </Link>
          </div>
        </div>
      </div>

      {/* Main nav bar */}
      <div className="page-shell flex items-center justify-between py-2.5">
        <Link to="/" className="flex flex-col leading-tight">
          <span className="whitespace-nowrap text-[15px] font-bold text-gray-900">
            IEI Kanyakumari Local Centre
          </span>
          <span className="text-[11px] font-medium text-gray-500">
            Engineering Excellence · Innovation · Ethics
          </span>
        </Link>

        <button
          type="button"
          className="focus-ring rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-slate-50 lg:hidden"
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? "✕ Close" : "☰ Menu"}
        </button>

        <nav className="hidden items-center gap-0.5 lg:flex">
          {primaryLinks.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
          <MoreDropdown />
          <Button
            as={Link}
            to="/membership-form"
            size="sm"
            className="ml-2"
          >
            Membership
          </Button>
          <Button
            as={Link}
            to="/admin/login"
            variant="secondary"
            size="sm"
          >
            Admin
          </Button>
        </nav>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-slate-200 bg-white/95 lg:hidden">
          <div className="page-shell grid gap-2 py-3">
            {primaryLinks.map((item) => (
              <NavItem key={item.to} {...item} onClick={() => setOpen(false)} />
            ))}
            <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              More
            </p>
            {moreLinks.map((item) => (
              <NavItem key={item.to} {...item} onClick={() => setOpen(false)} />
            ))}
            <Button
              as={Link}
              to="/membership-form"
              onClick={() => setOpen(false)}
              className="mt-2"
            >
              Membership
            </Button>
            <Button
              as={Link}
              to="/admin/login"
              onClick={() => setOpen(false)}
              variant="secondary"
            >
              Admin
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
