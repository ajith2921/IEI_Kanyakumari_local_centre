import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

/* ─── Navigation data (label, route, icon, dropdown) ────────── */
const navItems = [
  {
    label: "About",
    to: "/membership",
    end: true,
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3 flex-shrink-0">
        <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm0 3.5c.28 0 .5.22.5.5v3.5a.5.5 0 0 1-1 0V8a.5.5 0 0 1 .5-.5Z" />
      </svg>
    ),
    dropdown: null,
  },
  {
    label: "Membership",
    to: null,
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3 flex-shrink-0">
        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5 5a5 5 0 0 1 10 0H3Z" />
      </svg>
    ),
    dropdown: [
      { label: "Become a Member", to: "/membership/become-member" },
      { label: "Member Services", to: "/membership/member-services" },
    ],
  },
  {
    label: "Certification and Arbitration",
    to: "/membership/certification",
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3 flex-shrink-0">
        <path d="M6 1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6l-5-5H6Zm0 1h4v4h4v8H2V2h4Zm5 .7L13.3 6H11V2.7Z" />
      </svg>
    ),
    dropdown: null,
  },
  {
    label: "Publication",
    to: "/membership/publications",
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3 flex-shrink-0">
        <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 13.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8V1.5Z" />
      </svg>
    ),
    dropdown: null,
  },
  {
    label: "Technical Events",
    to: "/membership/events-cpd",
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3 flex-shrink-0">
        <path d="M2 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1H2V3Zm0 2v7a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V5H2Zm5 2a.5.5 0 0 1 .5.5v2.793l1.146-1.147a.5.5 0 0 1 .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 0 1 .708-.708L7 10.293V7.5A.5.5 0 0 1 7 7Z" />
      </svg>
    ),
    dropdown: null,
  },
  {
    label: "Prize & Awards",
    to: null,
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3 flex-shrink-0">
        <path d="M8 1.5a.5.5 0 0 1 .447.276l1.43 2.895 3.197.465a.5.5 0 0 1 .277.853l-2.313 2.254.546 3.183a.5.5 0 0 1-.725.527L8 10.202 5.141 11.953a.5.5 0 0 1-.725-.527l.546-3.183L2.649 5.99a.5.5 0 0 1 .277-.853l3.197-.465L7.553 1.776A.5.5 0 0 1 8 1.5Z" />
      </svg>
    ),
    dropdown: [
      { label: "Prize & Awards", to: null },
    ],
  },
  {
    label: "Research Grant-in-Aid",
    to: null,
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3 flex-shrink-0">
        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 1a5 5 0 0 0-4.546 2.916A6.983 6.983 0 0 0 8 15a6.983 6.983 0 0 0 4.546-1.084A5.002 5.002 0 0 0 8 9Z" />
      </svg>
    ),
    dropdown: [
      { label: "Research Grant-in-Aid", to: null },
    ],
  },
  {
    label: "Education and CPD",
    to: null,
    icon: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3 flex-shrink-0">
        <path d="M8 .5a.5.5 0 0 1 .447.276l1.43 2.895L13.074 4a.5.5 0 0 1 .277.853l-2.313 2.254.546 3.183A.5.5 0 0 1 10.859 10.8L8 9.197l-2.859 1.6a.5.5 0 0 1-.725-.51l.546-3.183L2.649 4.853A.5.5 0 0 1 2.926 4l3.197-.329L7.553.776A.5.5 0 0 1 8 .5ZM5 12a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm6 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm-3 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z" />
      </svg>
    ),
    dropdown: [
      { label: "Education and CPD", to: "/membership/events-cpd" },
    ],
  },
];

