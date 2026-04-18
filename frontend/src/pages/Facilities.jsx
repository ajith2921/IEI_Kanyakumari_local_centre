import SectionHeader from "../components/SectionHeader";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import { SkeletonGrid } from "../components/Skeletons";
import useFetchList from "../hooks/useFetchList";
import { publicApi, toAbsoluteUploadUrl } from "../services/api";
import ImageMedia from "../components/ImageMedia";

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
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {data.map((facility) => (
              <article
                key={facility.id}
                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-200 hover:border-gray-200 hover:shadow-sm"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-gray-50">
                  <ImageMedia
                    src={toAbsoluteUploadUrl(facility.image_url)}
                    alt={facility.name}
                    fit="cover"
                    position="50% 50%"
                    className="h-full w-full transition-transform duration-300 group-hover:scale-[1.02]"
                    fallback={
                      <div className="flex h-full items-center justify-center bg-gray-50 text-sm text-gray-300">
                        Facility
                      </div>
                    }
                  />
                </div>
                <div className="space-y-1.5 p-5">
                  <h3 className="text-sm font-semibold text-gray-900">{facility.name}</h3>
                  <p className="line-clamp-3 text-sm leading-relaxed text-gray-500">{facility.description}</p>
                </div>
              </article>
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
