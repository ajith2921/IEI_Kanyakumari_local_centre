import { useMemo } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import EventCard from "../components/EventCard";
import PageMeta from "../components/PageMeta";
import SectionHeader from "../components/SectionHeader";
import { SkeletonGrid } from "../components/Skeletons";
import useFetchList from "../hooks/useFetchList";
import { publicApi } from "../services/api";

function getConferenceTime(conference) {
  const eventDateText = String(conference?.start_date || "").trim();
  if (!eventDateText) return Number.NaN;
  
  const parsed = Date.parse(eventDateText);
  if (Number.isFinite(parsed)) return parsed;

  const parts = eventDateText.split(/[-/]/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; 
    const year = parseInt(parts[2], 10);
    
    if (day >= 1 && day <= 31 && month >= 0 && month <= 11 && year > 1900) {
      return new Date(year, month, day).getTime();
    }
  }

  return Number.NaN;
}

function isUpcomingConference(conference, todayStartMs) {
  const activityTime = getConferenceTime(conference);
  return Number.isFinite(activityTime) && activityTime >= todayStartMs;
}

export default function ConferencePage() {
  // Fetch up to 100 conferences so we never silently paginate
  const fetchAll = useMemo(() => (params) => publicApi.getConferences({ ...params, limit: 100 }), []);
  const { data, loading, error, reload } = useFetchList(fetchAll);

  const todayStartMs = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.getTime();
  }, []);

  const sortedUpcoming = useMemo(() => {
    return data
      .filter((a) => isUpcomingConference(a, todayStartMs))
      .sort((a, b) => getConferenceTime(a) - getConferenceTime(b));
  }, [data, todayStartMs]);

  const sortedPast = useMemo(() => {
    return data
      .filter((a) => !isUpcomingConference(a, todayStartMs))
      .sort((a, b) => {
        const timeA = getConferenceTime(a);
        const timeB = getConferenceTime(b);
        if (Number.isNaN(timeA) && Number.isNaN(timeB)) return 0;
        if (Number.isNaN(timeA)) return 1;
        if (Number.isNaN(timeB)) return -1;
        return timeB - timeA;
      });
  }, [data, todayStartMs]);

  const allSortedConferences = useMemo(() => [...sortedUpcoming, ...sortedPast], [sortedUpcoming, sortedPast]);

  const totalActivities = data.length;
  const totalUpcoming = sortedUpcoming.length;
  const totalConducted = totalActivities - totalUpcoming;

  const mapConferenceToCard = (conference) => ({
    id: conference.id,
    title: conference.title || conference.short_title || "Conference",
    description: conference.description || "Conference details will be updated soon.",
    event_date: conference.start_date,
    venue: conference.venue,
    image_url: conference.image_url,
    resource_url:
      conference.pdf_url ||
      (conference.link && conference.link.trim() !== "/conference-overview" && conference.link.trim() !== "/conference"
        ? conference.link
        : `/conference-portal/${conference.id}`),
    resource_label: conference.pdf_url ? (conference.button_text || "View PDF") : (conference.button_text || "View More Details"),
    secondary_resource_url:
      conference.pdf_url &&
      conference.link &&
      conference.link.trim() !== "/conference-overview" &&
      conference.link.trim() !== "/conference"
        ? conference.link
        : `/conference-portal/${conference.id}`,
    secondary_resource_label: "Visit Conference Page",
    details_button_text: "View Conference Details →",
    collapse_button_text: "Hide Conference Details ↑",
  });

  return (
    <>
      <PageMeta
        title="Conferences"
        description="Upcoming and past conferences organised by IEI Kanyakumari Local Centre. Register for SUSTAIN-TECH 2026 and other engineering conferences."
        canonical="https://www.ieikanyakumarilc.org/conferences"
        ogTitle="IEI Kanyakumari Local Centre — Conferences"
        ogDescription="Register for upcoming conferences and explore past events at IEI Kanyakumari Local Centre."
      />
      <div className="min-h-screen bg-gray-50/50">
      <main className="page-shell py-20">

        <header className="relative mb-14 overflow-hidden rounded-3xl border border-gray-200 bg-white p-7 shadow-sm sm:p-9">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.1),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.08),transparent_42%)]" />

          <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div>
              <p className="eyebrow-chip mb-3">Global Reach · Knowledge Sharing · Networking</p>
              <h1 className="heading-h1 text-gray-900">Conferences</h1>
              <p className="mt-3 text-sm text-gray-500">IEI Kanyakumari Local Centre</p>
            </div>
            
            <div>
              <Link
                to="/technical-activities"
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:text-gray-900"
              >
                View Technical Events
              </Link>
            </div>
          </div>

          <div className="relative mt-7 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">Total Conferences</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">{loading ? "..." : totalActivities}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">Upcoming</p>
              <p className="mt-1 text-xl font-semibold text-emerald-600">{loading ? "..." : totalUpcoming}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">Successfully Conducted</p>
              <p className="mt-1 text-xl font-semibold text-gray-900">{loading ? "..." : totalConducted}</p>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-14">
            <ErrorState
              title="Failed to Load Conferences"
              message={error}
              onRetry={reload}
            />
          </div>
        )}

        {loading ? (
          <SkeletonGrid count={6} />
        ) : !error && allSortedConferences.length === 0 ? (
          <EmptyState
            title="No Conferences Found"
            description="There are currently no conferences scheduled. Check back later for updates."
            actionLabel="Refresh"
            onAction={reload}
          />
        ) : (
          <>
            {sortedUpcoming.length > 0 && (
              <section className="mb-16">
                <SectionHeader title="Upcoming Conferences" subtitle="Register now for these upcoming conferences" />
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {sortedUpcoming.map((conf) => (
                    <EventCard
                      key={conf.id}
                      activity={mapConferenceToCard(conf)}
                    />
                  ))}
                </div>
              </section>
            )}

            {sortedPast.length > 0 && (
              <section className="mb-16">
                <SectionHeader title="Past Conferences" subtitle="Archive of our previously conducted conferences" />
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {sortedPast.map((conf) => (
                    <EventCard
                      key={conf.id}
                      activity={mapConferenceToCard(conf)}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
      </div>
    </>
  );
}
