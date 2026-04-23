import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";

function formatDate(value) {
  if (!value) return "Recently updated";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently updated";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function MembershipAnnouncementsCarousel({ newsletters = [], loading = false }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const items = useMemo(() => {
    if (Array.isArray(newsletters) && newsletters.length > 0) {
      return newsletters.slice(0, 6);
    }

    return [
      {
        id: "placeholder-1",
        title: "Membership Notice Desk",
        summary: "Latest announcements and circulars will appear here once published.",
        published_at: null,
      },
    ];
  }, [newsletters]);

  useEffect(() => {
    if (items.length <= 1) return undefined;

    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, 5200);

    return () => clearInterval(timer);
  }, [items.length]);

  useEffect(() => {
    if (activeIndex >= items.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, items.length]);

  const active = items[activeIndex];

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="eyebrow-chip">Announcement</p>
          <h3 className="mt-2 text-xl font-semibold text-gray-900">Notice and Circular Desk</h3>
        </div>
        <Button as={Link} to="/newsletter" variant="secondary" size="sm">
          Bulletin Archive
        </Button>
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-8 text-sm text-gray-500">
          Loading announcements...
        </div>
      ) : (
        <article key={active.id} className="rounded-xl border border-gray-200 bg-gray-50 p-5 animate-fade-up">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">
            {formatDate(active.published_at)}
          </p>
          <h4 className="mt-2 text-base font-semibold text-gray-900">{active.title}</h4>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">{active.summary || "No summary available."}</p>
        </article>
      )}

      <div className="mt-4 flex items-center gap-2">
        {items.map((item, index) => (
          <button
            key={item.id || item.title || String(index)}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`focus-ring h-1.5 rounded-full transition-all duration-200 ${
              index === activeIndex ? "w-9 bg-gray-900" : "w-3 bg-gray-300"
            }`}
            aria-label={`Show announcement ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
