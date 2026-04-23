import { Link } from "react-router-dom";
import SectionHeader from "../../components/SectionHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const certificationTracks = [
  {
    id: "chartered-engineer",
    title: "Chartered Engineer (CEng)",
    detail:
      "Certification path for engineering authority in design review, project validation, and technical reporting.",
  },
  {
    id: "professional-engineer",
    title: "Professional Engineer (PEng)",
    detail:
      "Advanced professional recognition for complex assignments and institutional engineering workflows.",
  },
  {
    id: "section-ab",
    title: "Section A & B Examination",
    detail:
      "Exam-focused services for progression support, form guidance, and academic pathway completion.",
  },
];

export default function CertificationPage() {
  return (
    <section className="page-shell section-block">
      <SectionHeader
        eyebrow="Certification Hub"
        title="Certification and Academic Pathways"
        description="Focused access to CEng, PEng, and Section A and B service tracks."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {certificationTracks.map((track) => (
          <Card key={track.id} className="border-gray-200 bg-white" padded={false}>
            <div className="p-6">
              <h3 className="text-base font-semibold text-gray-900">{track.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{track.detail}</p>
              <Button as={Link} to={`/membership#${track.id}`} variant="secondary" size="sm" className="mt-4">
                Open in Membership Home
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
