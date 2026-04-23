import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

const portalLinks = [
  { to: "/membership", label: "Home" },
  { to: "/membership/become-member", label: "Become Member" },
  { to: "/membership/certification", label: "Certification" },
  { to: "/membership/publications", label: "Publications" },
  { to: "/membership/events-cpd", label: "Events & CPD" },
  { to: "/membership/member-services", label: "Member Services" },
];

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

function isMembershipHomeRoute(pathname = "") {
  return pathname === "/membership" || pathname === "/membership/";
}

function resolveInitialSectionHash(hash = "") {
  const hasMatch = membershipLinks.some((item) => item.hash === hash);
  return hasMatch ? hash : "#be-member";
}

const scrollSpySectionLinks = membershipLinks.filter((item) => item.hash !== "#auth-panel");

function DesktopPortalNavItem({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      end={to === "/membership"}
      onClick={onClick}
      className={({ isActive }) =>
        `relative rounded-lg px-3 py-2 text-[13px] transition-colors duration-200 ${
          isActive
            ? "font-semibold text-[#0b2d57]"
            : "font-normal text-[#466486] hover:text-[#0b2d57]"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {label}
          {isActive && (
            <span className="absolute -bottom-[11px] left-1/2 h-[2px] w-4 -translate-x-1/2 rounded-full bg-[#0b2d57]" />
          )}
        </>
      )}
    </NavLink>
  );
}

function MobilePortalNavItem({ to, label, onClick }) {
  return (
    <NavLink
      to={to}
      end={to === "/membership"}
      onClick={onClick}
      className={({ isActive }) =>
        `focus-ring rounded-xl border px-3.5 py-2.5 text-sm transition-colors duration-200 ${
          isActive
            ? "border-[#0b2d57] bg-[#eef4fb] font-semibold text-[#0b2d57]"
            : "border-[#d3e0ee] bg-white text-[#496888] hover:border-[#abc1d8] hover:bg-[#f4f9ff]"
        }`
      }
    >
      {label}
    </NavLink>
  );
}

function SectionMenuLink({ hash, label, onClick, isActive, mobile = false }) {
  return (
    <Link
      to={`/membership${hash}`}
      onClick={onClick}
      aria-current={isActive ? "location" : undefined}
      className={`focus-ring transition-colors duration-200 ${
        mobile
          ? "rounded-xl border px-3.5 py-2.5 text-sm"
          : "block rounded-lg px-3 py-2 text-[13px]"
      } ${
        isActive
          ? "border-[#0b2d57] bg-[#eef4fb] font-semibold text-[#0b2d57]"
          : "border-[#d3e0ee] bg-white text-[#496888] hover:border-[#abc1d8] hover:bg-[#f4f9ff] hover:text-[#0b2d57]"
      }`}
    >
      {label}
    </Link>
  );
}

export default function MembershipNavbar() {
  const [open, setOpen] = useState(false);
  const [sectionsOpen, setSectionsOpen] = useState(false);
  const [activeSectionHash, setActiveSectionHash] = useState("#be-member");
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef(null);
  const sectionMenuRef = useRef(null);
  const initialHashLockRef = useRef("");
  const initialHashScrollYRef = useRef(0);
  const location = useLocation();
  const isMembershipHome = isMembershipHomeRoute(location.pathname);

  useEffect(() => {
    setOpen(false);
    setSectionsOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!isMembershipHome) {
      initialHashLockRef.current = "";
      initialHashScrollYRef.current = 0;
      return;
    }

    initialHashLockRef.current = resolveInitialSectionHash(location.hash);
    initialHashScrollYRef.current = typeof window !== "undefined" ? window.scrollY : 0;
    setActiveSectionHash(resolveInitialSectionHash(location.hash));
  }, [isMembershipHome, location.hash]);

  useEffect(() => {
    if (!isMembershipHome || typeof window === "undefined") {
      return;
    }

    // Keep explicit sign-in focus untouched when hash targets auth panel.
    if (location.hash === "#auth-panel") {
      return;
    }

    const sectionIds = scrollSpySectionLinks.map((item) => item.hash.slice(1));
    const hasExplicitKnownHash = membershipLinks.some((item) => item.hash === location.hash);

    const updateActiveFromScroll = () => {
      const topOffset = (headerRef.current?.getBoundingClientRect().height ?? 170) + 18;

      if (hasExplicitKnownHash && initialHashLockRef.current) {
        const stayedNearInitialAnchor =
          Math.abs(window.scrollY - initialHashScrollYRef.current) <= 10;

        if (stayedNearInitialAnchor) {
          setActiveSectionHash((previous) =>
            previous === initialHashLockRef.current ? previous : initialHashLockRef.current,
          );
          return;
        }

        initialHashLockRef.current = "";
      }

      if (location.hash === "#auth-panel") {
        setActiveSectionHash((previous) =>
          previous === location.hash ? previous : location.hash,
        );
        return;
      }

      let current = "#be-member";
      let closestDistance = Number.POSITIVE_INFINITY;

      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (!element) continue;

        const { top } = element.getBoundingClientRect();
        const distance = Math.abs(top - topOffset);
        if (distance < closestDistance) {
          closestDistance = distance;
          current = `#${id}`;
        }
      }

      setActiveSectionHash((previous) => (previous === current ? previous : current));

      if ((!hasExplicitKnownHash || window.scrollY > 24) && window.location.hash !== current) {
        window.history.replaceState({}, "", `/membership${current}`);
      }
    };

    updateActiveFromScroll();
    window.addEventListener("scroll", updateActiveFromScroll, { passive: true });
    window.addEventListener("resize", updateActiveFromScroll);

    return () => {
      window.removeEventListener("scroll", updateActiveFromScroll);
      window.removeEventListener("resize", updateActiveFromScroll);
    };
  }, [isMembershipHome, location.hash]);

  useEffect(() => {
    if (!isMembershipHome || typeof window === "undefined") {
      return;
    }

    const closeSectionMenuOnOutsideClick = (event) => {
      if (!sectionsOpen) {
        return;
      }

      if (sectionMenuRef.current && !sectionMenuRef.current.contains(event.target)) {
        setSectionsOpen(false);
      }
    };

    document.addEventListener("mousedown", closeSectionMenuOnOutsideClick);

    return () => {
      document.removeEventListener("mousedown", closeSectionMenuOnOutsideClick);
    };
  }, [isMembershipHome, sectionsOpen]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if ((!open && !sectionsOpen) || typeof window === "undefined") {
      return;
    }

    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        setSectionsOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open, sectionsOpen]);

  return (
    <header ref={headerRef} className={`relative sticky top-0 z-50 border-b bg-white/95 backdrop-blur transition-all duration-200 ${
      scrolled ? "border-transparent nav-scrolled" : "border-[#d6e2ef]"
    }`}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-[#ca7f00] via-[#0b2d57] to-[#1f7ab5]" />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-gray-900 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to main content
      </a>

      <div className="page-shell flex items-center justify-between py-2.5 sm:py-3">
        <Link to="/membership" className="flex min-w-0 items-center gap-3 leading-tight">
          <div className="h-12 w-12 overflow-hidden rounded-full border border-[#c7d6e8] bg-white p-1 sm:h-14 sm:w-14">
            <img
              src="https://alchetron.com/cdn/institution-of-engineers-india-9cb687ed-c30b-4f38-81f5-344346463d2-resize-750.png"
              alt="Institution of Engineers (India) logo"
              className="h-full w-full object-contain"
              loading="eager"
              decoding="async"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold tracking-tight text-[#0b2d57] sm:text-[15px]">IEI Kanyakumari Local Centre</span>
            <span className="mt-1 inline-flex w-[172px] overflow-hidden rounded-full border border-[#d5e3f2] bg-[#f6faff] px-2 py-[2px] text-[10px] font-semibold uppercase tracking-[0.1em] text-[#5f7695] sm:w-[188px]">
              Membership Website
            </span>
          </span>
        </Link>

        <button
          type="button"
          aria-controls="membership-mobile-menu"
          aria-expanded={open}
          aria-label={open ? "Close membership navigation menu" : "Open membership navigation menu"}
          className="focus-ring h-11 rounded-lg border border-[#c7d6e8] bg-white px-4 text-[13px] font-medium text-[#35587f] transition-colors duration-200 hover:bg-[#f5f9fe] lg:hidden"
          onClick={() => setOpen((prev) => !prev)}
        >
          {open ? "Close" : "Menu"}
        </button>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Membership pages">
          {portalLinks.map((item) => (
            <DesktopPortalNavItem key={item.to} to={item.to} label={item.label} />
          ))}

          {isMembershipHome && (
            <div ref={sectionMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setSectionsOpen((previous) => !previous)}
                className={`focus-ring inline-flex h-11 items-center gap-1 rounded-lg px-3.5 text-[13px] transition-colors duration-200 ${
                  sectionsOpen
                    ? "font-semibold text-[#0b2d57]"
                    : "font-normal text-[#466486] hover:text-[#0b2d57]"
                }`}
              >
                Sections
                <svg
                  className={`h-3 w-3 transition-transform duration-200 ${sectionsOpen ? "rotate-180" : ""}`}
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {sectionsOpen && (
                <div className="absolute right-0 top-full z-50 mt-3 min-w-[220px] rounded-xl border border-[#d2e0ef] bg-white p-1 shadow-lg animate-fade-in">
                  {membershipLinks.map((item) => (
                    <SectionMenuLink
                      key={`desktop-${item.hash}`}
                      hash={item.hash}
                      label={item.label}
                      isActive={activeSectionHash === item.hash}
                      onClick={() => setSectionsOpen(false)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="ml-2.5 flex h-11 items-center gap-2 border-l border-[#d9e4f1] pl-3">
            <Link
              to="/membership#auth-panel"
              className="focus-ring rounded-lg border border-[#0b2d57] bg-gradient-to-r from-[#0b2d57] to-[#14508e] px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-white transition-all duration-200 hover:brightness-110"
            >
              Sign In
            </Link>
            <Link
              to="/"
              className="focus-ring rounded-lg border border-[#c7d6e8] bg-[#f8fbff] px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#3c5f86] transition-colors hover:border-[#96b0cd] hover:text-[#0b2d57]"
            >
              Main Site
            </Link>
            <Link
              to="/admin/login"
              className="focus-ring rounded-lg border border-[#c7d6e8] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#3c5f86] transition-colors hover:border-[#96b0cd] hover:text-[#0b2d57]"
            >
              Admin
            </Link>
          </div>
        </nav>
      </div>

      {open && (
        <div id="membership-mobile-menu" className="animate-fade-in border-t border-[#dde8f4] bg-[linear-gradient(180deg,#ffffff_0%,#f7fbff_100%)] lg:hidden">
          <div className="page-shell grid gap-1 py-4">
            <div className="grid gap-2">
              {portalLinks.map((item) => (
                <MobilePortalNavItem
                  key={`${item.to}-mobile`}
                  to={item.to}
                  label={item.label}
                  onClick={() => setOpen(false)}
                />
              ))}
            </div>

            {isMembershipHome && (
              <div className="grid gap-2 pt-4">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#6f87a5]">Sections</p>
                <div className="grid gap-2">
                  {membershipLinks.map((item) => (
                    <SectionMenuLink
                      key={`${item.hash}-mobile`}
                      hash={item.hash}
                      label={item.label}
                      isActive={activeSectionHash === item.hash}
                      onClick={() => setOpen(false)}
                      mobile
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 grid gap-2.5">
              <Link
                to="/membership#auth-panel"
                onClick={() => setOpen(false)}
                className="focus-ring rounded-lg border border-[#0b2d57] bg-gradient-to-r from-[#0b2d57] to-[#14508e] px-3 py-2 text-sm font-medium text-white"
              >
                Member Sign In
              </Link>
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="focus-ring rounded-lg border border-[#c7d6e8] bg-white px-3 py-2 text-sm font-medium text-[#35577f]"
              >
                Back to Main Site
              </Link>
              <Link
                to="/admin/login"
                onClick={() => setOpen(false)}
                className="focus-ring rounded-lg border border-[#0b2d57] bg-gradient-to-r from-[#0b2d57] to-[#14508e] px-3 py-2 text-sm font-medium text-white"
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