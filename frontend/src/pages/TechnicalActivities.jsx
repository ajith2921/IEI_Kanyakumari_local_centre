import { useMemo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import EventCard from "../components/EventCard";
import SectionHeader from "../components/SectionHeader";
import { SkeletonGrid } from "../components/Skeletons";
import Button from "../components/ui/Button";
import useFetchList from "../hooks/useFetchList";
import { publicApi } from "../services/api";

function getActivityTime(activity) {
  const eventDateText = String(activity?.event_date || "").trim();
  if (!eventDateText) return Number.NaN;
  
  // Try standard parsing first
  const parsed = Date.parse(eventDateText);
  if (Number.isFinite(parsed)) return parsed;

  // Fallback for DD-MM-YYYY or DD/MM/YYYY
  const parts = eventDateText.split(/[-/]/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed
    const year = parseInt(parts[2], 10);
    
    // Check if it looks like a valid DD-MM-YYYY (or MM-DD-YYYY if day > 12)
    if (day >= 1 && day <= 31 && month >= 0 && month <= 11 && year > 1900) {
      return new Date(year, month, day).getTime();
    }
  }

  return Number.NaN;
}

function isUpcomingActivity(activity, todayStartMs) {
  const activityTime = getActivityTime(activity);
  return Number.isFinite(activityTime) && activityTime >= todayStartMs;
}

function formatDateRange(start, end) {
  if (!start || !end) return "";
  const s = new Date(start);
  const e = new Date(end);
  const options = { month: "short", day: "numeric" };
  const yearOptions = { year: "numeric" };
  
  const startStr = s.toLocaleDateString("en-IN", options);
  const endStr = e.toLocaleDateString("en-IN", { ...options, ...yearOptions });
  
  return `${startStr}-${endStr}`;
}

export default function TechnicalActivities() {
  const { data, loading, error, reload } = useFetchList(publicApi.getActivities);
  const [activeConference, setActiveConference] = useState(null);

  useEffect(() => {
    publicApi.getActiveConference()
      .then(res => setActiveConference(res.data))
      .catch(() => { /* conference banner is non-critical */ });
  }, []);

  const todayStartMs = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.getTime();
  }, []);

  // Separate upcoming and past events for perfectly synced counts and robust sorting
  const sortedUpcoming = useMemo(() => {
    return data
      .filter((a) => isUpcomingActivity(a, todayStartMs))
      .sort((a, b) => getActivityTime(a) - getActivityTime(b)); // soonest first
  }, [data, todayStartMs]);

  const sortedPast = useMemo(() => {
    return data
      .filter((a) => !isUpcomingActivity(a, todayStartMs))
      .sort((a, b) => {
        const timeA = getActivityTime(a);
        const timeB = getActivityTime(b);
        // Handle events with no valid dates (push to bottom)
        if (Number.isNaN(timeA) && Number.isNaN(timeB)) return 0;
        if (Number.isNaN(timeA)) return 1;
        if (Number.isNaN(timeB)) return -1;
        return timeB - timeA; // most recent first
      });
  }, [data, todayStartMs]);

  const allSortedActivities = useMemo(() => [...sortedUpcoming, ...sortedPast], [sortedUpcoming, sortedPast]);

  const totalActivities = data.length;
  const totalUpcoming = sortedUpcoming.length;
  const totalConducted = totalActivities - totalUpcoming;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <main className="page-shell py-20">

        {/* ── Page header ────────────────────────────── */}
        <header className="relative mb-14 overflow-hidden rounded-3xl border border-gray-200 bg-white p-7 shadow-sm sm:p-9">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.1),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.08),transparent_42%)]" />

          <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <p className="eyebrow-chip mb-3">Knowledge Exchange · Professional Development · Innovation</p>
              <h1 className="heading-h1 text-gray-900">Events &amp; Technical Activities</h1>
              <p className="mt-3 text-sm text-gray-500">IEI Kanyakumari Local Centre</p>
            </div>
            
            <div>
              <Link
                to="/conference"
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-[#05154B] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#0a1f66]"
              >
                View Conferences
              </Link>
            </div>
          </div>

          <div className="relative">
            {activeConference && (
              <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                <div>
                  <p className="text-sm font-semibold text-emerald-900">{activeConference.short_title}</p>
                  <p className="text-xs text-emerald-700">
                    {activeConference.title} — {formatDateRange(activeConference.start_date, activeConference.end_date)}
                  </p>
                </div>
                <Button as={Link} to={activeConference.link} className="sm:ml-auto whitespace-nowrap bg-emerald-700 hover:bg-emerald-800 text-white">
                  {activeConference.button_text}
                </Button>
              </div>
            )}

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">Total Activities</p>
                <p className="mt-1 text-xl font-semibold text-gray-900">{loading ? "..." : totalActivities}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">Upcoming</p>
                <p className="mt-1 text-xl font-semibold text-gray-900">{loading ? "..." : totalUpcoming}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">Conducted</p>
                <p className="mt-1 text-xl font-semibold text-gray-900">{loading ? "..." : totalConducted}</p>
              </div>
            </div>
          </div>
        </header>

        {/* ── All events sorted by date ────────────────── */}
        <section className="mb-20 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <SectionHeader
            eyebrow="IEI KKLC Activities"
            title="All Events & Activities"
            description="All technical activities sorted by date — upcoming events first, followed by past events."
            className="mb-8"
          />
          {loading && <SkeletonGrid count={3} />}
          {error && <ErrorState message={error} onRetry={reload} />}
          {!loading && !error && (
            allSortedActivities.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                {allSortedActivities.map((activity) => (
                  <EventCard key={activity.id} activity={activity} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No activities published yet"
                description="Events and technical activities will appear here once added by the admin team."
              />
            )
          )}
        </section>

      </main>
    </div>
  );
}
