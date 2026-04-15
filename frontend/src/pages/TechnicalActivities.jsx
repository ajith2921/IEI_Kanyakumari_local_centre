import SectionHeader from "../components/SectionHeader";
import EventCard from "../components/EventCard";
import ErrorState from "../components/ErrorState";
import { SkeletonGrid } from "../components/Skeletons";
import useFetchList from "../hooks/useFetchList";
import { publicApi } from "../services/api";

export default function TechnicalActivities() {
  const { data, loading, error, reload } = useFetchList(publicApi.getActivities);

  return (
    <section className="page-shell section-block">
      <SectionHeader
        eyebrow="Knowledge Exchange"
        title="Technical Activities"
        description="Workshops, expert talks, and competitions conducted by the chapter."
      />

      {loading && <SkeletonGrid count={6} />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {data.map((activity) => (
            <EventCard key={activity.id} activity={activity} />
          ))}
          {data.length === 0 && (
            <p className="rounded-xl border border-brand-100 bg-white p-4 text-slate-500">
              No technical activities published yet.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
