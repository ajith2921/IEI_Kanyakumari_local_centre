import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";

const campaigns = [
  {
    title: "Engineering Excellence Since 1920",
    subtitle:
      "A dedicated membership website for applications, certification pathways, publications, and CPD growth.",
    primaryTo: "/membership#apply-membership",
    primaryLabel: "Apply Now",
    secondaryTo: "/membership/member-services",
    secondaryLabel: "Member Services",
  },
  {
    title: "Certification and Career Advancement",
    subtitle:
      "Move through Chartered Engineer, Professional Engineer, and Section A and B pathways with structured support.",
    primaryTo: "/membership/certification",
    primaryLabel: "Open Certification",
    secondaryTo: "/membership#chartered-engineer",
    secondaryLabel: "View CEng",
  },
  {
    title: "Publications, Events, and CPD",
    subtitle:
      "Stay active through monthly events, publication services, and professional development programs.",
    primaryTo: "/membership/events-cpd",
    primaryLabel: "Explore Events",
    secondaryTo: "/membership/publications",
    secondaryLabel: "View Publications",
  },
];

export default function MembershipHeroCampaign() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % campaigns.length);
    }, 5500);

    return () => clearInterval(timer);
  }, []);

  const active = campaigns[activeIndex];

  return (
    <section className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_42%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_45%)]" />
      <div className="relative p-6 md:p-8">
        <p className="eyebrow-chip">Membership Website Home</p>
        <div key={active.title} className="animate-fade-up">
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-gray-900 md:text-3xl">{active.title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-600 md:text-base">{active.subtitle}</p>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button as={Link} to={active.primaryTo}>
            {active.primaryLabel}
          </Button>
          <Button as={Link} to={active.secondaryTo} variant="secondary">
            {active.secondaryLabel}
          </Button>
        </div>

        <div className="mt-6 flex gap-2">
          {campaigns.map((item, index) => (
            <button
              key={item.title}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`focus-ring h-1.5 rounded-full transition-all duration-200 ${
                index === activeIndex ? "w-9 bg-gray-900" : "w-3 bg-gray-300"
              }`}
              aria-label={`Show campaign ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
