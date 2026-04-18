import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import EventCard from "../components/EventCard";
import SectionHeader from "../components/SectionHeader";
import { SkeletonGrid } from "../components/Skeletons";
import Button from "../components/ui/Button";
import useFetchList from "../hooks/useFetchList";
import { publicApi } from "../services/api";

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

function ActivityCategory({ title, items }) {
  return (
    <div className="border-b border-gray-100 py-6 last:border-0">
      <p className="eyebrow-chip mb-3">{title}</p>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm text-gray-500">
            <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-gray-300" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function TechnicalActivities() {
  const { data, loading, error, reload } = useFetchList(publicApi.getActivities);

  return (
    <div className="min-h-screen bg-white">
      <main className="page-shell py-20">

        {/* ── Page header ────────────────────────────── */}
        <header className="mb-14 border-b border-gray-100 pb-8">
          <p className="eyebrow-chip mb-3">Knowledge Exchange · Professional Development · Innovation</p>
          <h1 className="heading-h1 text-gray-900">Events & Technical Activities</h1>
          <p className="mt-3 text-sm text-gray-400">IEI Kanyakumari Local Centre</p>
        </header>

        {/* ── Admin-published events (API) ───────────── */}
        <section className="mb-20">
          <SectionHeader
            eyebrow="Published by Admin"
            title="Upcoming Events"
            description="Live events added by the IEI KKLC team."
          />
          {loading && <SkeletonGrid count={3} />}
          {error && <ErrorState message={error} onRetry={reload} />}
          {!loading && !error && (
            data.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
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
        <section className="mb-20">
          <div className="mb-8 border-b border-gray-100 pb-4">
            <p className="eyebrow-chip">Major Activities Conducted</p>
          </div>
          <div className="grid gap-0 md:grid-cols-2">
            {ACTIVITY_CATEGORIES.map((cat, idx) => (
              <div
                key={cat.title}
                className={`${idx % 2 === 0 ? "md:border-r md:border-gray-100 md:pr-8" : "md:pl-8"}`}
              >
                <ActivityCategory title={cat.title} items={cat.items} />
              </div>
            ))}
          </div>
        </section>

        {/* ── SUSTAIN-TECH 2026 pointer ──────────────── */}
        <section className="mb-12">
          <div className="flex flex-wrap items-center justify-between gap-6 rounded-2xl border border-gray-100 bg-gray-50/60 p-8">
            <div>
              <p className="eyebrow-chip mb-2">Upcoming Conference</p>
              <h2 className="text-lg font-semibold text-gray-900">SUSTAIN-TECH 2026</h2>
              <p className="mt-1.5 text-sm text-gray-500">
                30–31 October 2026 · International Conference on Sustainable Science & Technology
              </p>
            </div>
            <Button as={Link} to="/conference" variant="secondary" size="sm">
              View Full Details
            </Button>
          </div>
        </section>

        <footer className="border-t border-gray-100 pt-5 text-center text-[11px] text-gray-300">
          IEI Kanyakumari Local Centre · Events & Technical Activities
        </footer>
      </main>
    </div>
  );
}
