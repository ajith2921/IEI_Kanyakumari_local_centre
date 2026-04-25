import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";

const campaigns = [
  {
    badge: "Premium Membership Portal",
    title: "Engineering Excellence Since 1920",
    subtitle:
      "A dedicated membership website for applications, certification pathways, publications, and CPD growth.",
    primaryTo: "/membership/become-member",
    primaryLabel: "Apply Now",
    secondaryTo: "/membership/member-services",
    secondaryLabel: "Member Services",
  },
  {
    badge: "Certification Acceleration",
    title: "Certification and Career Advancement",
    subtitle:
      "Move through Chartered Engineer, Professional Engineer, and Section A & B pathways with structured support.",
    primaryTo: "/membership/certification",
    primaryLabel: "Open Certification",
    secondaryTo: "/membership/certification#chartered-engineer",
    secondaryLabel: "View CEng",
  },
  {
    badge: "Growth and Visibility",
    title: "Publications, Events, and CPD",
    subtitle:
      "Stay active through monthly events, publication services, and professional development programs.",
    primaryTo: "/membership/events-cpd",
    primaryLabel: "Explore Events",
    secondaryTo: "/membership/publications",
    secondaryLabel: "View Publications",
  },
];

const trustPoints = [
  "Guided onboarding with approval-aware member access",
  "Premium-ready CPD, analytics, and subscription lifecycle",
  "Integrated pathways for certification, events, and publications",
];

const trustBadges = [
  { label: "Est. 1920", icon: "🏛️" },
  { label: "100+ Centres", icon: "🌐" },
  { label: "CEng & PEng", icon: "🎓" },
  { label: "IEI-Springer", icon: "📚" },
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
    <section className="relative overflow-hidden rounded-3xl border border-[#0b3a67]/25 bg-[linear-gradient(135deg,#071f3d_0%,#0b3a67_45%,#0f4f8a_80%,#1a6bad_100%)] text-white shadow-[0_24px_60px_-30px_rgba(11,58,103,0.9)]">
      {/* Layered radial glows */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_12%,rgba(244,196,48,0.28),transparent_38%),radial-gradient(circle_at_90%_85%,rgba(122,166,214,0.3),transparent_42%),radial-gradient(circle_at_55%_0%,rgba(255,255,255,0.06),transparent_30%)]" />
      {/* Subtle grid texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(to right,#fff 1px,transparent 1px),linear-gradient(to bottom,#fff 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

      <div className="relative grid gap-6 p-6 md:p-9 lg:grid-cols-[1.25fr,0.75fr] lg:items-start">
        {/* Left: headline & CTAs */}
        <div>
          <span className="premium-chip !border-[#f4c430]/65 !bg-[#f4c430]/18 !text-[#f4c430]">
            {active.badge}
          </span>

          <div key={active.title} className="animate-fade-up">
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-[2.6rem] md:leading-[1.1]">
              {active.title}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#c8dcf5] md:text-[0.95rem]">
              {active.subtitle}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              as={Link}
              to={active.primaryTo}
              className="!h-11 !bg-[#f4c430] !px-6 !text-[#0b3a67] !font-bold hover:!bg-[#ffd34d] hover:!shadow-[0_6px_18px_-4px_rgba(244,196,48,0.55)]"
            >
              {active.primaryLabel}
            </Button>
            <Button
              as={Link}
              to={active.secondaryTo}
              variant="secondary"
              className="!h-11 !border-white/30 !bg-white/10 !text-white hover:!bg-white/20"
            >
              {active.secondaryLabel}
            </Button>
          </div>

          {/* Slide dots */}
          <div className="mt-6 flex gap-2">
            {campaigns.map((item, index) => (
              <button
                key={item.title}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`focus-ring h-1.5 rounded-full transition-all duration-300 ${
                  index === activeIndex ? "w-10 bg-[#f4c430]" : "w-3 bg-white/30 hover:bg-white/50"
                }`}
                aria-label={`Show campaign ${index + 1}`}
              />
            ))}
          </div>

          {/* Trust badge row */}
          <div className="mt-6 flex flex-wrap gap-2">
            {trustBadges.map((badge) => (
              <span
                key={badge.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold text-[#d8ecff] backdrop-blur-sm"
              >
                <span>{badge.icon}</span>
                {badge.label}
              </span>
            ))}
          </div>
        </div>

        {/* Right: trust card */}
        <aside className="rounded-2xl border border-white/18 bg-white/8 p-5 backdrop-blur-sm">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#f4c430]">Why This Portal</p>
          <ul className="mt-3 space-y-3 text-sm text-[#ddeeff]">
            {trustPoints.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="mt-0.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[#f4c430]/22 text-[#f4c430]">
                  <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3" aria-hidden="true">
                    <path d="M5 10.5L8.2 13.5L15 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 rounded-xl border border-[#f4c430]/30 bg-[#f4c430]/10 p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#f4c430]">Premium Readiness</p>
            <p className="mt-1.5 text-[0.8rem] leading-relaxed text-[#fff6cc]">
              Checkout-ready subscription, invoice, and entitlement flow is integrated for authenticated members.
            </p>
          </div>
          <div className="mt-4 rounded-xl border border-white/12 bg-white/8 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#a8c8f0]">Payment & Security</p>
            <p className="mt-1 text-[0.78rem] text-[#c5dff5]">
              Payments are processed securely. Premium access activates only after verified webhook confirmation.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
