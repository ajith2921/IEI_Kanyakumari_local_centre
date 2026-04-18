import SectionHeader from "../components/SectionHeader";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import { SkeletonRows } from "../components/Skeletons";
import Button from "../components/ui/Button";
import useFetchList from "../hooks/useFetchList";
import { publicApi, toAbsoluteUploadUrl } from "../services/api";

const usefulLinks = [
  { label: "The Institution of Engineers (India)", href: "https://www.ieindia.org" },
  { label: "AICTE",  href: "https://www.aicte-india.org" },
  { label: "NPTEL",  href: "https://nptel.ac.in" },
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

      {/* External links */}
      <div className="mb-12 grid gap-4 md:grid-cols-3">
        {usefulLinks.map((item) => (
          <a
            key={item.href}
            href={item.href}
            target="_blank"
            rel="noreferrer"
            className="focus-ring group flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-5 py-4 text-sm font-medium text-gray-600 transition-all duration-200 hover:border-gray-200 hover:shadow-sm"
          >
            {item.label}
            <svg
              className="h-4 w-4 flex-shrink-0 text-gray-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-gray-500"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path d="M4 8h8M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        ))}
      </div>

      {/* Downloads */}
      {loading && <SkeletonRows count={4} />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && (
        data.length > 0 ? (
          <div className="grid gap-3">
            {data.map((file) => (
              <div
                key={file.id}
                className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-5 transition-all duration-200 hover:border-gray-200 hover:shadow-sm md:flex-row md:items-center"
              >
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{file.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500">{file.description}</p>
                </div>
                <Button as="a" href={toAbsoluteUploadUrl(file.pdf_url)} target="_blank" rel="noreferrer" size="sm">
                  Download PDF
                </Button>
              </div>
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
