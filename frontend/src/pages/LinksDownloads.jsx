import SectionHeader from "../components/SectionHeader";
import ErrorState from "../components/ErrorState";
import { SkeletonRows } from "../components/Skeletons";
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
          <a
            key={item.href}
            href={item.href}
            target="_blank"
            rel="noreferrer"
            className="section-card interactive-card p-5 text-sm font-semibold text-brand-700"
          >
            {item.label}
          </a>
        ))}
      </div>

      {loading && <SkeletonRows count={4} />}
      {error && <ErrorState message={error} onRetry={reload} />}

      {!loading && !error && (
        <div className="grid gap-4">
          {data.map((file) => (
            <article
              key={file.id}
              className="section-card interactive-card flex flex-col items-start justify-between gap-4 p-5 md:flex-row md:items-center"
            >
              <div>
                <h3 className="text-lg font-black text-brand-800">{file.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{file.description}</p>
              </div>
              <a
                href={toAbsoluteUploadUrl(file.pdf_url)}
                target="_blank"
                rel="noreferrer"
                className="focus-ring rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand-800"
              >
                Download PDF
              </a>
            </article>
          ))}
          {data.length === 0 && (
            <p className="rounded-xl border border-brand-100 bg-white p-4 text-slate-500">
              No files uploaded yet.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
