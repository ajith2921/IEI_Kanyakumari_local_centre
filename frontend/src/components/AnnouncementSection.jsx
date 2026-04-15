import { Link } from "react-router-dom";
import { SkeletonRows } from "./Skeletons";

export default function AnnouncementSection({ newsletters, loading = false }) {
  return (
    <section className="page-shell pb-16">
      <div className="section-card p-7 md:p-9">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow-chip mb-3">Updates</p>
            <h2 className="heading-h2 font-black text-brand-900">Latest Announcements</h2>
          </div>
          <Link
            to="/newsletter"
            className="focus-ring rounded-lg border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:-translate-y-0.5 hover:bg-brand-50"
          >
            View All Newsletters
          </Link>
        </div>

        {loading ? (
          <SkeletonRows count={3} />
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
          {newsletters.map((item) => (
            <article key={item.id} className="interactive-card rounded-xl border border-brand-100 bg-brand-50/40 p-5">
              <h3 className="mb-2 text-base font-black text-brand-900">{item.title}</h3>
              <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-slate-600">{item.summary}</p>
              <p className="text-xs font-semibold text-brand-600">
                {new Date(item.published_at).toLocaleDateString()}
              </p>
            </article>
          ))}
          {newsletters.length === 0 && (
            <p className="rounded-xl border border-dashed border-brand-200 bg-white p-4 text-sm text-slate-500">
              No announcements available.
            </p>
          )}
          </div>
        )}
      </div>
    </section>
  );
}
