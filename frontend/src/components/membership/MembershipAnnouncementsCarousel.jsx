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
    return [];
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
    <section className="premium-panel rounded-2xl p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow-chip">Announcement</p>
          <h3 className="mt-2 text-xl font-semibold text-gray-900">Notice and Circular Desk</h3>
        </div>
        <Button as={Link} to="/newsletter" variant="secondary" size="sm" className="w-full sm:w-auto">
          Bulletin Archive
        </Button>
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
          <div className="skeleton h-3 w-24 rounded-md" />
          <div className="skeleton mt-3 h-5 w-2/3 rounded-md" />
          <div className="skeleton mt-2 h-3 w-full rounded-md" />
          <div className="skeleton mt-1.5 h-3 w-4/5 rounded-md" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
          <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-gray-300" aria-hidden="true">
            <path d="M8 6h8M8 10h5M3 5.5A2.5 2.5 0 0 1 5.5 3h13A2.5 2.5 0 0 1 21 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 18.5v-13Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p className="text-sm font-medium text-gray-500">No notices published yet.</p>
          <p className="text-xs text-gray-400">New circulars and announcements will appear here automatically.</p>
        </div>
      ) : (
        <article key={active?.id} className="rounded-xl border border-gray-200 bg-gray-50 p-5 animate-fade-up">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-400">
            {formatDate(active?.published_at)}
          </p>
          <h4 className="mt-2 text-base font-semibold text-gray-900">{active?.title}</h4>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">{active?.summary || "No summary available."}</p>
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
