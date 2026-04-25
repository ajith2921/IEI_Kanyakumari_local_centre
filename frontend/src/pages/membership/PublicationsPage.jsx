import { Link } from "react-router-dom";
import SectionHeader from "../../components/SectionHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const publicationServices = [
  {
    title: "Journal Access",
    detail: "Explore engineering journals, institutional papers, and technical references for domain practice.",
  },
  {
    title: "Paper Submission Pathway",
    detail: "Prepare and publish original work through guided submission channels and editorial standards.",
  },
  {
    title: "Reference Library",
    detail: "Use publications and archival resources for project planning, technical research, and study support.",
  },
];

export default function PublicationsPage() {
  return (
    <section className="page-shell section-block">
      <SectionHeader
        eyebrow="Publications"
        title="Journals and Publication Services"
        description="Dedicated publication section for journal discovery, paper submissions, and technical references."
      />

      <Card id="publications" className="premium-panel p-6 scroll-mt-28" padded={false}>
        <h3 className="text-xl font-medium text-gray-900">Journals / Publications</h3>
        <p className="mt-1.5 text-sm text-gray-500">
          Access IEI-focused technical publications, curated research streams, and submission opportunities.
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {publicationServices.map((service) => (
            <article key={service.title} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <h4 className="text-sm font-medium text-gray-900">{service.title}</h4>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{service.detail}</p>
            </article>
          ))}
        </div>
      </Card>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button as={Link} to="/membership/events-cpd">Explore Events & CPD</Button>
        <Button as={Link} to="/membership/member-services" variant="secondary">
          Open Member Services
        </Button>
      </div>
    </section>
  );
}
