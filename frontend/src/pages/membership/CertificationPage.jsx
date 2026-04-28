import { Link } from "react-router-dom";
import SectionHeader from "../../components/SectionHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const certificationTracks = [
  {
    id: "chartered-engineer",
    eyebrow: "Certification Track",
    title: "Chartered Engineer (CEng)",
    detail:
      "Built for engineers targeting authority-backed technical design approvals, valuation reports, and project execution validation.",
  },
  {
    id: "professional-engineer",
    eyebrow: "Professional Recognition",
    title: "Professional Engineer (PEng)",
    detail:
      "Advanced competency route for high-stakes assignments in infrastructure, consultancy-led execution, and institutional review workflows.",
  },
  {
    id: "international-professional-engineer",
    eyebrow: "Global Recognition",
    title: "International Professional Engineers",
    detail:
      "International recognition pathway for engineers seeking cross-border professional visibility, credibility, and technical standing.",
  },
  {
    id: "section-ab",
    eyebrow: "Academic Services",
    title: "Section A & B Examination",
    detail:
      "End-to-end support for form filling, admit cards, results tracking, and progression planning for aspiring members.",
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

      <div className="grid gap-4">
        {certificationTracks.map((track) => (
          <Card
            key={track.id}
            id={track.id}
            className="premium-panel p-6 scroll-mt-28"
            padded={false}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-400">
              {track.eyebrow}
            </p>
            <h3 className="mt-1.5 text-lg font-semibold text-gray-900">{track.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">{track.detail}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button as={Link} to="/membership/become-member">Start Membership Application</Button>
        <Button as={Link} to="/membership/member-services" variant="secondary">
          Open Member Services
        </Button>
      </div>
    </section>
  );
}
