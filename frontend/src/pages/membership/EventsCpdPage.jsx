import { Link } from "react-router-dom";
import SectionHeader from "../../components/SectionHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const eventCategories = [
  "Technical Seminars", "Workshops", "Chapter Meets",
  "CPD Sessions", "Professional Networking", "Special Engineering Talks",
];

const eventSections = [
  { id: "event-calendar", title: "Event Calendar", detail: "Browse scheduled IEI chapter events, technical meetings, and learning programs across the membership calendar." },
  { id: "national-convention", title: "National Convention", detail: "Track national convention updates, conference schedules, and major institutional participation opportunities." },
  { id: "seminar-workshop", title: "Seminar & Workshop", detail: "Find seminar and workshop programs for professional learning, chapter interaction, and technical development." },
  { id: "webinar", title: "Webinar", detail: "Access virtual learning sessions, online technical talks, and recorded webinar announcements." },
  { id: "statutory-days", title: "Statutory Days", detail: "Review statutory day observances, official notices, and institution-wide event markers." },
  { id: "technical-activity-guide-book", title: "Technical Activity Guide Book", detail: "Use the guide book to understand event flow, chapter activity planning, and technical program execution." },
];

const educationCpdSections = [
  {
    id: "academics", title: "Academics",
    detail: "IEI's academic engagement covers AMIE examination support, affiliated institution programmes, and structured learning pathways for engineering professionals at all career stages.",
    bullets: ["AMIE study support and examination guidance", "Affiliated institution coordination", "Academic programme listing and updates"],
  },
  {
    id: "accreditation-recognitions", title: "Accreditation & Recognitions",
    detail: "IEI coordinates accreditation support for engineering programmes and manages institutional recognition frameworks aligned with national and international engineering standards.",
    bullets: ["Programme accreditation status lookup", "Institutional recognition criteria", "International mutual recognition pathways"],
  },
  {
    id: "examination", title: "Examination",
    detail: "The AMIE examination is the primary route for diploma holders to gain a recognized engineering qualification. Schedules, syllabi, and results are published here.",
    bullets: ["AMIE Section A & B syllabus and schedule", "Exam centre details and registration", "Result notifications and certification process"],
  },
  {
    id: "continual-professional-development", title: "Continual Professional Development",
    detail: "CPD programmes are structured to help members maintain, expand, and document their professional competencies through accredited learning activities recognized by IEI.",
    bullets: ["CPD credit system overview", "Approved CPD activity categories", "CPD log submission and certification"],
  },
  {
    id: "skill-india-mission", title: "Skill India Mission",
    detail: "IEI actively participates in the Skill India Mission by delivering skill-focused engineering programmes, partnering with training institutions, and supporting national skill development priorities.",
    bullets: ["IEI-aligned Skill India programme listing", "Skill certification recognition", "Training partner institution network"],
  },
  {
    id: "fees-structure", title: "Fees Structure",
    detail: "Examination fees, CPD programme charges, and academic enrolment costs are published here in a structured format to help applicants plan their education and development budgets.",
    bullets: ["AMIE examination fee schedule", "CPD programme enrolment charges", "Fee revision and notification archives"],
  },
  {
    id: "downloads", title: "Downloads",
    detail: "Official syllabi, application forms, CPD log templates, and academic-related documents are available for download from this section.",
    bullets: ["AMIE syllabus and study material links", "CPD log and submission templates", "Application and enrolment forms"],
  },
];

export default function EventsCpdPage() {
  return (
    <section className="page-shell section-block">
      <SectionHeader eyebrow="Events and CPD" title="Network and Professional Development" description="Event and CPD-oriented view for continuous learning and chapter participation." />

      <Card id="network-activities" className="premium-panel p-6 scroll-mt-28" padded={false}>
        <h3 className="text-xl font-medium text-gray-900">Network / Activities</h3>
        <p className="mt-1.5 text-sm text-gray-500">Participate in technical forums, chapter events, CPD sessions, and professional networking programs.</p>
        <ul className="mt-4 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
          {eventCategories.map((item) => (<li key={item} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">{item}</li>))}
        </ul>
      </Card>

      <Card id="student-chapters" className="mt-6 border-gray-200 bg-white p-6 scroll-mt-28" padded={false}>
        <h3 className="text-lg font-semibold text-gray-900">Student Chapters</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">Chapter-level technical communities for student members to engage in projects, talks, and mentorship tracks.</p>
      </Card>

      <Card id="student-chapter-benefits" className="mt-6 border-gray-200 bg-white p-6 scroll-mt-28" padded={false}>
        <h3 className="text-lg font-semibold text-gray-900">Student Chapter Benefits</h3>
        <ul className="mt-3 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
          <li className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">Technical mentoring by senior members</li>
          <li className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">Priority access to chapter events and workshops</li>
          <li className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">Project showcase opportunities</li>
          <li className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">Networking with professional engineers</li>
        </ul>
      </Card>

      <Card id="how-to-join-student-chapters" className="mt-6 border-gray-200 bg-white p-6 scroll-mt-28" padded={false}>
        <h3 className="text-lg font-semibold text-gray-900">How to Join Student Chapter</h3>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-gray-600">
          <li>Submit your membership/student chapter interest form through the IEI portal.</li>
          <li>Choose your nearest IEI centre or affiliated institution chapter.</li>
          <li>Complete profile verification and receive chapter onboarding details.</li>
        </ol>
      </Card>

      <Card id="student-scholarship" className="mt-6 border-gray-200 bg-white p-6 scroll-mt-28" padded={false}>
        <h3 className="text-lg font-semibold text-gray-900">Student Scholarship</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">Scholarship opportunities are announced for eligible student chapter members based on merit, activity participation, and chapter recommendations.</p>
      </Card>

      <Card id="student-directory" className="mt-6 border-gray-200 bg-white p-6 scroll-mt-28" padded={false}>
        <h3 className="text-lg font-semibold text-gray-900">Student Directory</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">The student directory provides chapter-wise visibility of active student members for collaboration and event participation.</p>
      </Card>

      <div className="mt-6 grid gap-4">
        {eventSections.map((section) => (
          <Card key={section.id} id={section.id} className="border border-gray-200 bg-white p-5 scroll-mt-28" padded={false}>
            <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">{section.detail}</p>
          </Card>
        ))}
      </div>

      <Card id="announcements" className="mt-6 border-gray-200 bg-white p-6 scroll-mt-28" padded={false}>
        <h3 className="text-lg font-semibold text-gray-900">Announcement for Members</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">Important event notifications, CPD notices, and chapter updates are published here for members.</p>
      </Card>

      {/* Education & CPD Sections — navbar anchor targets */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold text-gray-900">Education and CPD</h2>
        <p className="mt-1.5 text-sm text-gray-500">Academic programmes, examinations, CPD activities, and skill development pathways for IEI members.</p>
        <div className="mt-5 grid gap-4">
          {educationCpdSections.map((section) => (
            <Card key={section.id} id={section.id} className="border border-[#d4e1f1] bg-white p-5 scroll-mt-28" padded={false}>
              <h3 className="text-lg font-semibold text-[#123252]">{section.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{section.detail}</p>
              <ul className="mt-3 space-y-1.5">
                {section.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="mt-[0.3rem] inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#0b3a67]" />
                    {b}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button as={Link} to="/membership/publications">Open Publications</Button>
        <Button as={Link} to="/technical-activities" variant="secondary">Visit Main Site Activities</Button>
      </div>
    </section>
  );
}
