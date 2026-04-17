import SectionHeader from "../components/SectionHeader";
import Card from "../components/ui/Card";

/* ── shared IEI style tokens ───────────────────────── */
const FONT_SANS  = '"Arial", "Helvetica Neue", Helvetica, sans-serif';
const FONT_SERIF = '"Times New Roman", Georgia, serif';
const CLR_NAVY   = "#1f3c88";
const CLR_MAROON = "#8B0000";
const CLR_SILVER = "#c0c0c0";
const CLR_MUTED  = "#666666";

const row = (extra = {}) => ({
  fontFamily: FONT_SERIF, fontSize: "14px", color: "#333", lineHeight: 1.7, ...extra,
});

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
  "🎤 Keynote addresses by international & national experts",
  "📄 Technical paper presentations (Oral & Poster)",
  "🎓 Pre-conference workshops & FDPs",
  "💡 Student Innovation & Sustainability Challenge",
  "🤝 Industry–Academia Round Table",
  "🏆 Best Paper / Best Poster / Young Researcher Awards",
];

const TIMELINE = [
  { month: "March–April 2026",    activity: "Call for Papers Launch" },
  { month: "April 2026",          activity: "Webinar Series" },
  { month: "May 2026",            activity: "Research Writing Workshop" },
  { month: "June 2026",           activity: "Industry Round Table" },
  { month: "July 2026",           activity: "Innovation Challenge" },
  { month: "August 2026",         activity: "FDP / Short Course" },
  { month: "September 2026",      activity: "Poster Competition & Hackathon" },
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

/* ── helpers ──────────────────────────────────────── */
function DocRule() {
  return (
    <div>
      <div style={{ height: "3px", backgroundColor: CLR_MAROON }} />
      <div style={{ height: "1px", backgroundColor: CLR_MAROON, marginTop: "2px" }} />
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <p style={{
      fontFamily: FONT_SANS, fontSize: "13px", fontWeight: "bold",
      color: CLR_NAVY, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px",
    }}>
      {children}
    </p>
  );
}

function Bullet({ children }) {
  return (
    <p style={{ ...row(), paddingLeft: "14px", position: "relative", marginBottom: "3px" }}>
      <span style={{ position: "absolute", left: 0, color: CLR_MAROON, fontWeight: "bold" }}>›</span>
      {children}
    </p>
  );
}

/* ═══════════════════════════════════════════════════════
   CONFERENCE PAGE
═══════════════════════════════════════════════════════ */
export default function Conference() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f3f3f3" }}>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-10">

        {/* ── IEI Document Header ────────────────────── */}
        <header style={{ textAlign: "center", marginBottom: "32px" }}>
          <DocRule />
          <div style={{ margin: "14px 0" }}>
            <p style={{ fontFamily: FONT_SANS, fontSize: "clamp(1.1rem,3vw,1.5rem)", fontWeight: "bold", color: "#1a1a1a" }}>
              The Institution of Engineers (India)
            </p>
            <p style={{ fontFamily: FONT_SERIF, fontSize: "13px", fontStyle: "italic", color: "#555", marginTop: "2px" }}>
              (Established 1920, Incorporated by Royal Charter 1935)
            </p>
            <h1 style={{ fontFamily: FONT_SANS, fontSize: "clamp(1.3rem,4vw,2rem)", fontWeight: "bold", color: CLR_NAVY, margin: "10px 0 4px" }}>
              Kanyakumari Local Centre — Conferences
            </h1>
            <p style={{ fontFamily: FONT_SERIF, fontSize: "14px", color: CLR_MUTED, fontStyle: "italic" }}>
              A premier platform for engineers, researchers, and academics
            </p>
          </div>
          <DocRule />
        </header>

        {/* ── Annual Conference overview ─────────────── */}
        <section style={{ marginBottom: "40px" }}>
          <SectionHeader
            eyebrow="Conferences & Seminars"
            title="IEI Kanyakumari — Annual Conference"
            description="A premier platform for engineers, researchers, and academics to share knowledge, present innovations, and collaborate on technical challenges."
          />

          <Card className="mb-8 p-7 leading-relaxed text-gray-700 md:p-9">
            <p className="mb-4">
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
              <Card key={item.title} interactive className="p-6">
                <h3 className="mb-3 text-lg font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600">{item.detail}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            SUSTAIN-TECH 2026
        ═══════════════════════════════════════════════ */}
        <section>
          <div style={{ marginBottom: "18px" }}>
            <DocRule />
            <p style={{
              fontFamily: FONT_SANS, fontSize: "15px", fontWeight: "bold",
              color: CLR_MAROON, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: "10px",
            }}>
              SUSTAIN-TECH 2026 — International Conference
            </p>
          </div>

          {/* Banner card */}
          <div style={{
            backgroundColor: "#fff", border: `1px solid ${CLR_SILVER}`,
            padding: "20px 24px", marginBottom: "24px",
          }}>
            <p style={{ fontFamily: FONT_SANS, fontSize: "11px", fontWeight: "bold", color: CLR_MAROON, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
              International Conference on Sustainable Science &amp; Technology
            </p>
            <h2 style={{ fontFamily: FONT_SANS, fontSize: "clamp(1.1rem,3vw,1.5rem)", fontWeight: "bold", color: CLR_NAVY, margin: "0 0 4px" }}>
              SUSTAIN-TECH 2026
            </h2>
            <p style={{ fontFamily: FONT_SERIF, fontSize: "14px", color: "#444", fontStyle: "italic", marginBottom: "16px" }}>
              Organized by IEI KKLC · Aligned with UN Sustainable Development Goals
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "12px" }}>
              {[
                { label: "Dates", value: "30–31 October 2026" },
                { label: "Venue", value: "To be finalized – IEI KKLC Region" },
                { label: "Theme", value: "Advancing Science & Technology for SDGs" },
                { label: "Tagline", value: '"Engineering Sustainable Futures Through Innovation and Collaboration"' },
              ].map((item) => (
                <div key={item.label} style={{ borderLeft: `3px solid ${CLR_MAROON}`, paddingLeft: "10px" }}>
                  <p style={{ fontFamily: FONT_SANS, fontSize: "11px", fontWeight: "bold", color: CLR_MUTED, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</p>
                  <p style={{ fontFamily: FONT_SERIF, fontSize: "13px", color: "#333" }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* About + Objectives */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "0" }}>
            <div style={{ borderRight: `1px solid ${CLR_SILVER}`, paddingRight: "24px", paddingBottom: "20px" }}>
              <SectionTitle>About the Conference</SectionTitle>
              <p style={row({ marginBottom: "10px" })}>
                SUSTAIN-TECH 2026 creates a global platform for researchers, academicians, industry professionals, policymakers, and students to present and exchange innovative ideas toward sustainable development.
              </p>
              <p style={{ fontFamily: FONT_SANS, fontSize: "11px", fontWeight: "bold", color: CLR_MUTED, textTransform: "uppercase", marginBottom: "6px" }}>
                Challenges addressed:
              </p>
              {["Climate change", "Renewable energy transition", "Environmental protection", "Smart & resilient infrastructure", "Inclusive and sustainable growth"].map((c) => (
                <Bullet key={c}>{c}</Bullet>
              ))}
            </div>
            <div style={{ paddingLeft: "24px", paddingBottom: "20px", borderBottom: `1px solid ${CLR_SILVER}` }}>
              <SectionTitle>Objectives</SectionTitle>
              {[
                "Promote interdisciplinary research in sustainable science and engineering",
                "Strengthen academia–industry–research collaboration",
                "Encourage innovative technological solutions for SDGs",
                "Provide exposure for young researchers and students",
                "Build international collaboration networks",
              ].map((obj, idx) => (
                <p key={obj} style={row({ paddingLeft: "22px", position: "relative", marginBottom: "4px" })}>
                  <span style={{ position: "absolute", left: 0, color: CLR_MAROON, fontWeight: "bold", fontFamily: FONT_SANS, fontSize: "12px" }}>{idx + 1}.</span>
                  {obj}
                </p>
              ))}
            </div>
          </div>

          {/* Technical Tracks */}
          <div style={{ borderBottom: `1px solid ${CLR_SILVER}`, paddingTop: "16px", paddingBottom: "16px" }}>
            <SectionTitle>Major Technical Tracks</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: "2px 24px" }}>
              {TRACKS.map((t) => <Bullet key={t}>{t}</Bullet>)}
            </div>
          </div>

          {/* Highlights */}
          <div style={{ borderBottom: `1px solid ${CLR_SILVER}`, paddingTop: "16px", paddingBottom: "16px" }}>
            <SectionTitle>Conference Highlights</SectionTitle>
            {HIGHLIGHTS.map((h) => <p key={h} style={row({ marginBottom: "4px" })}>{h}</p>)}
          </div>

          {/* Timeline */}
          <div style={{ borderBottom: `1px solid ${CLR_SILVER}`, paddingTop: "16px", paddingBottom: "16px" }}>
            <SectionTitle>Pre-Conference Engagement Plan</SectionTitle>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Timeline", "Activity"].map((h) => (
                    <th key={h} style={{ fontFamily: FONT_SANS, fontSize: "12px", color: CLR_MAROON, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left", paddingBottom: "6px", borderBottom: `1px solid ${CLR_SILVER}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIMELINE.map((r, idx) => (
                  <tr key={r.month} style={{ backgroundColor: idx % 2 === 0 ? "transparent" : "#f9f9f9" }}>
                    <td style={{ fontFamily: FONT_SANS, fontSize: "13px", fontWeight: "bold", color: CLR_NAVY, padding: "7px 12px 7px 0", borderBottom: `1px solid ${CLR_SILVER}`, whiteSpace: "nowrap" }}>{r.month}</td>
                    <td style={{ fontFamily: FONT_SERIF, fontSize: "13px", color: "#333", padding: "7px 0", borderBottom: `1px solid ${CLR_SILVER}` }}>{r.activity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Awards + Outcomes */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 0, borderBottom: `1px solid ${CLR_SILVER}` }}>
            <div style={{ paddingTop: "16px", paddingBottom: "16px", borderRight: `1px solid ${CLR_SILVER}`, paddingRight: "24px" }}>
              <SectionTitle>Awards &amp; Recognition</SectionTitle>
              {AWARDS.map((a) => <Bullet key={a}>{a}</Bullet>)}
            </div>
            <div style={{ paddingTop: "16px", paddingBottom: "16px", paddingLeft: "24px" }}>
              <SectionTitle>Expected Outcomes</SectionTitle>
              {OUTCOMES.map((o) => (
                <p key={o} style={row({ paddingLeft: "14px", position: "relative", marginBottom: "3px" })}>
                  <span style={{ position: "absolute", left: 0, color: "#2a7a2a", fontWeight: "bold" }}>✔</span>{o}
                </p>
              ))}
            </div>
          </div>

          <DocRule />

          {/* CTA */}
          <div className="mt-8 rounded-xl border border-brand-200 bg-brand-50 p-8 text-center">
            <h2 className="mb-2 text-xl font-semibold text-brand-800">
              Interested in Participating?
            </h2>
            <p className="text-sm text-gray-600">
              Contact us via the{" "}
              <a href="/contact" className="font-medium text-brand-700 underline underline-offset-2 hover:text-brand-900">
                Contact page
              </a>{" "}
              or reach out to the local centre office for conference schedules,
              paper submission guidelines, and registration details.
            </p>
          </div>
        </section>

        <footer style={{ marginTop: "28px", textAlign: "center", fontFamily: FONT_SERIF, fontSize: "11px", color: "#999" }}>
          IEI Kanyakumari Local Centre &middot; Conferences &amp; Seminars
        </footer>
      </main>
    </div>
  );
}
