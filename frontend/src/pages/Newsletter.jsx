import SectionHeader from "../components/SectionHeader";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import { SkeletonRows } from "../components/Skeletons";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
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
              <Card key={item.id} interactive className="p-6 md:p-7">
                <p className="mb-3 inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-brand-700">
                  {new Date(item.published_at).toLocaleDateString()}
                </p>
                <h3 className="heading-h3 mb-3 font-semibold text-gray-900">{item.title}</h3>
                <p className="mb-5 line-clamp-5 leading-relaxed text-gray-600">{item.summary}</p>
                {item.pdf_url && (
                  <Button as="a" href={toAbsoluteUploadUrl(item.pdf_url)} target="_blank" rel="noreferrer">
                    Open PDF
                  </Button>
                )}
              </Card>
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
