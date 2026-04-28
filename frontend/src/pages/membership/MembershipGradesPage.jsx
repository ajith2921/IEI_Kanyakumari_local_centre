import { Link } from "react-router-dom";
import SectionHeader from "../../components/SectionHeader";
import Button from "../../components/ui/Button";

const membershipTypes = [
  {
    code: "AMIE",
    title: "Associate Member",
    label: "Entry Level",
    eligibility:
      "Diploma or equivalent engineering qualification pursuing professional progression.",
    description:
      "Designed for early-career engineers building foundational credentials and practice readiness.",
    fees: "Application and annual subscription as per chapter notification.",
    accentBg: "bg-gray-50",
    accentBorder: "border-gray-200",
    badgeBg: "bg-gray-200 text-gray-700",
    labelColor: "text-gray-500",
    step: "01",
  },
  {
    code: "MIE",
    title: "Member",
    label: "Professional",
    eligibility:
      "Recognized engineering degree with professional experience in industry, academia, or services.",
    description:
      "For practicing professionals seeking institutional recognition and technical leadership roles.",
    fees: "Standard membership admission and renewal fee.",
    accentBg: "bg-[#edf4ff]",
    accentBorder: "border-[#c2d9f5]",
    badgeBg: "bg-[#0b3a67] text-white",
    labelColor: "text-[#0b3a67]",
    step: "02",
    featured: true,
  },
  {
    code: "FIE",
    title: "Fellow",
    label: "Senior Grade",
    eligibility:
      "Senior engineering professionals with substantial experience, leadership, and contribution to the profession.",
    description:
      "Highest category focused on mentorship, governance, and strategic professional engagement.",
    fees: "Fellowship nomination and subscription structure as notified.",
    accentBg: "bg-[#fffbeb]",
    accentBorder: "border-[#f4c430]/50",
    badgeBg: "bg-[#f4c430] text-[#7a5500]",
    labelColor: "text-[#a07200]",
    step: "03",
  },
];

const comparisonRows = [
  {
    feature: "Designation after name",
    amie: "AMIE",
    mie: "MIE",
    fie: "FIE",
  },
  {
    feature: "Chartered Engineer (CEng) pathway",
    amie: "—",
    mie: "✓",
    fie: "✓",
  },
  {
    feature: "Professional Engineer (PEng) path",
    amie: "—",
    mie: "✓",
    fie: "✓",
  },
  {
    feature: "Voting rights in IEI elections",
    amie: "—",
    mie: "✓",
    fie: "✓",
  },
  {
    feature: "Eligible to hold Chapter office",
    amie: "—",
    mie: "✓",
    fie: "✓",
  },
  {
    feature: "IEI Journal & Publications access",
    amie: "✓",
    mie: "✓",
    fie: "✓",
  },
  {
    feature: "CPD & Seminar access",
    amie: "✓",
    mie: "✓",
    fie: "✓",
  },
  {
    feature: "Expert arbitration assignments",
    amie: "—",
    mie: "Limited",
    fie: "✓",
  },
  {
    feature: "Upgrade pathway available",
    amie: "→ MIE",
    mie: "→ FIE",
    fie: "Terminal",
  },
];

function TierIcon({ code }) {
  if (code === "AMIE")
    return (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  if (code === "MIE")
    return (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    );
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function MembershipGradesPage() {
  return (
    <section className="page-shell section-block">
      <SectionHeader
        eyebrow="Membership"
        title="Grades of Membership"
        description="Structured AMIE, MIE, and FIE pathways with eligibility, role fit, and fee direction."
      />

      {/* ── Progression pathway ── */}
      <div className="mb-8 flex items-center gap-0 overflow-x-auto">
        {membershipTypes.map((tier, index) => (
          <div key={tier.code} className="flex items-center">
            <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm">
              <span className={`text-xs font-bold tabular-nums ${tier.labelColor}`}>{tier.step}</span>
              <span className="text-xs font-semibold text-gray-700">{tier.code}</span>
              <span className="text-xs text-gray-400">{tier.label}</span>
            </div>
            {index < membershipTypes.length - 1 && (
              <svg className="mx-1 h-4 w-4 flex-shrink-0 text-gray-300" viewBox="0 0 16 16" fill="none">
                <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        ))}
        <span className="ml-3 text-xs text-gray-400 italic">Career Progression Path</span>
      </div>

      {/* ── Tier cards ── */}
      <div id="membership-grades" className="grid gap-5 md:grid-cols-3">
        {membershipTypes.map((item) => (
          <article
            key={item.code}
            className={`relative rounded-2xl border ${item.accentBorder} ${item.accentBg} p-6 transition-shadow duration-200 hover:shadow-md ${item.featured ? "ring-2 ring-[#0b3a67]/20" : ""}`}
          >
            {item.featured && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#0b3a67] px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white shadow">
                Most Common
              </span>
            )}

            {/* Badge + icon */}
            <div className="flex items-start justify-between">
              <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold tracking-wide ${item.badgeBg}`}>
                {item.code}
              </span>
              <span className={`${item.labelColor} opacity-70`}>
                <TierIcon code={item.code} />
              </span>
            </div>

            {/* Title + label */}
            <h3 className="mt-4 text-lg font-semibold text-gray-900">{item.title}</h3>
            <p className={`text-xs font-medium ${item.labelColor}`}>{item.label}</p>

            {/* Divider */}
            <div className="my-4 border-t border-gray-200/70" />

            {/* Eligibility */}
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">Eligibility</p>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">{item.eligibility}</p>

            {/* Description */}
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-400">Best For</p>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">{item.description}</p>

            {/* Fees */}
            <div className="mt-4 rounded-lg bg-white/70 px-3 py-2 text-xs text-gray-500">
              <span className="font-semibold text-gray-600">Fees: </span>{item.fees}
            </div>
          </article>
        ))}
      </div>

      {/* ── Comparison table ── */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold text-gray-900">Grade Comparison</h3>
        <p className="mt-1 text-sm text-gray-500">Feature-level comparison across all three membership grades.</p>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Feature</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">AMIE</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#0b3a67]">MIE</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[#a07200]">FIE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {comparisonRows.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 text-gray-700">{row.feature}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{row.amie}</td>
                  <td className="px-4 py-3 text-center font-medium text-[#0b3a67]">{row.mie}</td>
                  <td className="px-4 py-3 text-center font-medium text-[#a07200]">{row.fie}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="mt-8 flex flex-wrap gap-3">
        <Button as={Link} to="/membership/become-member">Start Application</Button>
        <Button as={Link} to="/membership/benefits" variant="secondary">
          View Member Benefits
        </Button>
      </div>
    </section>
  );
}
