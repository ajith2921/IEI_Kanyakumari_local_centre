import { useEffect, useState } from "react";

const highlightItems = [
  {
    title: "Corporate Member Travel Benefits",
    detail: "Member-focused partnerships and benefit channels for professional travel and events.",
  },
  {
    title: "Technical Merchandise and Branding",
    detail: "Institutional identity and chapter-connected merchandise for active members.",
  },
  {
    title: "Career and Networking Support",
    detail: "Career manager alignment, chapter networking, and professional visibility tracks.",
  },
];

export default function MembershipHighlightsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % highlightItems.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const active = highlightItems[activeIndex];

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-6">
      <p className="eyebrow-chip">Highlights</p>
      <h3 className="mt-2 text-xl font-semibold text-gray-900">Member Privileges</h3>

      <article key={active.title} className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-5 animate-fade-up">
        <h4 className="text-base font-semibold text-gray-900">{active.title}</h4>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">{active.detail}</p>
      </article>

      <div className="mt-4 flex items-center gap-2">
        {highlightItems.map((item, index) => (
          <button
            key={item.title}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`focus-ring h-1.5 rounded-full transition-all duration-200 ${
              index === activeIndex ? "w-9 bg-gray-900" : "w-3 bg-gray-300"
            }`}
            aria-label={`Show highlight ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
