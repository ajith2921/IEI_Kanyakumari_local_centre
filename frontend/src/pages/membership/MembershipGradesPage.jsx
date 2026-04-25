import { Link } from "react-router-dom";
import SectionHeader from "../../components/SectionHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const membershipTypes = [
  {
    code: "AMIE",
    title: "Associate Member",
    eligibility: "Diploma or equivalent engineering qualification pursuing professional progression.",
    description: "Designed for early-career engineers building foundational credentials and practice readiness.",
    fees: "Application and annual subscription as per chapter notification.",
  },
  {
    code: "MIE",
    title: "Member",
    eligibility: "Recognized engineering degree with professional experience in industry, academia, or services.",
    description: "For practicing professionals seeking institutional recognition and technical leadership roles.",
    fees: "Standard membership admission and renewal fee.",
  },
  {
    code: "FIE",
    title: "Fellow",
    eligibility: "Senior engineering professionals with substantial experience, leadership, and contribution to the profession.",
    description: "Highest category focused on mentorship, governance, and strategic professional engagement.",
    fees: "Fellowship nomination and subscription structure as notified.",
  },
];

export default function MembershipGradesPage() {
  return (
    <section className="page-shell section-block">
      <SectionHeader
        eyebrow="Membership"
        title="Grades of Membership"
        description="Structured AMIE, MIE, and FIE pathways with eligibility, role fit, and fee direction."
      />

      <Card id="membership-grades" className="premium-panel p-6" padded={false}>
        <h3 className="text-xl font-medium text-gray-900">Membership Categories</h3>
        <p className="mt-1.5 text-sm text-gray-500">
          Choose the grade that matches your qualification stage, professional experience, and career outcomes.
        </p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {membershipTypes.map((item) => (
            <article key={item.code} className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <p className="inline-flex rounded-md bg-gray-200 px-2 py-1 text-xs font-semibold text-gray-600">
                {item.code}
              </p>
              <h4 className="mt-3 text-sm font-medium text-gray-900">{item.title}</h4>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Eligibility</p>
              <p className="text-sm text-gray-500">{item.eligibility}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Description</p>
              <p className="text-sm text-gray-500">{item.description}</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Fees</p>
              <p className="text-sm text-gray-500">{item.fees}</p>
            </article>
          ))}
        </div>
      </Card>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button as={Link} to="/membership/become-member">Start Application</Button>
        <Button as={Link} to="/membership/benefits" variant="secondary">
          View Member Benefits
        </Button>
      </div>
    </section>
  );
}
