import { Link } from "react-router-dom";
import SectionHeader from "../../components/SectionHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const membershipBenefits = [
  {
    text: "Chartered Engineer (CEng) pathway for design, report, and valuation certification authority",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    text: "Professional Engineer (PEng) recognition for advanced competency and technical approvals",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    text: "Independent consultancy practice readiness for civil, mechanical, and electrical domains",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    text: "Support for government approvals, bank loan project validation, and insurance assessments",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="1.8" />
        <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    text: "Engineering arbitration and technical expert-opinion role pathways",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 1v22M17 5H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 110 7H6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    text: "IEI-Springer journals, technical publications, reports, and library network access",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    text: "National and international conferences, workshops, seminars, and CPD programs",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    text: "Networking through 100+ centres, local chapter ecosystems, and ENGGtalks",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="5" cy="19" r="2" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="19" cy="19" r="2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 7v4m0 0l-5.5 6M12 11l5.5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    text: "Career Manager portfolio support, R&D grant pathways, and guest house concessions",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const premiumPlanCoverage = [
  "CEng-focused certification support for technical drawings, structural design, and project reports",
  "PEng-level professional competency recognition for infrastructure and approval-centric work",
  "Consultancy and valuation practice alignment for govt, bank, and insurance-facing engagements",
  "Legal and technical authority pathways including arbitration and expert-opinion assignments",
  "Deep resource stack: IEI-Springer journals, technical libraries, and premium reports",
  "Continuous learning through CPD, workshops, seminars, and discounted conferences",
  "Professional visibility via Career Manager, ENGGtalks, local centre networking, and R&D grants",
  "Operational benefits including guest house concessions for travel and conference participation",
];

const journeyStages = [
  {
    stage: "Join",
    description: "Apply, get verified, and activate your IEI membership profile.",
    color: "bg-gray-100 text-gray-600 border-gray-200",
    dot: "bg-gray-400",
  },
  {
    stage: "Engage",
    description: "Attend CPD sessions, access journals, and participate in chapter events.",
    color: "bg-[#edf4ff] text-[#0b3a67] border-[#c2d9f5]",
    dot: "bg-[#0b3a67]",
  },
  {
    stage: "Lead",
    description: "Hold office, mentor peers, pursue CEng/FIE and expert-opinion roles.",
    color: "bg-[#fffbeb] text-[#a07200] border-[#f4c430]/40",
    dot: "bg-[#f4c430]",
  },
];

function BenefitItem({ text, icon }) {
  return (
    <div className="flex items-start rounded-xl border border-[#d3deeb] bg-[#f5f9ff] px-3 py-2.5 gap-3">
      <span className="mt-0.5 inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#0b3a67]/10 text-[#0b3a67]">
        {icon}
      </span>
      <p className="text-sm font-medium text-gray-700">{text}</p>
    </div>
  );
}

export default function MembershipBenefitsPage() {
  return (
    <section className="page-shell section-block">
      <SectionHeader
        eyebrow="Membership"
        title="Member Benefits"
        description="Complete overview of institutional value, professional pathways, and premium-ready outcomes."
      />

      <Card id="membership-info" className="premium-panel p-6" padded={false}>
        <h3 className="text-xl font-medium text-gray-900">Benefits of Corporate Membership</h3>
        <p className="mt-1.5 text-sm text-gray-500">
          Structured services supporting engineering practice, learning, and long-term career growth.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {membershipBenefits.map((benefit) => (
            <BenefitItem key={benefit.text} text={benefit.text} icon={benefit.icon} />
          ))}
        </div>
      </Card>

      {/* Member Journey Timeline */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900">Your Member Journey</h3>
        <p className="mt-1 text-sm text-gray-500">Three stages of professional growth through IEI membership.</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-stretch">
          {journeyStages.map((stage, index) => (
            <div key={stage.stage} className="flex flex-1 items-center gap-3">
              <div className={`flex-1 rounded-2xl border px-5 py-4 ${stage.color}`}>
                <div className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${stage.dot}`} />
                  <span className="text-base font-bold">{stage.stage}</span>
                </div>
                <p className="mt-2 text-xs leading-relaxed opacity-80">{stage.description}</p>
              </div>
              {index < journeyStages.length - 1 && (
                <svg className="hidden h-5 w-5 flex-shrink-0 text-gray-300 sm:block" viewBox="0 0 20 20" fill="none">
                  <path d="M7 4l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>

      <Card
        as="section"
        className="mt-6 overflow-hidden border border-[#0b3a67]/25 bg-[linear-gradient(140deg,#0b3a67_0%,#0f4479_58%,#175994_100%)] p-6 text-white"
        padded={false}
      >
        <p className="premium-chip !border-[#f4c430]/60 !bg-[#f4c430]/20 !text-[#f4c430]">Premium Focus</p>
        <h3 className="mt-3 text-xl font-medium text-white">Recommended Premium Plan Coverage</h3>
        <p className="mt-1.5 text-sm text-[#d7e6f8]">
          Premium Chartered Professional is structured to satisfy professional-authority and career-growth goals.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-[#e9f2ff]">
          {premiumPlanCoverage.map((item) => (
            <li key={item} className="rounded-lg border border-white/20 bg-white/10 px-3 py-2">
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button as={Link} to="/membership/member-services" className="!bg-[#f4c430] !text-[#0b3a67] hover:!bg-[#ffd34d]">
            Open Member Services
          </Button>
          <Button as={Link} to="/membership/grades" variant="secondary" className="!border-white/35 !bg-white/10 !text-white hover:!bg-white/20">
            View Membership Grades
          </Button>
        </div>
      </Card>
    </section>
  );
}
