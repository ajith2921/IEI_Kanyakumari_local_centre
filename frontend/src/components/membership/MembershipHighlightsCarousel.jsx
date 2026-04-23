import { useEffect, useState } from "react";

const highlightItems = [
  {
    title: "Corporate Member Travel Benefits",
    detail: "Member-focused partnerships and benefit channels for professional travel and events.",
    icon: "✈️",
    badge: "Travel",
  },
  {
    title: "Technical Merchandise and Branding",
    detail: "Institutional identity and chapter-connected merchandise for active members.",
    icon: "🎖️",
    badge: "Branding",
  },
  {
    title: "Career and Networking Support",
    detail: "Career manager alignment, chapter networking, and professional visibility tracks.",
    icon: "🤝",
    badge: "Career",
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
    <section className="premium-panel rounded-2xl p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow-chip">Member Highlights</p>
          <h3 className="mt-2 text-xl font-semibold text-gray-900">Member Privileges</h3>
        </div>
        <span className="rounded-full border border-[#0b3a67]/20 bg-[#f0f6ff] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#0b3a67]">
          {activeIndex + 1} / {highlightItems.length}
        </span>
      </div>

      <article key={active.title} className="rounded-xl border border-[#d9e2ef] bg-gradient-to-br from-[#f5f9ff] to-white p-5 animate-fade-up">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-[#d3deeb] bg-white text-xl shadow-sm">
            {active.icon}
          </span>
          <div>
            <span className="inline-block rounded-full border border-[#0b3a67]/15 bg-[#f0f5ff] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#0b3a67]">
              {active.badge}
            </span>
            <h4 className="mt-1.5 text-base font-semibold text-gray-900">{active.title}</h4>
            <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{active.detail}</p>
          </div>
        </div>
      </article>

      <div className="mt-4 flex items-center gap-2">
        {highlightItems.map((item, index) => (
          <button
            key={item.title}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`focus-ring h-1.5 rounded-full transition-all duration-200 ${
              index === activeIndex ? "w-9 bg-[#0b3a67]" : "w-3 bg-gray-200 hover:bg-gray-300"
            }`}
            aria-label={`Show highlight ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
