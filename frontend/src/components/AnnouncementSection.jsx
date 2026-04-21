import { Link } from "react-router-dom";
import { toAbsoluteUploadUrl } from "../services/api";
import EmptyState from "./EmptyState";
import { SkeletonRows } from "./Skeletons";
import Button from "./ui/Button";

export default function AnnouncementSection({ newsletters, loading = false }) {
  return (
    <section className="border-b border-gray-200 bg-white">
      <div className="page-shell py-20">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow-chip mb-3">Announcement Desk</p>
            <h2 className="heading-h2 text-gray-900">Latest Announcements and Circulars</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-500">
              Stay updated with chapter notices, bulletin summaries, and publication references.
            </p>
          </div>
          <Button as={Link} to="/newsletter" variant="secondary" size="sm">
            Open Bulletin Archive
          </Button>
        </div>

        {loading ? (
          <SkeletonRows count={3} />
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {newsletters.map((item) => (
              <article
                key={item.id}
                className="flex h-full flex-col rounded-2xl border border-gray-200 bg-gray-50 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:bg-white hover:shadow-md"
                style={{ "--shadow-md": "0 4px 16px -2px rgb(0 0 0 / 0.08)" }}
              >
                <p className="mb-4 inline-flex self-start rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-semibold text-gray-500">
                  {new Date(item.published_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <h3 className="mb-3 text-base font-semibold leading-snug text-gray-900">{item.title}</h3>
                <p className="mb-6 flex-1 line-clamp-3 text-sm leading-relaxed text-gray-500">{item.summary}</p>
                <div className="mt-auto flex flex-wrap gap-2">
                  <Button as={Link} to="/newsletter" variant="secondary" size="sm">
                    More
                  </Button>
                  {item.pdf_url && (
                    <Button
                      as="a"
                      href={toAbsoluteUploadUrl(item.pdf_url)}
                      target="_blank"
                      rel="noreferrer"
                      size="sm"
                    >
                      Open PDF
                    </Button>
                  )}
                </div>
              </article>
            ))}
            {newsletters.length === 0 && (
              <EmptyState
                title="No announcements available"
                description="Fresh updates will appear here after publication."
                className="md:col-span-3"
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
}
