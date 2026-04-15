import SectionHeader from "../components/SectionHeader";
import ErrorState from "../components/ErrorState";
import { SkeletonRows } from "../components/Skeletons";
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
        <div className="grid gap-6 md:grid-cols-2">
          {data.map((item) => (
            <article key={item.id} className="section-card interactive-card p-6 md:p-7">
              <p className="mb-3 inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-brand-600">
                {new Date(item.published_at).toLocaleDateString()}
              </p>
              <h3 className="heading-h3 mb-3 font-black text-brand-800">{item.title}</h3>
              <p className="mb-5 line-clamp-5 leading-relaxed text-slate-600">{item.summary}</p>
              {item.pdf_url && (
                <a
                  href={toAbsoluteUploadUrl(item.pdf_url)}
                  target="_blank"
                  rel="noreferrer"
                  className="focus-ring inline-flex rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand-800"
                >
                  Open PDF
                </a>
              )}
            </article>
          ))}
          {data.length === 0 && (
            <p className="rounded-xl border border-brand-100 bg-white p-4 text-slate-500">
              No newsletters uploaded yet.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
