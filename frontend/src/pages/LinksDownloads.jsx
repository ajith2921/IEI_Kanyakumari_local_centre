import SectionHeader from "../components/SectionHeader";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import { SkeletonRows } from "../components/Skeletons";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import useFetchList from "../hooks/useFetchList";
import { publicApi, toAbsoluteUploadUrl } from "../services/api";

const usefulLinks = [
  { label: "The Institution of Engineers (India)", href: "https://www.ieindia.org" },
  { label: "AICTE", href: "https://www.aicte-india.org" },
  { label: "NPTEL", href: "https://nptel.ac.in" },
];

export default function LinksDownloads() {
  const { data, loading, error, reload } = useFetchList(publicApi.getDownloads);

  return (
    <section className="page-shell section-block">
      <SectionHeader
        eyebrow="Resources"
        title="Links & Downloads"
        description="Access useful engineering resources and downloadable chapter documents."
      />

      <div className="mb-10 grid gap-5 md:grid-cols-3">
        {usefulLinks.map((item) => (
          <Card
            key={item.href}
            as="a"
            href={item.href}
            target="_blank"
            rel="noreferrer"
            interactive
            className="p-5 text-sm font-medium text-brand-700"
          >
            {item.label}
          </Card>
        ))}
      </div>

      {loading && <SkeletonRows count={4} />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && (
        data.length > 0 ? (
          <div className="grid gap-4">
            {data.map((file) => (
              <Card
                key={file.id}
                interactive
                className="flex flex-col items-start justify-between gap-4 p-5 md:flex-row md:items-center"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{file.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-600">{file.description}</p>
                </div>
                <Button as="a" href={toAbsoluteUploadUrl(file.pdf_url)} target="_blank" rel="noreferrer">
                  Download PDF
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No files uploaded"
            description="Downloadable documents will appear here once they are added."
          />
        )
      )}
    </section>
  );
}
