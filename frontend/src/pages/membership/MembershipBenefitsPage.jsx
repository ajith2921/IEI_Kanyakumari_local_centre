import { Link } from "react-router-dom";
import SectionHeader from "../../components/SectionHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const membershipBenefits = [
  "Chartered Engineer (CEng) pathway for design, report, and valuation certification authority",
  "Professional Engineer (PEng) recognition for advanced competency and technical approvals",
  "Independent consultancy practice readiness for civil, mechanical, and electrical domains",
  "Support for government approvals, bank loan project validation, and insurance assessments",
  "Engineering arbitration and technical expert-opinion role pathways",
  "IEI-Springer journals, technical publications, reports, and library network access",
  "National and international conferences, workshops, seminars, and CPD programs",
  "Networking through 100+ centres, local chapter ecosystems, and ENGGtalks",
  "Career Manager portfolio support, R&D grant pathways, and guest house concessions",
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

function BenefitItem({ text }) {
  return (
    <div className="flex items-start rounded-xl border border-[#d3deeb] bg-[#f5f9ff] px-3 py-2.5">
      <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#0b3a67]/10 text-[#0b3a67]">
        <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
          <path d="M5 10.5L8.2 13.5L15 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <p className="ml-3 text-sm font-medium text-gray-700">{text}</p>
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
            <BenefitItem key={benefit} text={benefit} />
          ))}
        </div>
      </Card>

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
