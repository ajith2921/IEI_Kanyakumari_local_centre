import { Link } from "react-router-dom";

const serviceCards = [
  {
    title: "Become a Member",
    detail: "Start your onboarding and submit membership application details.",
    to: "/membership/become-member",
    cta: "Know More",
  },
  {
    title: "Chartered Engineer Certification",
    detail: "Access CEng pathway details for technical authority-focused roles.",
    to: "/membership/certification#chartered-engineer",
    cta: "View CEng",
  },
  {
    title: "Professional Engineer Certification",
    detail: "Review PEng-aligned progression for advanced engineering assignments.",
    to: "/membership/certification#professional-engineer",
    cta: "View PEng",
  },
  {
    title: "Section A and B Examination",
    detail: "Use exam support routes for forms, cards, and result tracking.",
    to: "/membership/certification#section-ab",
    cta: "Open Track",
  },
  {
    title: "Journal and Publications",
    detail: "Browse publication services and submission-oriented channels.",
    to: "/membership/publications",
    cta: "View All",
  },
  {
    title: "Events and CPD",
    detail: "Explore monthly technical events, workshops, and CPD programs.",
    to: "/membership/events-cpd",
    cta: "Explore",
  },
];

export default function MembershipServiceDesk() {
  return (
    <section className="premium-panel rounded-2xl p-6">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="premium-chip">Membership Service Desk</p>
          <h3 className="mt-2 text-xl font-semibold text-[#0f2f52]">Primary Membership Services</h3>
          <p className="mt-1.5 text-sm text-[#48627d]">
            Core pathways designed for onboarding, certification, growth, and premium engagement.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {serviceCards.map((item, index) => (
          <Link
            key={item.title}
            to={item.to}
            className="focus-ring group relative overflow-hidden rounded-2xl border border-[#d8e1ed] bg-white p-4 shadow-[0_10px_22px_-18px_rgba(11,58,103,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#b8c9dd] hover:shadow-[0_14px_28px_-18px_rgba(11,58,103,0.75)]"
          >
            <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 rounded-bl-[1.75rem] bg-[radial-gradient(circle_at_top_right,rgba(244,196,48,0.28),transparent_68%)]" />
            <span className="inline-flex rounded-md border border-[#cddaea] bg-[#f2f7ff] px-2 py-0.5 text-xs font-semibold text-[#0b3a67]">
              Module {index + 1}
            </span>
            <h4 className="mt-3 text-sm font-semibold text-[#132f4f]">{item.title}</h4>
            <p className="mt-2 text-sm leading-relaxed text-[#556d85]">{item.detail}</p>
            <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.1em] text-[#0b3a67] transition-colors group-hover:text-[#082947]">
              <span>{item.cta}</span>
              <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                <path
                  d="M3 8H13M13 8L9.5 4.5M13 8L9.5 11.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </p>
          </Link>
        ))}
      </div>

      {/* Trust cue strip */}
      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl border border-[#d9e2ef] bg-[#f5f9ff] px-4 py-3">
        <span className="flex items-center gap-1.5 text-xs font-medium text-[#47607a]">
          <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 text-[#0b3a67]" aria-hidden="true">
            <path fillRule="evenodd" d="M8 1a.75.75 0 0 1 .53.22l6.25 6.25a.75.75 0 0 1 0 1.06L8.53 14.78a.75.75 0 0 1-1.06 0L1.22 8.53a.75.75 0 0 1 0-1.06L7.47 1.22A.75.75 0 0 1 8 1Zm0 1.81L2.56 8l.44.44V11a.75.75 0 0 0 1.5 0V9.25h1.25a.75.75 0 0 0 0-1.5H4.5v-.44L8 2.81ZM8 5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 8 5Zm0 4.5a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Z" clipRule="evenodd" />
          </svg>
          Chapter-verified services
        </span>
        <span className="flex items-center gap-1.5 text-xs font-medium text-[#47607a]">
          <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 text-[#0b3a67]" aria-hidden="true">
            <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0ZM7.25 4a.75.75 0 0 1 1.5 0v4.25l2.5 1.44a.75.75 0 0 1-.75 1.3l-2.75-1.59A.75.75 0 0 1 7.25 8.75V4Z" />
          </svg>
          Response within 2 working days
        </span>
        <span className="flex items-center gap-1.5 text-xs font-medium text-[#47607a]">
          <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 text-[#0b3a67]" aria-hidden="true">
            <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
            <path fillRule="evenodd" d="M1.38 8a6.62 6.62 0 1 1 13.24 0A6.62 6.62 0 0 1 1.38 8ZM8 3a5.12 5.12 0 1 0 0 10.24A5.12 5.12 0 0 0 8 3Z" clipRule="evenodd" />
          </svg>
          IEI National Body governed
        </span>
      </div>
    </section>
  );
}
