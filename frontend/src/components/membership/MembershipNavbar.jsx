import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

/* ─── Nav data matching ieindia.org exactly ─────────────────── */
const navItems = [
  {
    label: "About",
    to: "/membership",
    end: true,
    dropdown: [
      { label: "About IEI",                to: "/membership"                    },
      { label: "Engg Divisions",           to: null                             },
      { label: "IEI Council",              to: null                             },
      { label: "Policies and Regulations", to: null                             },
      { label: "IEI Centres & Network",    to: null                             },
      { label: "IEI Guest House",          to: null                             },
      { label: "Tender Notice",            to: null                             },
      { label: "Leadership",               to: null                             },
      { label: "Career",                   to: null                             },
    ],
  },
  {
    label: "Membership",
    to: null,
    dropdown: [
      { label: "Join IEI", to: "/membership/become-member" },
      { label: "Member Benefits", to: "/membership#membership-info" },
      { label: "Grades of Membership", to: "/membership#membership-info" },
      { label: "Upgrade Membership", to: null },
      { label: "Institutional Membership", to: null },
      { label: "Fees & Subscriptions", to: null },
      { label: "Student Chapters", to: null },
      { label: "Announcement for Members", to: null },
      { label: "FAQ", to: null },
      { label: "Downloads", to: "/links-downloads" },
    ],
  },
  {
    label: "Certification and Arbitration",
    to: "/membership/certification",
    dropdown: null,
  },
  {
    label: "Publication",
    to: "/membership/publications",
    dropdown: null,
  },
  {
    label: "Technical Events",
    to: "/membership/events-cpd",
    dropdown: null,
  },
  {
    label: "Prize & Awards",
    to: null,
    dropdown: [
      { label: "Prize & Awards", to: null },
    ],
  },
  {
    label: "Research Grant-in-Aid",
    to: null,
    dropdown: [
      { label: "Research Grant-in-Aid", to: null },
    ],
  },
  {
    label: "Education and CPD",
    to: "/membership/events-cpd",
    dropdown: null,
  },
];

const socialLinks = [
  {
    href: "https://twitter.com",
    title: "X",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L2 2.25h6.956l4.26 5.632L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
      </svg>
    ),
  },
  {
    href: "https://facebook.com",
    title: "Facebook",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.027 4.388 11.021 10.125 11.927v-8.437H7.078v-3.49h3.047V9.413c0-3.022 1.792-4.688 4.533-4.688 1.312 0 2.686.234 2.686.234v2.97h-1.513c-1.491 0-1.956.928-1.956 1.879v2.255h3.328l-.532 3.49h-2.796v8.437C19.612 23.094 24 18.1 24 12.073Z" />
      </svg>
    ),
  },
  {
    href: "https://youtube.com",
    title: "YouTube",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    href: "https://linkedin.com",
    title: "LinkedIn",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    href: "https://instagram.com",
    title: "Instagram",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
      </svg>
    ),
  },
];

