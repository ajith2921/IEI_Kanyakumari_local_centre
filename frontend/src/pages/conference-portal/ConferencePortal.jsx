import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { publicApi } from "../../services/api";
import LoadingSpinner from "../../components/LoadingSpinner";

const PRIMARY_LINKS = [
  { to: "/conference-portal", label: "Home", exact: true },
  { to: "/conference-portal/about", label: "About" },
  { to: "/conference-portal/dates", label: "Important Dates" },
  { to: "/conference-portal/call-for-papers", label: "Call for Papers" },
  { to: "/conference-portal/speakers", label: "Speakers" },
  { to: "/conference-portal/program", label: "Program Schedule" },
  { to: "/conference-portal/registration", label: "Registration" },
];

const MORE_LINKS = [
  { to: "/conference-portal/committees", label: "Committees" },
  { to: "/conference-portal/venue", label: "Venue" },
  { to: "/conference-portal/sponsors", label: "Sponsors" },
  { to: "/conference-portal/submission", label: "Paper Submission" },
  { to: "/conference-portal/gallery", label: "Gallery" },
  { to: "/conference-portal/downloads", label: "Downloads" },
  { to: "/conference-portal/faq", label: "FAQ" },
  { to: "/conference-portal/contact", label: "Contact Us" },
];

export default function ConferencePortal() {
  const [activeConference, setActiveConference] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    let mounted = true;
    const fetchActive = async () => {
      try {
        const res = await publicApi.getActiveConference();
        if (mounted) {
          setActiveConference(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch active conference:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchActive();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <div className="flex flex-1 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!activeConference) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50">
        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">No Active Conference</h1>
          <p className="text-gray-500">There are currently no active conferences scheduled.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* Conference Portal Main Navbar - Full Width Design */}
      <div className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#061412]/95 backdrop-blur-xl shadow-2xl shadow-emerald-900/10 transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col py-3 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
            <div className="mb-3 flex items-center gap-3 lg:mb-0 shrink-0">
              {activeConference.image_url && (
                <img 
                  src={activeConference.image_url} 
                  alt="Conference Logo" 
                  className="h-10 w-10 rounded-lg object-cover bg-white/5 p-0.5 ring-1 ring-white/20" 
                />
              )}
              <div>
                <h2 className="text-base font-bold leading-tight tracking-wide text-white">
                  {activeConference.short_title || activeConference.title}
                </h2>
                <p className="text-[11px] font-bold tracking-widest text-emerald-400/90 uppercase mt-0.5">
                  {activeConference.start_date} • {activeConference.venue}
                </p>
              </div>
            </div>

            {/* Desktop Navigation - No Scroll */}
            <nav className="hidden lg:block flex-1 w-full max-w-full">
              <ul className="flex items-center justify-end gap-1">
                {PRIMARY_LINKS.map((link) => (
                  <li key={link.to} className="shrink-0">
                    <NavLink
                      to={link.to}
                      end={link.exact}
                      className={({ isActive }) =>
                        `inline-block rounded-full px-3 py-1.5 text-[13px] font-semibold tracking-wide transition-all duration-300 ${
                          isActive
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 ring-1 ring-emerald-400/50"
                            : "text-slate-300 hover:bg-white/10 hover:text-white"
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                  </li>
                ))}
                
                {/* More Dropdown */}
                <li className="relative group shrink-0 ml-1">
                  <button className="inline-flex items-center rounded-full px-3 py-1.5 text-[13px] font-semibold tracking-wide transition-all duration-300 text-slate-300 hover:bg-white/10 hover:text-white">
                    More
                    <svg className="ml-1 w-3.5 h-3.5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-48 rounded-xl border border-white/10 bg-[#061412]/95 backdrop-blur-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right scale-95 group-hover:scale-100">
                    <div className="py-2 flex flex-col">
                      {MORE_LINKS.map(link => (
                        <NavLink 
                          key={link.to} 
                          to={link.to} 
                          end={link.exact} 
                          className={({isActive}) => `px-4 py-2 text-[13px] font-medium transition-colors ${isActive ? "bg-emerald-500/20 text-emerald-400" : "text-slate-300 hover:bg-white/10 hover:text-white"}`}
                        >
                          {link.label}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                </li>
              </ul>
            </nav>

            {/* Mobile Navigation - Scrollable fallback */}
            <div className="lg:hidden relative -mx-4 px-4 overflow-hidden">
              <nav className="no-scrollbar flex overflow-x-auto pb-2">
                <ul className="flex items-center gap-1">
                  {[...PRIMARY_LINKS, ...MORE_LINKS].map((link) => (
                    <li key={link.to} className="shrink-0">
                      <NavLink
                        to={link.to}
                        end={link.exact}
                        className={({ isActive }) =>
                          `inline-block rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all duration-300 ${
                            isActive
                              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 ring-1 ring-emerald-400/50"
                              : "text-slate-300 hover:bg-white/10 hover:text-white"
                          }`
                        }
                      >
                        {link.label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Portal Content Area */}
      <main className="flex-1">
        {/* Pass conference context to all child routes */}
        <Outlet context={{ conference: activeConference }} />
      </main>

      <Footer />
    </div>
  );
}
