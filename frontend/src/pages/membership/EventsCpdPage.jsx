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

      <Card id="network-activities" className="premium-panel p-6 scroll-mt-28" padded={false}>
        <h3 className="text-xl font-medium text-gray-900">Network / Activities</h3>
        <p className="mt-1.5 text-sm text-gray-500">
          Participate in technical forums, chapter events, CPD sessions, and professional networking programs.
        </p>
        <ul className="mt-4 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
          {eventCategories.map((item) => (
            <li key={item} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              {item}
            </li>
          ))}
        </ul>
      </Card>

      <Card id="student-chapters" className="mt-6 border-gray-200 bg-white p-6 scroll-mt-28" padded={false}>
        <h3 className="text-lg font-semibold text-gray-900">Student Chapters</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Chapter-level technical communities for student members to engage in projects, talks, and mentorship tracks.
        </p>
      </Card>

      <Card id="announcements" className="mt-6 border-gray-200 bg-white p-6 scroll-mt-28" padded={false}>
        <h3 className="text-lg font-semibold text-gray-900">Announcement for Members</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Important event notifications, CPD notices, and chapter updates are published here for members.
        </p>
      </Card>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button as={Link} to="/membership/publications">Open Publications</Button>
        <Button as={Link} to="/technical-activities" variant="secondary">
          Visit Main Site Activities
        </Button>
      </div>
    </section>
  );
}
