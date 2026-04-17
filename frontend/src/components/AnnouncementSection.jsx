import { Link } from "react-router-dom";
import EmptyState from "./EmptyState";
import { SkeletonRows } from "./Skeletons";
import Button from "./ui/Button";
import Card from "./ui/Card";

export default function AnnouncementSection({ newsletters, loading = false }) {
  return (
    <section className="page-shell pb-16">
      <Card className="p-7 md:p-9">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow-chip mb-3">Updates</p>
            <h2 className="heading-h2 font-semibold text-gray-900">Latest Announcements</h2>
          </div>
          <Button
            as={Link}
            to="/newsletter"
            variant="secondary"
          >
            View All Newsletters
          </Button>
        </div>

        {loading ? (
          <SkeletonRows count={3} />
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {newsletters.map((item) => (
              <Card key={item.id} interactive className="bg-slate-50/50 p-5">
                <h3 className="mb-2 text-base font-semibold text-gray-900">{item.title}</h3>
                <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-gray-600">{item.summary}</p>
                <p className="text-xs font-medium text-brand-700">
                  {new Date(item.published_at).toLocaleDateString()}
                </p>
              </Card>
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
      </Card>
    </section>
  );
}
