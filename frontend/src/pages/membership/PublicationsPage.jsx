import { Link } from "react-router-dom";
import SectionHeader from "../../components/SectionHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const publicationServices = [
  {
    title: "Journal Access",
    detail: "Browse engineering journals and technical publication resources.",
  },
  {
    title: "Paper Submission",
    detail: "Prepare and submit technical papers for institutional publication channels.",
  },
  {
    title: "Reference Library",
    detail: "Use publications and archival resources for project and research support.",
  },
];

export default function PublicationsPage() {
  return (
    <section className="page-shell section-block">
      <SectionHeader
        eyebrow="Publications"
        title="Journals and Publication Services"
        description="Dedicated publication section for journal discovery and paper submissions."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {publicationServices.map((service) => (
          <Card key={service.title} className="border-gray-200 bg-white" padded={false}>
            <div className="p-6">
              <h3 className="text-base font-semibold text-gray-900">{service.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{service.detail}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-6 border-gray-200 bg-gray-50" padded={false}>
        <div className="p-6">
          <p className="text-sm leading-relaxed text-gray-600">
            Publication services are integrated with membership home for unified access and section-level navigation.
          </p>
          <Button as={Link} to="/membership#publications" variant="secondary" className="mt-4">
            Open Publications Section
          </Button>
        </div>
      </Card>
    </section>
  );
}
