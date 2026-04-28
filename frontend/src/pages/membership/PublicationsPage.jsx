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

const publicationSections = [
  {
    id: "journals",
    title: "Journals",
    detail: "Access engineering journals, research papers, and editorial collections for technical reading and reference.",
  },
  {
    id: "books",
    title: "Books",
    detail: "Browse publication titles and reference books relevant to engineering practice and study support.",
  },
  {
    id: "proceedings",
    title: "Proceedings",
    detail: "Review conference and seminar proceedings for updated technical knowledge and presented papers.",
  },
  {
    id: "compendium",
    title: "Compendium",
    detail: "Find curated collections of institutional knowledge, technical summaries, and reference compendiums.",
  },
  {
    id: "annual-reports",
    title: "Annual Reports",
    detail: "Read institutional annual reports covering activities, outcomes, and published highlights.",
  },
  {
    id: "iei-news",
    title: "IEI News",
    detail: "Access current news updates, announcements, and newsworthy institutional publication items.",
  },
  {
    id: "iei-epitome",
    title: "IEI Epitome",
    detail: "View IEI epitome-style publications and summary documents for a concise institutional snapshot.",
  },
  {
    id: "annual-technical-volume",
    title: "Annual Technical Volume",
    detail: "Explore yearly technical volumes compiling papers, reports, and domain-specific contributions.",
  },
  {
    id: "schedule-and-rate",
    title: "Schedule and Rate",
    detail: "Review publication schedules, issue calendars, and rate references for current publication services.",
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

      <div className="mt-6 grid gap-4">
        {publicationSections.map((section) => (
          <Card key={section.id} id={section.id} className="border border-gray-200 bg-white p-5 scroll-mt-28" padded={false}>
            <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">{section.detail}</p>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button as={Link} to="/membership/events-cpd">Explore Events & CPD</Button>
        <Button as={Link} to="/membership/member-services" variant="secondary">
          Open Member Services
        </Button>
      </div>
    </section>
  );
}
