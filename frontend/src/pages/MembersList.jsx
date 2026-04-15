import SectionHeader from "../components/SectionHeader";
import MemberCard from "../components/MemberCard";
import ErrorState from "../components/ErrorState";
import { SkeletonGrid } from "../components/Skeletons";
import useFetchList from "../hooks/useFetchList";
import { publicApi } from "../services/api";

export default function MembersList() {
  const { data, loading, error, reload } = useFetchList(publicApi.getMembers);

  return (
    <section className="page-shell section-block">
      <SectionHeader
        eyebrow="Leadership Team"
        title="Members List"
        description="Browse office bearers and open each profile with View Details for full institutional information."
      />

      {loading && <SkeletonGrid count={6} />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((member) => (
            <MemberCard key={member.id} member={member} />
          ))}
        </div>
      )}
    </section>
  );
}
