import SectionHeader from "../components/SectionHeader";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import { SkeletonGrid } from "../components/Skeletons";
import useFetchList from "../hooks/useFetchList";
import { publicApi, toAbsoluteUploadUrl } from "../services/api";
import ImageMedia from "../components/ImageMedia";
import Card from "../components/ui/Card";

export default function Facilities() {
  const { data, loading, error, reload } = useFetchList(publicApi.getFacilities);

  return (
    <section className="page-shell section-block">
      <SectionHeader
        eyebrow="Infrastructure"
        title="Facilities"
        description="Resources and institutional facilities that support learning and events."
      />

      {loading && <SkeletonGrid count={6} />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && (
        data.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {data.map((facility, index) => (
              <Card
                key={facility.id}
                interactive
                padded={false}
                className={`group overflow-hidden ${index < 3 ? "stagger-in" : ""}`}
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-brand-50">
                  <ImageMedia
                    src={toAbsoluteUploadUrl(facility.image_url)}
                    alt={facility.name}
                    fit="cover"
                    position="50% 50%"
                    className="h-full w-full transition-all duration-300 group-hover:scale-105"
                    fallback={
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-700 to-blue-500 text-sm font-semibold text-white">
                        Facility
                      </div>
                    }
                  />
                </div>
                <div className="space-y-2 p-5">
                  <h3 className="heading-h3 font-semibold text-gray-900">{facility.name}</h3>
                  <p className="line-clamp-4 text-sm text-gray-600">{facility.description}</p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No facilities published"
            description="Facility details will appear here once added by the administration."
          />
        )
      )}
    </section>
  );
}