/* ─── Chevron icon ───────────────────────────────────────────── */
function ChevronDown({ open }) {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      className={`ml-1 inline-block h-2.5 w-2.5 flex-shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
    >
      <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ─── Desktop dropdown ────────────────────────────────────────── */
function DesktopNavItem({ item }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const location = useLocation();

  useEffect(() => { setOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const isChildActive = item.dropdown?.some((d) => d.to && location.pathname === d.to) ?? false;

  /* Active nav item: solid indigo-blue block exactly like ieindia.org */
  const activeCls = "bg-[#394d93] text-white";
  const inactiveCls = "text-[#1c2647] hover:bg-[#394d93]/10 hover:text-[#394d93]";

  /* Simple link */
  if (!item.dropdown) {
    return (
      <NavLink
        to={item.to}
        end={item.end}
        className={({ isActive }) =>
          `flex h-full items-center gap-1.5 px-3 py-2.5 text-[12.5px] font-semibold transition-colors duration-150 ${isActive ? activeCls : inactiveCls}`
        }
      >
        {item.label}
      </NavLink>
    );
  }

  /* Dropdown button */
  const isActive = open || isChildActive;
  return (
    <div ref={ref} className="relative h-full">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`flex h-full items-center gap-1 px-3 py-2.5 text-[12.5px] font-semibold transition-colors duration-150 ${isActive ? activeCls : inactiveCls}`}
      >
        {item.label}
        <ChevronDown open={open} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 min-w-[220px] overflow-hidden rounded-b-lg border border-t-0 border-gray-200 bg-white shadow-[0_8px_24px_-8px_rgba(28,38,71,0.25)]">
          {item.dropdown.map((d, i) => (
            d.to ? (
              <NavLink
                key={d.label + i}
                to={d.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2.5 text-[13px] font-medium transition-colors duration-100 ${isActive
                    ? "bg-[#394d93] text-white"
                    : "text-[#1c2647] hover:bg-[#394d93] hover:text-white"
                  }`
                }
              >
                {d.label}
              </NavLink>
            ) : (
              <span
                key={d.label + i}
                className="flex cursor-not-allowed items-center justify-between px-4 py-2.5 text-[13px] font-medium text-gray-400 select-none"
              >
                {d.label}
                <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-gray-400">
                  Soon
                </span>
              </span>
            )
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Mobile accordion item ───────────────────────────────────── */
function MobileNavItem({ item, onClose }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => { setOpen(false); }, [location.pathname]);

  const activeCls = "border-l-4 border-[#394d93] bg-[#394d93]/8 text-[#394d93]";
  const inactiveCls = "border-l-4 border-transparent text-[#1c2647]";

  if (!item.dropdown) {
    return (
      <NavLink
        to={item.to}
        end={item.end}
        onClick={onClose}
        className={({ isActive }) =>
          `flex items-center gap-2 px-5 py-3.5 text-[13.5px] font-semibold transition-colors ${isActive ? activeCls : inactiveCls} hover:bg-gray-50`
        }
      >
        {item.label}
      </NavLink>
    );
  }

  return (
    <div className="border-b border-gray-100">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="flex w-full items-center justify-between px-5 py-3.5 text-[13.5px] font-semibold text-[#1c2647] hover:bg-gray-50"
      >
        {item.label}
        <ChevronDown open={open} />
      </button>
      {open && (
        <div className="bg-gray-50">
          {item.dropdown.map((d, i) =>
            d.to ? (
              <NavLink
                key={d.label + i}
                to={d.to}
                onClick={() => { setOpen(false); onClose(); }}
                className={({ isActive }) =>
                  `block px-8 py-2.5 text-[13px] font-medium transition-colors ${isActive
                    ? "bg-[#394d93] text-white"
                    : "text-[#1c2647] hover:bg-[#394d93] hover:text-white"
                  }`
                }
              >
                {d.label}
              </NavLink>
            ) : (
              <span key={d.label + i} className="flex cursor-not-allowed items-center justify-between px-8 py-2.5 text-[13px] text-gray-400">
                {d.label}
                <span className="rounded-full bg-gray-200 px-1.5 py-0.5 text-[9px] font-bold uppercase text-gray-400">Soon</span>
              </span>
            )
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Main navbar ─────────────────────────────────────────────── */
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
    <header className="sticky top-0 z-50 w-full overflow-x-hidden">

      {/* ══ TOP UTILITY BAR — dark navy #1c2647 ══════════════════ */}
      <div className="w-full overflow-hidden bg-[#1c2647]">
        <div className="mx-auto flex max-w-[1380px] items-center px-3 py-1.5 sm:px-5">

          {/* Left spacer */}
          <div className="flex-1" />

          {/* Right: Contact + Socials + LOGIN */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">

            {/* Contact Us */}
            <a
              href="/contact"
              className="flex shrink-0 items-center gap-1 rounded border border-[#f4c430]/70 px-2 py-0.5 text-[10px] font-semibold text-[#f4c430] transition-colors hover:bg-[#f4c430] hover:text-[#1c2647] sm:px-2.5 sm:text-[11px]"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3 shrink-0">
                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z" />
              </svg>
              <span className="hidden min-[380px]:inline">Contact Us</span>
            </a>

            {/* Social icons */}
            <div className="hidden min-[500px]:flex items-center gap-2">
              {socialLinks.map(({ href, icon, title }) => (
                <a
                  key={title}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={title}
                  className="text-gray-400 transition-colors hover:text-[#f4c430]"
                >
                  {icon}
                </a>
              ))}
            </div>

            {/* LOGIN — solid gold block exactly like ieindia.org */}
            <Link
              to="/membership#auth-panel"
              className="flex shrink-0 items-center gap-1 bg-[#f4c430] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#1c2647] transition-opacity hover:opacity-90 sm:px-4 sm:text-[11px]"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3 shrink-0">
                <path d="M11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6.5 13c-2 0-3.5 1-3.5 2.5V16h10v-.5c0-1.5-1.5-2.5-3.5-2.5H6.5Z"/>
                <path d="M13 4V2h-2v2H3v8h10V4h-2Z"/>
              </svg>
              LOGIN
            </Link>
          </div>
        </div>
      </div>

      {/* ══ MAIN NAV BAR — light blue #dce0f5 like ieindia.org ═══ */}
      <div className="w-full overflow-visible border-b border-[#b8c4d8] bg-[#dce0f5]">
        <div className="mx-auto flex max-w-[1380px] items-stretch px-2 sm:px-4">

          {/* Logo */}
          <Link
            to="/membership"
            className="relative mr-2 flex shrink-0 items-center py-1"
            style={{ marginTop: "-20px", marginBottom: "-2px" }}
          >
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxmIZ-qa5ZjmZA_1f-vsRiLgIwDuwaawFh0g&s"
              alt="IEI Kanyakumari Local Centre"
              className="h-[72px] w-[72px] rounded-full border-4 border-[#1c2647] bg-white object-contain shadow-md"
              loading="eager"
              decoding="async"
              referrerPolicy="no-referrer"
            />
          </Link>

          {/* Mobile toggle */}
          <button
            type="button"
            className="ml-auto flex flex-col justify-center gap-[5px] p-3 lg:hidden"
            onClick={() => setMobileOpen((p) => !p)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <span className={`block h-0.5 w-5 bg-[#1c2647] transition-transform duration-200 ${mobileOpen ? "translate-y-1.5 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-5 bg-[#1c2647] transition-opacity duration-200 ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-5 bg-[#1c2647] transition-transform duration-200 ${mobileOpen ? "-translate-y-1.5 -rotate-45" : ""}`} />
          </button>

          {/* Desktop nav — full height items with solid active block */}
          <nav className="hidden h-full items-stretch lg:flex lg:flex-nowrap overflow-x-auto" aria-label="Main navigation">
            {navItems.map((item) => (
              <DesktopNavItem key={item.label} item={item} />
            ))}
          </nav>
        </div>
      </div>

      {/* ══ MOBILE DRAWER ═══════════════════════════════════════ */}
      {mobileOpen && (
        <div className="border-t border-gray-200 bg-white shadow-lg lg:hidden">
          <nav className="flex flex-col" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <MobileNavItem
                key={item.label}
                item={item}
                onClose={() => setMobileOpen(false)}
              />
            ))}

            {/* Mobile CTAs */}
            <div className="border-t border-gray-100 px-5 py-4">
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/membership#auth-panel"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-1.5 bg-[#f4c430] px-4 py-2 text-[12px] font-bold uppercase tracking-wide text-[#1c2647]"
                >
                  LOGIN
                </Link>
                <a
                  href="/contact"
                  className="flex items-center border border-[#1c2647] px-4 py-2 text-[12px] font-semibold text-[#1c2647] hover:bg-[#1c2647] hover:text-white"
                >
                  Contact Us
                </a>
              </div>
              {/* Mobile socials */}
              <div className="mt-4 flex items-center gap-4">
                {socialLinks.map(({ href, icon, title }) => (
                  <a
                    key={title}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={title}
                    className="text-[#1c2647] transition-colors hover:text-[#f4c430]"
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}