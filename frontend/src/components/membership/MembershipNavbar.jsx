import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const membershipLinks = [
  { hash: "#be-member", label: "Become a Member" },
  { hash: "#membership-info", label: "Membership Info" },
  { hash: "#chartered-engineer", label: "Chartered Engineer" },
  { hash: "#professional-engineer", label: "Professional Engineer" },
  { hash: "#section-ab", label: "Section A & B" },
  { hash: "#publications", label: "Publications" },
  { hash: "#network-activities", label: "Events & CPD" },
  { hash: "#auth-panel", label: "Sign In" },
];

function MembershipLink({ hash, label, onClick }) {
  const location = useLocation();
  const isActive =
    location.pathname === "/membership-form" &&
    (location.hash === hash || (!location.hash && hash === "#be-member"));

  return (
    <Link
      to={`/membership-form${hash}`}
      onClick={onClick}
      aria-current={isActive ? "location" : undefined}
      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs transition-colors duration-150 ${
        isActive
          ? "border-gray-900 bg-gray-900 text-white"
          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900"
      }`}
    >
      {label}
    </Link>
  );
}

export default function MembershipNavbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-gray-900 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to main content
      </a>

      <div className="page-shell flex items-center justify-between py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-200 bg-white p-1">
            <img
              src="https://alchetron.com/cdn/institution-of-engineers-india-9cb687ed-c30b-4f38-81f5-344346463d2-resize-750.png"
              alt="Institution of Engineers (India) logo"
              className="h-full w-full object-contain"
              loading="eager"
              decoding="async"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">Membership Portal</p>
            <p className="truncate text-xs text-gray-400">IEI Kanyakumari Local Centre</p>
          </div>
        </div>

        <button
          type="button"
          className="focus-ring h-10 rounded-lg border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-600 hover:bg-gray-50 lg:hidden"
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? "Close" : "Menu"}
        </button>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            to="/"
            className="focus-ring rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-900"
          >
            Main Site
          </Link>
          <Link
            to="/admin/login"
            className="focus-ring rounded-lg border border-gray-900 bg-gray-900 px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-black"
          >
            Admin
          </Link>
        </div>
      </div>

      <div className="hidden border-t border-gray-100 bg-gray-50 lg:block">
        <div className="page-shell flex items-center gap-2 overflow-x-auto py-2">
          {membershipLinks.map((item) => (
            <MembershipLink key={item.hash} hash={item.hash} label={item.label} />
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 bg-gray-50 lg:hidden">
        <nav className="page-shell flex items-center gap-2 overflow-x-auto py-2" aria-label="Membership sections">
          {membershipLinks.map((item) => (
            <MembershipLink key={item.hash} hash={item.hash} label={item.label} />
          ))}
        </nav>
      </div>

      {open && (
        <div className="animate-fade-in border-t border-gray-100 bg-white lg:hidden">
          <div className="page-shell grid gap-2 py-4">
            <div className="grid gap-2">
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="focus-ring rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700"
              >
                Back to Main Site
              </Link>
              <Link
                to="/admin/login"
                onClick={() => setOpen(false)}
                className="focus-ring rounded-lg border border-gray-900 bg-gray-900 px-3 py-2 text-sm font-medium text-white"
              >
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}