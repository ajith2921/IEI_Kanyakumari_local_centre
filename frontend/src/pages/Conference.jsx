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
    <li className="flex items-start gap-3 text-sm leading-relaxed text-slate-600">
      <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
      {children}
    </li>
  );
}

function NumberedItem({ index, children }) {
  return (
    <li className="flex items-start gap-3 text-sm leading-relaxed text-slate-600">
      <span className="mt-0.5 flex-shrink-0 text-xs font-semibold text-slate-400">{index + 1}.</span>
      {children}
    </li>
  );
}

/* ═══════════════════════════════════════════════════════
   CONFERENCE PAGE
═══════════════════════════════════════════════════════ */
export default function Conference() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/30">
      <main className="page-shell pb-24 pt-14 sm:pt-16 lg:pt-20">

        {/* ── Page header ────────────────────────────── */}
        <header className="relative mb-16 overflow-hidden rounded-[28px] border border-slate-200 bg-white px-6 py-10 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.35)] sm:px-10 sm:py-12">
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-emerald-100/70 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-sky-100/60 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:linear-gradient(to_right,rgba(148,163,184,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.18)_1px,transparent_1px)] [background-size:30px_30px]" />

          <div className="relative">
            <p className="eyebrow-chip mb-3">Conferences & Seminars</p>
            <h1 className="heading-h1 max-w-4xl text-gray-900">
              Kanyakumari Local Centre — Conferences
            </h1>
            <p className="mt-4 max-w-2xl text-base text-gray-500 sm:text-lg">
              A premier platform for engineers, researchers, and academics
            </p>
          </div>
        </header>

        {/* ── Annual Conference overview ─────────────── */}
        <section className="mb-24">
          <SectionHeader
            eyebrow="About"
            title="IEI Kanyakumari — Annual Conference"
            description="A premier platform for engineers, researchers, and academics to share knowledge, present innovations, and collaborate on technical challenges."
            className="mb-10"
            contentWidthClassName="max-w-4xl"
          />

          <Card className="mb-10 border-slate-200 bg-white text-sm leading-relaxed text-gray-600 shadow-[0_16px_44px_-36px_rgba(15,23,42,0.4)]">
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

          <div className="grid gap-5 md:grid-cols-3">
            {conferenceHighlights.map((item) => (
              <Card
                key={item.title}
                interactive
                className="group overflow-hidden border-slate-200 bg-white/95 p-6 shadow-[0_16px_38px_-34px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-0.5"
              >
                <span className="mb-4 block h-1.5 w-12 rounded-full bg-gradient-to-r from-emerald-300 via-sky-300 to-slate-300" />
                <h3 className="mb-2 text-sm font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{item.detail}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* ── SUSTAIN-TECH 2026 ──────────────────────── */}
        <section className="mb-20 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-42px_rgba(15,23,42,0.3)] sm:p-8 lg:p-10">
          <div className="mb-10 border-b border-slate-100 pb-5">
            <p className="eyebrow-chip mb-1">International Conference</p>
            <h2 className="heading-h2 text-gray-900">SUSTAIN-TECH 2026</h2>
          </div>

          {/* Metadata grid */}
          <div className="mb-10 grid gap-4 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-emerald-50/40 p-6 sm:grid-cols-2">
            {conferenceDetails.map((item) => (
              <div key={item.label} className="rounded-xl border border-white/80 bg-white/90 p-4 shadow-[0_10px_28px_-26px_rgba(15,23,42,0.5)]">
                <p className="eyebrow-chip mb-0.5">{item.label}</p>
                <p className="text-sm font-medium text-slate-700">{item.value}</p>
              </div>
            ))}
          </div>

          {/* About + Objectives */}
          <div className="mb-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/70 p-6 shadow-[0_14px_34px_-30px_rgba(15,23,42,0.5)]">
              <h3 className="eyebrow-chip mb-4">About the Conference</h3>
              <p className="mb-4 text-sm leading-relaxed text-slate-600">
                SUSTAIN-TECH 2026 creates a global platform for researchers, academicians, industry
                professionals, policymakers, and students to present and exchange innovative ideas
                toward sustainable development.
              </p>
              <h4 className="eyebrow-chip mb-3">Challenges Addressed</h4>
              <ul className="space-y-2">
                {challenges.map((c) => <Bullet key={c}>{c}</Bullet>)}
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-white to-sky-50/50 p-6 shadow-[0_14px_34px_-30px_rgba(15,23,42,0.5)]">
              <h3 className="eyebrow-chip mb-4">Objectives</h3>
              <ol className="space-y-2">
                {objectives.map((obj, idx) => <NumberedItem key={obj} index={idx}>{obj}</NumberedItem>)}
              </ol>
            </div>
          </div>

          {/* Technical Tracks + Conference Highlights */}
          <div className="mb-8 grid gap-6 xl:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_14px_34px_-30px_rgba(15,23,42,0.5)]">
              <h3 className="eyebrow-chip mb-4">Major Technical Tracks</h3>
              <ul className="grid gap-3 sm:grid-cols-2">
                {TRACKS.map((t) => <Bullet key={t}>{t}</Bullet>)}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_14px_34px_-30px_rgba(15,23,42,0.5)]">
              <h3 className="eyebrow-chip mb-4">Conference Highlights</h3>
              <ul className="space-y-2">
                {HIGHLIGHTS.map((h) => <Bullet key={h}>{h}</Bullet>)}
              </ul>
            </div>
          </div>

          {/* Timeline */}
          <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_34px_-30px_rgba(15,23,42,0.45)]">
            <div className="border-b border-slate-100 px-6 py-4">
              <h3 className="eyebrow-chip">Pre-Conference Engagement Plan</h3>
            </div>

            <div className="divide-y divide-slate-100 md:hidden">
              {TIMELINE.map((r) => (
                <div key={r.month} className="px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-400">{r.month}</p>
                  <p className="mt-1 text-sm text-slate-700">{r.activity}</p>
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[640px]">
                <thead className="bg-slate-50/80">
                  <tr>
                    {["Timeline", "Activity"].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {TIMELINE.map((r) => (
                    <tr key={r.month} className="transition-colors duration-200 hover:bg-slate-50/70">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900 md:whitespace-nowrap">{r.month}</td>
                      <td className="px-6 py-3 text-sm text-slate-600">{r.activity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Awards + Outcomes */}
          <div className="mb-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_14px_34px_-30px_rgba(15,23,42,0.45)]">
              <h3 className="eyebrow-chip mb-4">Awards & Recognition</h3>
              <ul className="space-y-2">
                {AWARDS.map((a) => <Bullet key={a}>{a}</Bullet>)}
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_14px_34px_-30px_rgba(15,23,42,0.45)]">
              <h3 className="eyebrow-chip mb-4">Expected Outcomes</h3>
              <ul className="space-y-2">
                {OUTCOMES.map((o) => <Bullet key={o}>{o}</Bullet>)}
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-emerald-50/60 px-6 py-10 text-center sm:px-8">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-[radial-gradient(circle_at_left,rgba(148,163,184,0.22),transparent_65%)]" />
            <div className="relative">
              <h2 className="mb-2 text-lg font-semibold text-gray-900">
                Interested in Participating?
              </h2>
              <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-600">
                Contact us via the{" "}
                <a href="/contact" className="font-medium text-gray-900 underline underline-offset-2 transition-colors duration-200 hover:text-gray-600">
                  Contact page
                </a>{" "}
                or reach out to the local centre office for conference schedules,
                paper submission guidelines, and registration details.
              </p>
            </div>
          </div>
        </section>

        <footer className="mt-14 border-t border-slate-200 pt-6 text-center text-[11px] tracking-[0.08em] text-slate-400">
          IEI Kanyakumari Local Centre · Conferences & Seminars
        </footer>
      </main>
    </div>
  );
}
