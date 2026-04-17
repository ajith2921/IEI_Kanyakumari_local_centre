import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import EventCard from "../components/EventCard";
import SectionHeader from "../components/SectionHeader";
import { SkeletonGrid } from "../components/Skeletons";
import Button from "../components/ui/Button";
import useFetchList from "../hooks/useFetchList";
import { publicApi } from "../services/api";

/* ── shared IEI style tokens ───────────────────────── */
const FONT_SANS  = '"Arial", "Helvetica Neue", Helvetica, sans-serif';
const FONT_SERIF = '"Times New Roman", Georgia, serif';
const CLR_NAVY   = "#1f3c88";
const CLR_MAROON = "#8B0000";
const CLR_SILVER = "#c0c0c0";
const CLR_MUTED  = "#666666";

/* ── reusable document section title ────────────────── */
function DocSectionTitle({ title }) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <div style={{ height: "3px", backgroundColor: CLR_MAROON }} />
      <div style={{ height: "1px", backgroundColor: CLR_MAROON, marginTop: "2px" }} />
      <p style={{
        fontFamily: FONT_SANS, fontSize: "15px", fontWeight: "bold",
        color: CLR_MAROON, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: "10px",
      }}>
        {title}
      </p>
    </div>
  );
}

/* ── activity category block ─────────────────────────── */
function ActivityCategory({ title, items }) {
  return (
    <div style={{ padding: "14px 0", borderBottom: `1px solid ${CLR_SILVER}` }}>
      <p style={{
        fontFamily: FONT_SANS, fontSize: "13px", fontWeight: "bold",
        color: CLR_NAVY, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px",
      }}>
        {title}
      </p>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {items.map((item) => (
          <li key={item} style={{
            fontFamily: FONT_SERIF, fontSize: "14px", color: "#333",
            lineHeight: 1.8, paddingLeft: "14px", position: "relative",
          }}>
            <span style={{ position: "absolute", left: 0, color: CLR_MAROON, fontWeight: "bold" }}>›</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── static data ─────────────────────────────────────── */
const ACTIVITY_CATEGORIES = [
  {
    title: "Technical Programmes",
    items: ["Engineers Day Celebrations", "National Conferences", "Expert Talks", "Industry Interaction Sessions"],
  },
  {
    title: "Student Events",
    items: ["Coding Challenges", "Robotics Contests", "Project Expos", "Technical Quizzes", "Innovation Competitions"],
  },
  {
    title: "Professional Development",
    items: ["Career Guidance Sessions", "Soft Skills Workshops", "Entrepreneurship Awareness", "Research Methodology Workshops"],
  },
  {
    title: "Social Outreach",
    items: ["Rural Technology Awareness", "Sustainability Programmes", "Engineering for Society Initiatives"],
  },
];

/* ═══════════════════════════════════════════════════════
   PAGE COMPONENT
═══════════════════════════════════════════════════════ */
export default function TechnicalActivities() {
  const { data, loading, error, reload } = useFetchList(publicApi.getActivities);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f3f3f3" }}>
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-10">

        {/* ── Page heading (IEI flat style) ──────────── */}
        <header style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ height: "3px", backgroundColor: CLR_MAROON }} />
          <div style={{ height: "1px", backgroundColor: CLR_MAROON, marginTop: "2px", marginBottom: "14px" }} />
          <p style={{ fontFamily: FONT_SANS, fontSize: "clamp(1.1rem,3vw,1.6rem)", fontWeight: "bold", color: "#1a1a1a" }}>
            IEI Kanyakumari Local Centre
          </p>
          <h1 style={{ fontFamily: FONT_SANS, fontSize: "clamp(1.3rem,4vw,2rem)", fontWeight: "bold", color: CLR_NAVY, margin: "6px 0 4px" }}>
            Events &amp; Technical Activities
          </h1>
          <p style={{ fontFamily: FONT_SERIF, fontSize: "14px", color: CLR_MUTED, fontStyle: "italic" }}>
            Knowledge Exchange · Professional Development · Innovation &amp; Outreach
          </p>
          <div style={{ height: "1px", backgroundColor: CLR_MAROON, marginTop: "12px" }} />
          <div style={{ height: "3px", backgroundColor: CLR_MAROON, marginTop: "2px" }} />
        </header>

        {/* ── Admin-published events (API) ───────────── */}
        <section style={{ marginBottom: "40px" }}>
          <SectionHeader
            eyebrow="Published by Admin"
            title="Upcoming Events"
            description="Live events added by the IEI KKLC team."
          />
          {loading && <SkeletonGrid count={3} />}
          {error && <ErrorState message={error} onRetry={reload} />}
          {!loading && !error && (
            data.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
                {data.map((activity) => (
                  <EventCard key={activity.id} activity={activity} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No events published yet"
                description="Upcoming workshop and chapter events will appear here."
              />
            )
          )}
        </section>

        {/* ── Major Activities Conducted ─────────────── */}
        <section style={{ marginBottom: "40px" }}>
          <DocSectionTitle title="Major Activities Conducted" />
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 0,
          }}>
            {ACTIVITY_CATEGORIES.map((cat, idx) => (
              <div
                key={cat.title}
                style={{
                  borderRight: idx % 2 === 0 ? `1px solid ${CLR_SILVER}` : "none",
                  paddingRight: idx % 2 === 0 ? "24px" : "0",
                  paddingLeft: idx % 2 === 1 ? "24px" : "0",
                }}
              >
                <ActivityCategory title={cat.title} items={cat.items} />
              </div>
            ))}
          </div>
        </section>

        {/* ── SUSTAIN-TECH 2026 pointer ──────────────── */}
        <section style={{ marginBottom: "30px" }}>
          <DocSectionTitle title="Upcoming Conference" />
          <div style={{
            backgroundColor: "#fff", border: `1px solid ${CLR_SILVER}`,
            padding: "20px 24px", display: "flex", alignItems: "center",
            justifyContent: "space-between", flexWrap: "wrap", gap: "16px",
          }}>
            <div>
              <p style={{ fontFamily: FONT_SANS, fontSize: "11px", fontWeight: "bold", color: CLR_MAROON, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
                International Conference
              </p>
              <h2 style={{ fontFamily: FONT_SANS, fontSize: "clamp(1rem,2vw,1.3rem)", fontWeight: "bold", color: CLR_NAVY, margin: 0 }}>
                SUSTAIN-TECH 2026
              </h2>
              <p style={{ fontFamily: FONT_SERIF, fontSize: "13px", color: CLR_MUTED, marginTop: "4px" }}>
                30–31 October 2026 · International Conference on Sustainable Science &amp; Technology
              </p>
            </div>
            <Button as={Link} to="/conference" variant="secondary" size="sm">
              View Full Details →
            </Button>
          </div>
          <div style={{ height: "3px", backgroundColor: CLR_MAROON, marginTop: "2px" }} />
          <div style={{ height: "1px", backgroundColor: CLR_MAROON, marginTop: "2px" }} />
        </section>

        <footer style={{ marginTop: "28px", textAlign: "center", fontFamily: FONT_SERIF, fontSize: "11px", color: "#999" }}>
          IEI Kanyakumari Local Centre &middot; Events &amp; Technical Activities
        </footer>
      </main>
    </div>
  );
}
