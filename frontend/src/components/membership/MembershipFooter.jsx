import { Link } from "react-router-dom";

const membershipQuickLinks = [
  { to: "/membership/become-member", label: "Become a Member" },
  { to: "/membership/benefits", label: "Membership Benefits" },
  { to: "/membership/certification#chartered-engineer", label: "Chartered Engineer" },
  { to: "/membership/certification#professional-engineer", label: "Professional Engineer" },
  { to: "/membership/certification#section-ab", label: "Section A & B" },
  { to: "/membership/publications", label: "Publications" },
  { to: "/membership/events-cpd", label: "Events & CPD" },
];

export default function MembershipFooter() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="page-shell grid gap-8 py-12 md:grid-cols-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">Membership Portal</p>
          <p className="mt-2 text-lg font-semibold text-gray-900">IEI Kanyakumari Local Centre</p>
          <p className="mt-3 text-sm leading-relaxed text-gray-500">
            Dedicated membership website for application, certification pathways, publication access,
            and authenticated member services.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to="/"
              className="focus-ring rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900"
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

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">Membership Services</p>
          <div className="mt-3 grid gap-2 text-sm text-gray-500">
            {membershipQuickLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="focus-ring w-fit rounded-md px-1 py-0.5 transition-colors hover:text-gray-900"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">Support</p>
          <div className="mt-3 space-y-2 text-sm text-gray-500">
            <p>Nagercoil, Kanyakumari District, Tamil Nadu</p>
            <a href="mailto:ieikanyakumarilc@gmail.com" className="block transition-colors hover:text-gray-900">
              ieikanyakumarilc@gmail.com
            </a>
            <a href="tel:+919443993659" className="block transition-colors hover:text-gray-900">
              +91-9443993659
            </a>
            <p>Mon–Sat: 10:00 AM – 5:30 PM</p>
          </div>
          <div className="mt-4 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs text-gray-500">
            <p className="font-semibold text-gray-700">Response SLA</p>
            <p className="mt-1">Membership queries responded within 2 working days. Premium billing issues resolved within 1 working day.</p>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200">
        <div className="page-shell flex flex-col gap-2 py-4 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between">
          <p>IEI Membership Portal – Kanyakumari Local Centre</p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1">
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-3 w-3" aria-hidden="true">
                <path d="M8 1a5 5 0 0 0-5 5v1H2a1 1 0 0 0-1 1v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8a1 1 0 0 0-1-1h-1V6a5 5 0 0 0-5-5Zm3.5 6H4.5V6a3.5 3.5 0 1 1 7 0v1ZM6.25 10a.75.75 0 0 1 .75-.75h2a.75.75 0 0 1 0 1.5h-2A.75.75 0 0 1 6.25 10Z" />
              </svg>
              Payments Secure
            </span>
            <span>·</span>
            <span>Engineering Excellence Since 1920</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