/* ─── Social icons ──────────────────────────────────────────── */
function IconX() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L2 2.25h6.956l4.26 5.632L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
    </svg>
  );
}
function IconFacebook() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.027 4.388 11.021 10.125 11.927v-8.437H7.078v-3.49h3.047V9.413c0-3.022 1.792-4.688 4.533-4.688 1.312 0 2.686.234 2.686.234v2.97h-1.513c-1.491 0-1.956.928-1.956 1.879v2.255h3.328l-.532 3.49h-2.796v8.437C19.612 23.094 24 18.1 24 12.073Z" />
    </svg>
  );
}
function IconYouTube() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}
function IconLinkedIn() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}
function IconChevronDown({ open = false }) {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      className={`inline-block h-2.5 w-2.5 flex-shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
    >
      <path
        d="M2.5 4l3.5 3.5L9.5 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── Active-state styles ────────────────────────────────────── */
// Active: text darkens + 3px blue bottom border. No bg fill.
const activeNavCls =
  "relative text-[#0b3a67] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-[#0b3a67] after:content-['']";
const inactiveNavCls =
  "relative text-[#1a1a1a] font-semibold hover:text-[#0b3a67] hover:bg-white/60 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-transparent after:content-['']";

/* ─── Dropdown row ──────────────────────────────────────────── */
function DropdownItem({ to, label, onClick }) {
  if (!to) {
    return (
      <span className="block cursor-not-allowed whitespace-nowrap px-4 py-2 text-[13px] font-medium text-gray-400 select-none">
        {label} <span className="text-[11px]">(Coming Soon)</span>
      </span>
    );
  }
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `block whitespace-nowrap px-4 py-2 text-[13px] font-medium transition-colors duration-100 ${isActive
          ? "bg-[#0b3a67] text-white"
          : "text-[#1a1a1a] hover:bg-[#0b3a67] hover:text-white"
        }`
      }
    >
      {label}
    </NavLink>
  );
}

/* ─── Desktop nav item ──────────────────────────────────────── */
function DesktopNavItem({ item }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const location = useLocation();

  useEffect(() => { setOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  // Only count a child as active when it has a real non-null route that matches exactly
  const isChildActive = item.dropdown?.some((d) => d.to && location.pathname === d.to) ?? false;

  /* Simple link (no dropdown) */
  if (!item.dropdown) {
    return (
      <NavLink
        to={item.to}
        end={item.end}
        className={({ isActive }) =>
          `flex items-center gap-1.5 px-2.5 py-3 text-[12px] transition-colors duration-100 ${isActive ? activeNavCls : inactiveNavCls
          }`
        }
      >
        {item.icon}
        {item.label}
      </NavLink>
    );
  }

  /* Dropdown button */
  const isActive = open || isChildActive;
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`flex items-center gap-1.5 px-2.5 py-3 text-[12px] transition-colors duration-100 ${isActive ? activeNavCls : inactiveNavCls
          }`}
      >
        {item.icon}
        {item.label}
        <IconChevronDown open={open} />
      </button>
      {open && (
        <div className="absolute left-0 top-full z-50 min-w-[210px] border border-gray-300 bg-white">
          {item.dropdown.map((d) => (
            <DropdownItem key={d.to} to={d.to} label={d.label} onClick={() => setOpen(false)} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Mobile accordion dropdown ─────────────────────────────── */
function MobileDropdownItem({ item, onClose }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between px-5 py-3 text-[13px] font-semibold text-[#1a1a1a] hover:bg-white/70"
      >
        <span className="flex items-center gap-2">{item.icon}{item.label}</span>
        <IconChevronDown open={open} />
      </button>
      {open && (
        <div className="bg-white border-t border-gray-200">
          {item.dropdown.map((d) => (
            <NavLink
              key={d.to}
              to={d.to}
              onClick={() => { setOpen(false); onClose(); }}
              className={({ isActive }) =>
                `block px-8 py-2.5 text-[13px] ${isActive
                  ? "bg-[#0b3a67] font-semibold text-white"
                  : "text-[#1a1a1a] hover:bg-[#0b3a67] hover:text-white"
                }`
              }
            >
              {d.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main navbar export ────────────────────────────────────── */
export default function MembershipNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const h = (e) => { if (e.key === "Escape") setMobileOpen(false); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 w-full">

      {/* ══ TOP UTILITY BAR ════════════════════════════════════ */}
      <div style={{ background: "#0b3a67" }} className="w-full">
        <div className="mx-auto flex max-w-[1280px] items-center px-4 py-1.5">

          {/* Spacer — logo now lives in the nav bar and overlaps upward */}
          <div className="mr-auto" />

          {/* Right: Contact Us + socials + LOGIN */}
          <div className="flex items-center gap-3">
            {/* Contact Us */}
            <a
              href="/contact"
              className="inline-flex items-center gap-1.5 border border-[#f4c430] px-2.5 py-0.5 text-[11px] font-semibold text-[#f4c430] transition-colors hover:bg-[#f4c430] hover:text-[#0b3a67]"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3">
                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z" />
              </svg>
              Contact Us
            </a>

            {/* Social icons */}
            <div className="flex items-center gap-2">
              {[
                { href: "https://twitter.com", icon: <IconX />, title: "X" },
                { href: "https://facebook.com", icon: <IconFacebook />, title: "Facebook" },
                { href: "https://youtube.com", icon: <IconYouTube />, title: "YouTube" },
                { href: "https://linkedin.com", icon: <IconLinkedIn />, title: "LinkedIn" },
                { href: "https://instagram.com", icon: <IconInstagram />, title: "Instagram" },
              ].map(({ href, icon, title }) => (
                <a
                  key={title}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={title}
                  className="text-gray-300 transition-colors hover:text-[#f4c430]"
                >
                  {icon}
                </a>
              ))}
            </div>

            {/* LOGIN */}
            <Link
              to="/membership#auth-panel"
              className="inline-flex items-center bg-[#f4c430] px-4 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#1a1a1a] transition-opacity hover:opacity-90"
            >
              LOGIN
            </Link>
          </div>
        </div>
      </div>

      {/* ══ MAIN NAV BAR ════════════════════════════════════════ */}
      <div style={{ background: "#f1f1f1" }} className="w-full border-b-2 border-gray-300 overflow-visible">
        <div className="mx-auto flex max-w-[1280px] items-stretch px-4">

          {/* Single logo — tall enough to straddle both bars */}
          <Link
            to="/membership"
            className="flex items-center pr-4 flex-shrink-0 relative"
            style={{ marginTop: "-28px" }}
          >
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxmIZ-qa5ZjmZA_1f-vsRiLgIwDuwaawFh0g&s"
              alt="IEI Kanyakumari Local Centre logo"
              className="h-20 w-20 flex-shrink-0 object-contain rounded-full bg-white border-4 border-[#0b3a67] shadow-sm"
              loading="eager"
              decoding="async"
              referrerPolicy="no-referrer"
            />
            <span className="sr-only">
              Kanyakumari Local Centre
            </span>
          </Link>

        {/* Mobile toggle */}
        <button
          type="button"
          className="ml-auto flex flex-col justify-center gap-[5px] p-3 lg:hidden"
          onClick={() => setMobileOpen((p) => !p)}
          aria-label="Toggle menu"
        >
          <span className="block h-0.5 w-5 bg-[#1a1a1a]" />
          <span className="block h-0.5 w-5 bg-[#1a1a1a]" />
          <span className="block h-0.5 w-5 bg-[#1a1a1a]" />
        </button>

        {/* Desktop nav */}
        <nav className="hidden items-stretch lg:flex lg:flex-nowrap" aria-label="Main navigation">
          {navItems.map((item) => (
            <DesktopNavItem key={item.label} item={item} />
          ))}
        </nav>
      </div>
    </div>

      {/* ══ MOBILE DRAWER ═══════════════════════════════════════ */}
      {mobileOpen && (
        <div style={{ background: "#f1f1f1" }} className="border-t border-gray-300 lg:hidden">
          <nav className="flex flex-col divide-y divide-gray-200">
            {navItems.map((item) =>
              item.dropdown ? (
                <MobileDropdownItem key={item.label} item={item} onClose={() => setMobileOpen(false)} />
              ) : (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-5 py-3 text-[13px] font-semibold border-l-4 ${isActive
                      ? "border-[#0b3a67] bg-white text-[#0b3a67]"
                      : "border-transparent text-[#1a1a1a] hover:bg-white/70 hover:border-gray-300"
                    }`
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              )
            )}
            {/* Mobile CTA */}
            <div className="flex items-center gap-3 px-5 py-3">
              <Link
                to="/membership#auth-panel"
                onClick={() => setMobileOpen(false)}
                className="bg-[#f4c430] px-4 py-1.5 text-[12px] font-bold uppercase text-[#1a1a1a]"
              >
                LOGIN
              </Link>
              <a
                href="/contact"
                className="border border-[#0b3a67] px-4 py-1.5 text-[12px] font-semibold text-[#0b3a67] hover:bg-[#0b3a67] hover:text-white"
              >
                Contact Us
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}