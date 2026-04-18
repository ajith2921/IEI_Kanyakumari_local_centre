import SectionHeader from "../components/SectionHeader";
import Card from "../components/ui/Card";

/* ── data ─────────────────────────────────────────── */
const TRACKS = [
  "Renewable & Green Energy Technologies",
  "Smart Grids & Energy Storage",
  "Climate Resilient Infrastructure",
  "Circular Economy & Waste Management",
  "AI & IoT for Sustainability",
  "Sustainable Manufacturing & Industry 4.0",
  "Water Resources & Environmental Engineering",
  "Sustainable Transportation & EV Technologies",
];

const HIGHLIGHTS = [
  "Keynote addresses by international & national experts",
  "Technical paper presentations (Oral & Poster)",
  "Pre-conference workshops & FDPs",
  "Student Innovation & Sustainability Challenge",
  "Industry–Academia Round Table",
  "Best Paper / Best Poster / Young Researcher Awards",
];

const TIMELINE = [
  { month: "March–April 2026", activity: "Call for Papers Launch" },
  { month: "April 2026",       activity: "Webinar Series" },
  { month: "May 2026",         activity: "Research Writing Workshop" },
  { month: "June 2026",        activity: "Industry Round Table" },
  { month: "July 2026",        activity: "Innovation Challenge" },
  { month: "August 2026",      activity: "FDP / Short Course" },
  { month: "September 2026",   activity: "Poster Competition & Hackathon" },
  { month: "October 30–31, 2026", activity: "Main Conference" },
];

const AWARDS = [
  "Best Paper Award",
  "Best Poster Award",
  "Young Researcher Award",
  "Best Innovation Prototype Award",
  "Industry Impact Award",
];

const OUTCOMES = [
  "High-quality international paper submissions",
  "Publication in reputed indexed proceedings/journals",
  "Strong IEI KKLC visibility at national & global level",
  "Sustainable innovation ecosystem in the region",
  "Industry partnerships for collaborative projects",
];

const conferenceHighlights = [
  {
    title: "Technical Paper Presentation",
    detail: "Submit and present original research papers across all engineering disciplines. Best papers are awarded and considered for publication.",
  },
  {
    title: "Expert Keynote Sessions",
    detail: "Industry leaders and academic experts deliver keynote addresses on emerging technologies and engineering innovations.",
  },
  {
    title: "Workshop & Hands-On Training",
    detail: "Specialized workshops provide practical exposure to cutting-edge tools, software, and engineering methodologies.",
  },
];

const conferenceDetails = [
  { label: "Dates",   value: "30–31 October 2026" },
  { label: "Venue",   value: "To be finalized – IEI KKLC Region" },
  { label: "Theme",   value: "Advancing Science & Technology for SDGs" },
  { label: "Tagline", value: '"Engineering Sustainable Futures Through Innovation and Collaboration"' },
];

const challenges = [
  "Climate change",
  "Renewable energy transition",
  "Environmental protection",
  "Smart & resilient infrastructure",
  "Inclusive and sustainable growth",
];

const objectives = [
  "Promote interdisciplinary research in sustainable science and engineering",
  "Strengthen academia–industry–research collaboration",
  "Encourage innovative technological solutions for SDGs",
  "Provide exposure for young researchers and students",
  "Build international collaboration networks",
];

/* ── helpers ──────────────────────────────────────── */
function Bullet({ children }) {
  return (
    <li className="flex items-start gap-3 text-sm text-gray-500">
      <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-gray-300" />
      {children}
    </li>
  );
}

function NumberedItem({ index, children }) {
  return (
    <li className="flex items-start gap-3 text-sm text-gray-500">
      <span className="mt-0.5 flex-shrink-0 text-xs font-medium text-gray-300">{index + 1}.</span>
      {children}
    </li>
  );
}

