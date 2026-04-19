import { useMemo } from "react";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import EventCard from "../components/EventCard";
import SectionHeader from "../components/SectionHeader";
import { SkeletonGrid } from "../components/Skeletons";
import useFetchList from "../hooks/useFetchList";
import { publicApi } from "../services/api";

const HEADING_ORDER = [
  "Technical Programmes",
  "Student Events",
  "Professional Development",
  "Social Outreach",
];
const OTHER_HEADING = "Other Activities";

function getActivityHeading(activity) {
  const description = String(activity?.description || "").trim();
  const [prefix] = description.split(" - ");
  const heading = String(prefix || "").trim();
  return HEADING_ORDER.includes(heading) ? heading : OTHER_HEADING;
}

function getActivityTime(activity) {
  const eventDateText = String(activity?.event_date || "").trim();
  if (!eventDateText) {
    return Number.NaN;
  }

  const parsed = Date.parse(eventDateText);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function isUpcomingActivity(activity, todayStartMs) {
  const activityTime = getActivityTime(activity);
  return Number.isFinite(activityTime) && activityTime >= todayStartMs;
}

export default function TechnicalActivities() {
  const { data, loading, error, reload } = useFetchList(publicApi.getActivities);
  const todayStartMs = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.getTime();
  }, []);

  const upcomingActivities = useMemo(
    () =>
      data
        .filter((activity) => isUpcomingActivity(activity, todayStartMs))
        .slice()
        .sort((left, right) => getActivityTime(left) - getActivityTime(right)),
    [data, todayStartMs]
  );

  const conductedActivities = useMemo(
    () => data.filter((activity) => !isUpcomingActivity(activity, todayStartMs)),
    [data, todayStartMs]
  );

  const groupedActivities = useMemo(() => {
    const grouped = new Map();

    HEADING_ORDER.forEach((heading) => grouped.set(heading, []));
    grouped.set(OTHER_HEADING, []);

    conductedActivities.forEach((activity) => {
      const heading = getActivityHeading(activity);
      grouped.get(heading).push(activity);
    });

    const orderedSections = HEADING_ORDER
      .map((heading) => ({ heading, activities: grouped.get(heading) }))
      .filter((section) => section.activities.length > 0);

    const otherActivities = grouped.get(OTHER_HEADING);
    if (otherActivities.length > 0) {
      orderedSections.push({ heading: OTHER_HEADING, activities: otherActivities });
    }

    return orderedSections;
  }, [conductedActivities]);

  return (
    <div className="min-h-screen bg-white">
      <main className="page-shell py-20">

        {/* ── Page header ────────────────────────────── */}
        <header className="mb-14 border-b border-gray-100 pb-8">
          <p className="eyebrow-chip mb-3">Knowledge Exchange · Professional Development · Innovation</p>
          <h1 className="heading-h1 text-gray-900">Events & Technical Activities</h1>
          <p className="mt-3 text-sm text-gray-400">IEI Kanyakumari Local Centre</p>
        </header>

        {/* ── Upcoming events (API) ───────────────────── */}
        <section className="mb-20">
          <SectionHeader
            eyebrow="Upcoming Events"
            title="Upcoming Conference"
            description="Upcoming conferences and events from the IEI KKLC team."
          />
          {loading && <SkeletonGrid count={1} />}
          {error && <ErrorState message={error} onRetry={reload} />}
          {!loading && !error && (
            upcomingActivities.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                {upcomingActivities.map((activity) => (
                  <EventCard key={activity.id} activity={activity} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No upcoming events yet"
                description="Upcoming conferences and events will appear here once scheduled."
              />
            )
          )}
        </section>

        {/* ── Conducted activities (API) ──────────────── */}
        <section className="mb-20">
          <SectionHeader
            eyebrow="Conducted by IEI KKLC"
            title="Major Activities Conducted"
            description="These are activities conducted by the IEI KKLC team."
          />
          {!loading && !error && (
            groupedActivities.length > 0 ? (
              <div className="space-y-10">
                {groupedActivities.map((section) => (
                  <section key={section.heading}>
                    <div className="mb-5 flex items-center justify-between gap-3 border-b border-gray-100 pb-2">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-gray-700 sm:text-base">
                        {section.heading}
                      </h3>
                      <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-500">
                        {section.activities.length}
                      </span>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                      {section.activities.map((activity) => (
                        <EventCard key={activity.id} activity={activity} />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No conducted activities published yet"
                description="Conducted events will appear here after they are added by the admin team."
              />
            )
          )}
        </section>

      </main>
    </div>
  );
}
