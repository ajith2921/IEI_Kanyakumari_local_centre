import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import Button from "./ui/Button";

const menuItems = [
  { to: "/", label: "About" },
  { to: "/membership", label: "Membership" },
  { to: "/membership#chartered-engineer", label: "Certification" },
  { to: "/newsletter", label: "Publications" },
  { to: "/technical-activities", label: "Technical Events" },
  { to: "/links-downloads", label: "Prize & Awards" },
  { to: "/contact", label: "Research Grant-in-Aid" },
  { to: "/facilities", label: "Education and CPD" },
];

const socialIcons = [
  { label: "X", href: "https://x.com" },
  { label: "Fb", href: "https://facebook.com" },
  { label: "Yt", href: "https://youtube.com" },
  { label: "In", href: "https://linkedin.com" },
  { label: "Ig", href: "https://instagram.com" },
];

function NavItem({ to, label, onClick, mobile = false }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `relative rounded-lg px-3 py-2 text-[13px] transition-colors duration-200 ${
          mobile
            ? isActive
              ? "bg-gray-100 font-medium text-gray-900"
              : "font-normal text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            : isActive
              ? "font-medium text-white"
              : "font-normal text-white/70 hover:text-white"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {label}
          {!mobile && isActive && (
            <span className="absolute -bottom-[11px] left-1/2 h-[2px] w-4 -translate-x-1/2 rounded-full bg-[#f4c430]" />
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

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const isChildActive = menuItems.some((l) => location.pathname === l.to);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`inline-flex h-11 items-center gap-1 rounded-lg px-3.5 text-[13px] transition-colors duration-200 ${
          isChildActive
            ? "font-medium text-white"
            : "font-normal text-white/70 hover:text-white"
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
        <div className="absolute right-0 top-full z-50 mt-3 min-w-[180px] rounded-xl border border-white/10 bg-[#1c2647] p-1 shadow-lg animate-fade-in">
          {menuItems.slice(4).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-[13px] transition-colors duration-200 ${
                  isActive
                    ? "bg-white/10 font-medium text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50">
      {/* Utility bar */}
      <div className="hidden bg-[#3D689C] px-4 py-2 text-xs text-white lg:block">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="flex items-center gap-2 rounded border border-white/30 px-3 py-1 transition-colors hover:bg-white/10"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Download Mobile App
            </button>
            <button
              type="button"
              className="rounded border border-white/30 px-3 py-1 transition-colors hover:bg-white/10"
            >
              Contact Us
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              {socialIcons.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-white/80 hover:text-white"
                >
                  {social.label}
                </a>
              ))}
            </div>
            <button
              type="button"
              className="rounded bg-[#f4c430] px-4 py-1.5 font-semibold text-[#1c2647] transition-colors hover:bg-[#e5b42c]"
            >
              LOGIN
            </button>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <div
        className={`border-b border-white/10 bg-[#1c2647] transition-all duration-200 ${
          scrolled ? "nav-scrolled" : ""
        }`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[#f4c430] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-[#1c2647]"
        >
          Skip to main content
        </a>

        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="https://alchetron.com/cdn/institution-of-engineers-india-9cb687ed-c30b-4f38-81f5-344346463d2-resize-750.png"
              alt="Institution of Engineers (India) logo"
              className="h-12 w-12 flex-shrink-0 rounded-full border-2 border-white/20 bg-white object-contain p-1"
              loading="eager"
              decoding="async"
              referrerPolicy="no-referrer"
            />
            <span className="flex flex-col">
              <span className="whitespace-nowrap text-sm font-semibold text-white">
                IEI Kanyakumari Local Centre
              </span>
              <span className="mt-1 inline-flex w-[170px] overflow-hidden rounded-full border border-white/20 bg-white/5 px-2 py-[2px] text-[10px] text-white/60">
                <span className="navbar-marquee-track inline-flex whitespace-nowrap font-medium">
                  <span className="pr-8">(Established in 2025)</span>
                  <span className="pr-8" aria-hidden="true">(Established in 2025)</span>
                </span>
              </span>
            </span>
          </Link>

          <button
            type="button"
            className="focus-ring h-11 rounded-lg border border-white/20 bg-white/5 px-4 text-[13px] font-medium text-white transition-colors hover:bg-white/10 lg:hidden"
            onClick={() => setOpen((prev) => !prev)}
          >
            {open ? "Close" : "Menu"}
          </button>

          <nav className="hidden items-center gap-0.5 lg:flex">
            {menuItems.slice(0, 4).map((item) => (
              <NavItem key={item.to} {...item} />
            ))}
            <MoreDropdown />
          </nav>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div className="animate-fade-in border-t border-white/10 bg-[#1c2647] lg:hidden">
            <div className="mx-auto grid gap-1 px-6 py-4">
              {menuItems.map((item) => (
                <NavItem key={item.to} {...item} onClick={() => setOpen(false)} mobile />
              ))}
              <div className="mt-4 grid gap-2.5">
                <Button
                  as={Link}
                  to="/membership"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="!bg-[#f4c430] !text-[#1c2647]"
                >
                  Membership
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}