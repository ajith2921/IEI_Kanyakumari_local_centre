import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import Button from "./ui/Button";

const primaryLinks = [
  { to: "/", label: "Home" },
  { to: "/conference", label: "Conference" },
  { to: "/technical-activities", label: "Events" },
  { to: "/members", label: "Committee" },
  { to: "/gallery", label: "Gallery" },
];

const moreLinks = [
  { to: "/contact", label: "Contact" },
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
        `relative rounded-lg px-3 py-2 text-[13px] transition-colors duration-200 ${
          isActive
            ? "font-medium text-gray-900"
            : "font-normal text-gray-500 hover:text-gray-900"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {label}
          {isActive && (
            <span className="absolute -bottom-[13px] left-1/2 h-[2px] w-4 -translate-x-1/2 rounded-full bg-gray-900" />
          )}
        </>
      )}
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
        className={`flex items-center gap-1 rounded-lg px-3 py-2 text-[13px] transition-colors duration-200 ${
          isChildActive
            ? "font-medium text-gray-900"
            : "font-normal text-gray-500 hover:text-gray-900"
        }`}
      >
        More
        <svg
          className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 12 12"
          fill="none"
        >
          <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-3 min-w-[180px] rounded-xl border border-gray-200 bg-white p-1 shadow-lg animate-fade-in">
          {moreLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-[13px] transition-colors duration-200 ${
                  isActive
                    ? "bg-gray-50 font-medium text-gray-900"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
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
  const [scrolled, setScrolled] = useState(false);
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

  /* scroll shadow */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-white/95 backdrop-blur transition-all duration-200 ${
        scrolled ? "border-transparent nav-scrolled" : "border-gray-200"
      }`}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-gray-900 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to main content
      </a>

      {/* Main nav bar */}
      <div className="page-shell flex items-center justify-between py-3">
        <Link to="/" className="flex items-center gap-3 leading-tight">
          <img
            src="https://alchetron.com/cdn/institution-of-engineers-india-9cb687ed-c30b-4f38-81f5-344346463d2-resize-750.png"
            alt="Institution of Engineers (India) logo"
            className="h-8 w-8 flex-shrink-0 rounded-full border border-gray-100 bg-white object-contain p-0.5"
            loading="eager"
            decoding="async"
            referrerPolicy="no-referrer"
          />
          <span className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-gray-900">
              IEI Kanyakumari
            </span>
            <span className="text-[11px] text-gray-400">
              Local Centre
            </span>
          </span>
        </Link>

        <button
          type="button"
          className="focus-ring rounded-lg border border-gray-200 bg-white px-3.5 py-1.5 text-[13px] font-medium text-gray-600 transition-colors duration-200 hover:bg-gray-50 lg:hidden"
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? "Close" : "Menu"}
        </button>

        <nav className="hidden items-center gap-1 lg:flex">
          {primaryLinks.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
          <MoreDropdown />
          <div className="ml-3 flex items-center gap-2.5 border-l border-gray-200 pl-3">
            <Button as={Link} to="/membership-form" size="sm">
              Membership
            </Button>
            <Button as={Link} to="/admin/login" variant="secondary" size="sm">
              Admin
            </Button>
          </div>
        </nav>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="animate-fade-in border-t border-gray-100 bg-white lg:hidden">
          <div className="page-shell grid gap-1 py-4">
            {primaryLinks.map((item) => (
              <NavItem key={item.to} {...item} onClick={() => setOpen(false)} />
            ))}
            <p className="mb-1 mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
              More
            </p>
            {moreLinks.map((item) => (
              <NavItem key={item.to} {...item} onClick={() => setOpen(false)} />
            ))}
            <div className="mt-4 grid gap-2.5">
              <Button as={Link} to="/membership-form" onClick={() => setOpen(false)}>
                Membership
              </Button>
              <Button as={Link} to="/admin/login" onClick={() => setOpen(false)} variant="secondary">
                Admin
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