/* ═══════════════════════════════════════════════════════
   CONFERENCE PAGE
═══════════════════════════════════════════════════════ */
export default function Conference() {
  return (
    <div className="min-h-screen bg-white">
      <main className="page-shell py-20">

        {/* ── Page header ────────────────────────────── */}
        <header className="mb-14 border-b border-gray-100 pb-8">
          <p className="eyebrow-chip mb-3">Conferences & Seminars</p>
          <h1 className="heading-h1 text-gray-900">
            Kanyakumari Local Centre — Conferences
          </h1>
          <p className="mt-3 text-base text-gray-400">
            A premier platform for engineers, researchers, and academics
          </p>
        </header>

        {/* ── Annual Conference overview ─────────────── */}
        <section className="mb-20">
          <SectionHeader
            eyebrow="About"
            title="IEI Kanyakumari — Annual Conference"
            description="A premier platform for engineers, researchers, and academics to share knowledge, present innovations, and collaborate on technical challenges."
          />

          <Card className="mb-8 text-sm leading-relaxed text-gray-500">
            <p className="mb-3">
              The IEI Kanyakumari Local Centre organises its Annual Technical
              Conference to bring together engineering professionals, researchers,
              and students from across the region. The conference serves as a
              knowledge exchange forum aligned with national and international
              engineering standards.
            </p>
            <p>
              Participants gain exposure to industry trends, network with peers, and
              contribute to the advancement of engineering science through paper
              presentations, panel discussions, and technical exhibitions.
            </p>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            {conferenceHighlights.map((item) => (
              <Card key={item.title} interactive>
                <h3 className="mb-2 text-sm font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{item.detail}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* ── SUSTAIN-TECH 2026 ──────────────────────── */}
        <section className="mb-20">
          <div className="mb-8 border-b border-gray-100 pb-4">
            <p className="eyebrow-chip mb-1">International Conference</p>
            <h2 className="heading-h2 text-gray-900">SUSTAIN-TECH 2026</h2>
          </div>

          {/* Metadata grid */}
          <div className="mb-8 grid gap-4 rounded-2xl border border-gray-100 bg-gray-50/60 p-6 sm:grid-cols-2">
            {conferenceDetails.map((item) => (
              <div key={item.label}>
                <p className="eyebrow-chip mb-0.5">{item.label}</p>
                <p className="text-sm text-gray-600">{item.value}</p>
              </div>
            ))}
          </div>

          {/* About + Objectives */}
          <div className="mb-6 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-6">
              <p className="eyebrow-chip mb-4">About the Conference</p>
              <p className="mb-4 text-sm leading-relaxed text-gray-500">
                SUSTAIN-TECH 2026 creates a global platform for researchers, academicians, industry
                professionals, policymakers, and students to present and exchange innovative ideas
                toward sustainable development.
              </p>
              <p className="eyebrow-chip mb-3">Challenges Addressed</p>
              <ul className="space-y-2">
                {challenges.map((c) => <Bullet key={c}>{c}</Bullet>)}
              </ul>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-6">
              <p className="eyebrow-chip mb-4">Objectives</p>
              <ol className="space-y-2">
                {objectives.map((obj, idx) => <NumberedItem key={obj} index={idx}>{obj}</NumberedItem>)}
              </ol>
            </div>
          </div>

          {/* Technical Tracks */}
          <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6">
            <p className="eyebrow-chip mb-4">Major Technical Tracks</p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {TRACKS.map((t) => <Bullet key={t}>{t}</Bullet>)}
            </ul>
          </div>

          {/* Conference Highlights */}
          <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6">
            <p className="eyebrow-chip mb-4">Conference Highlights</p>
            <ul className="space-y-2">
              {HIGHLIGHTS.map((h) => <Bullet key={h}>{h}</Bullet>)}
            </ul>
          </div>

          {/* Timeline */}
          <div className="mb-6 overflow-hidden rounded-2xl border border-gray-100 bg-white">
            <div className="border-b border-gray-100 px-6 py-4">
              <p className="eyebrow-chip">Pre-Conference Engagement Plan</p>
            </div>
            <table className="w-full">
              <thead className="bg-gray-50/60">
                <tr>
                  {["Timeline", "Activity"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {TIMELINE.map((r) => (
                  <tr key={r.month} className="transition-colors duration-200 hover:bg-gray-50/60">
                    <td className="whitespace-nowrap px-6 py-3 text-sm font-medium text-gray-900">{r.month}</td>
                    <td className="px-6 py-3 text-sm text-gray-500">{r.activity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Awards + Outcomes */}
          <div className="mb-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-6">
              <p className="eyebrow-chip mb-4">Awards & Recognition</p>
              <ul className="space-y-2">
                {AWARDS.map((a) => <Bullet key={a}>{a}</Bullet>)}
              </ul>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-6">
              <p className="eyebrow-chip mb-4">Expected Outcomes</p>
              <ul className="space-y-2">
                {OUTCOMES.map((o) => <Bullet key={o}>{o}</Bullet>)}
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-2xl border border-gray-100 bg-gray-50/60 px-8 py-10 text-center">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">
              Interested in Participating?
            </h2>
            <p className="mx-auto max-w-lg text-sm text-gray-500">
              Contact us via the{" "}
              <a href="/contact" className="font-medium text-gray-900 underline underline-offset-2 transition-colors duration-200 hover:text-gray-600">
                Contact page
              </a>{" "}
              or reach out to the local centre office for conference schedules,
              paper submission guidelines, and registration details.
            </p>
          </div>
        </section>

        <footer className="border-t border-gray-100 pt-5 text-center text-[11px] text-gray-300">
          IEI Kanyakumari Local Centre · Conferences & Seminars
        </footer>
      </main>
    </div>
  );
}
