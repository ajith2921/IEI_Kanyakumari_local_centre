import SectionHeader from "../components/SectionHeader";
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
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {data.map((facility, index) => (
            <article
              key={facility.id}
              className={`section-card interactive-card overflow-hidden ${
                index < 3 ? "stagger-in" : ""
              }`}
            >
              <div className="group aspect-[4/3] w-full overflow-hidden bg-brand-100">
                {facility.image_url ? (
                  <ImageMedia
                    src={toAbsoluteUploadUrl(facility.image_url)}
                    alt={facility.name}
                    position="50% 50%"
                    className="h-full w-full transition duration-300 group-hover:scale-105"
                    fallback={
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-700 to-brand-500 text-sm font-bold text-white">
                        Facility
                      </div>
                    }
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-brand-700 to-brand-500 text-sm font-bold text-white">
                    Facility
                  </div>
                )}
              </div>
              <div className="space-y-2 p-5">
                <h3 className="heading-h3 font-black text-brand-800">{facility.name}</h3>
                <p className="line-clamp-4 text-sm text-slate-600">{facility.description}</p>
              </div>
            </article>
          ))}
          {data.length === 0 && (
            <p className="rounded-xl border border-brand-100 bg-white p-4 text-slate-500">
              Facility data not available.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
