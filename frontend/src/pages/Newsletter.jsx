import SectionHeader from "../components/SectionHeader";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import { SkeletonRows } from "../components/Skeletons";
import Button from "../components/ui/Button";
import useFetchList from "../hooks/useFetchList";
import { publicApi, toAbsoluteUploadUrl } from "../services/api";

export default function Newsletter() {
  const { data, loading, error, reload } = useFetchList(publicApi.getNewsletters);
  const totalEditions = data.length;

  return (
    <div className="bg-gray-50/50">
      <section className="page-shell section-block">
        <header className="relative mb-12 overflow-hidden rounded-3xl border border-gray-200 bg-white p-7 shadow-sm sm:p-9">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.1),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.08),transparent_42%)]" />

          <div className="relative">
            <SectionHeader
              eyebrow="Publications"
              title="Newsletter and Bulletin Archive"
              description="Read chapter updates, technical briefs, institutional announcements, and publication summaries."
              className="mb-8"
            />

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">Published Editions</p>
                <p className="mt-1 text-xl font-semibold text-gray-900">{loading ? "..." : totalEditions}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">Publication Type</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">Newsletter + Circulars</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">Access</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">Open PDF Repository</p>
              </div>
            </div>
          </div>
        </header>

        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          {loading && <SkeletonRows count={4} />}
          {error && <ErrorState message={error} onRetry={reload} />}

          {!loading && !error && (
            data.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {data.map((item) => (
                  <article
                    key={item.id}
                    className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:bg-white hover:shadow-sm"
                  >
                    <p className="inline-flex self-start rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-gray-500">
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
      </section>
    </div>
  );
}
