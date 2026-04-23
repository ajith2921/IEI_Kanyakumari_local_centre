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
    to: "/membership#chartered-engineer",
    cta: "View CEng",
  },
  {
    title: "Professional Engineer Certification",
    detail: "Review PEng-aligned progression for advanced engineering assignments.",
    to: "/membership#professional-engineer",
    cta: "View PEng",
  },
  {
    title: "Section A and B Examination",
    detail: "Use exam support routes for forms, cards, and result tracking.",
    to: "/membership#section-ab",
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
    <section className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow-chip">Membership Service Desk</p>
          <h3 className="mt-2 text-xl font-semibold text-gray-900">Primary Membership Services</h3>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {serviceCards.map((item) => (
          <Link
            key={item.title}
            to={item.to}
            className="focus-ring group rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:bg-white hover:shadow-sm"
          >
            <h4 className="text-sm font-semibold text-gray-900">{item.title}</h4>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">{item.detail}</p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.1em] text-gray-400 transition-colors group-hover:text-gray-900">
              {item.cta}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
