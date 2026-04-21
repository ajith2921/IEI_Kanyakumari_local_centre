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
  const totalDownloads = data.length;

  return (
    <div className="bg-gray-50/50">
      <section className="page-shell section-block">
        <header className="relative mb-12 overflow-hidden rounded-3xl border border-gray-200 bg-white p-7 shadow-sm sm:p-9">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.1),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.08),transparent_42%)]" />

          <div className="relative">
            <SectionHeader
              eyebrow="Resources"
              title="Links and Downloads"
              description="Access verified engineering resources, chapter files, and publication-ready documents."
              className="mb-8"
            />

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">Verified Links</p>
                <p className="mt-1 text-xl font-semibold text-gray-900">{usefulLinks.length}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">Downloadable Files</p>
                <p className="mt-1 text-xl font-semibold text-gray-900">{loading ? "..." : totalDownloads}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">Access Mode</p>
                <p className="mt-1 text-sm font-semibold text-gray-900">Open Chapter Repository</p>
              </div>
            </div>
          </div>
        </header>

        {/* External links */}
        <section className="mb-12 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <SectionHeader
            eyebrow="Quick Access"
            title="Institutional and Learning Links"
            description="Shortcuts to core engineering institutions and technical learning platforms."
            className="mb-8"
          />
          <div className="grid gap-4 md:grid-cols-3">
            {usefulLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="focus-ring group flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm font-medium text-gray-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:bg-white hover:shadow-sm"
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
        </section>

        {/* Downloads */}
        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <SectionHeader
            eyebrow="Document Center"
            title="Chapter Downloads"
            description="Official circulars, forms, and chapter-level reference files."
            className="mb-8"
          />

          {loading && <SkeletonRows count={4} />}
          {error && <ErrorState message={error} onRetry={reload} />}

          {!loading && !error && (
            data.length > 0 ? (
              <div className="grid gap-3">
                {data.map((file) => (
                  <div
                    key={file.id}
                    className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-5 transition-all duration-200 hover:border-gray-300 hover:bg-white hover:shadow-sm md:flex-row md:items-center"
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
      </section>
    </div>
  );
}
