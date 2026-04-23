import { Link } from "react-router-dom";
import SectionHeader from "../../components/SectionHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const eventCategories = [
  "Technical Seminars",
  "Workshops",
  "Chapter Meets",
  "CPD Sessions",
  "Professional Networking",
  "Special Engineering Talks",
];

export default function EventsCpdPage() {
  return (
    <section className="page-shell section-block">
      <SectionHeader
        eyebrow="Events and CPD"
        title="Network and Professional Development"
        description="Event and CPD-oriented view for continuous learning and chapter participation."
      />

      <Card className="border-gray-200 bg-white" padded={false}>
        <div className="p-6">
          <p className="text-sm leading-relaxed text-gray-600">
            Events and CPD programs help members build technical depth, industry visibility, and strong peer networks.
          </p>
          <ul className="mt-4 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
            {eventCategories.map((item) => (
              <li key={item} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button as={Link} to="/membership#network-activities" variant="secondary">
              Open Membership Activities Section
            </Button>
            <Button as={Link} to="/technical-activities" variant="secondary">
              Visit Main Site Activities
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
}
