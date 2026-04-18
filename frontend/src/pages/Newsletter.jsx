import SectionHeader from "../components/SectionHeader";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import { SkeletonRows } from "../components/Skeletons";
import Button from "../components/ui/Button";
import useFetchList from "../hooks/useFetchList";
import { publicApi, toAbsoluteUploadUrl } from "../services/api";

export default function Newsletter() {
  const { data, loading, error, reload } = useFetchList(publicApi.getNewsletters);

  return (
    <section className="page-shell section-block">
      <SectionHeader
        eyebrow="Publications"
        title="Newsletter"
        description="Read chapter updates, technical briefs, and institutional announcements."
      />

      {loading && <SkeletonRows count={4} />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && (
        data.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {data.map((item) => (
              <article
                key={item.id}
                className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 transition-all duration-200 hover:border-gray-200 hover:shadow-sm"
              >
                <p className="inline-flex self-start rounded-full bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-400">
                  {new Date(item.published_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
                <p className="flex-1 line-clamp-5 text-sm leading-relaxed text-gray-500">{item.summary}</p>
                {item.pdf_url && (
                  <div className="mt-auto">
                    <Button
                      as="a"
                      href={toAbsoluteUploadUrl(item.pdf_url)}
                      target="_blank"
                      rel="noreferrer"
                      size="sm"
                    >
                      Open PDF
                    </Button>
                  </div>
                )}
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No newsletters uploaded"
            description="Newsletter editions will be listed here as soon as they are published."
          />
        )
      )}
    </section>
  );
}
