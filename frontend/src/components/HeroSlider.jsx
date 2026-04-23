import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "./ui/Button";

const noticeCards = [
  {
    title: "Live Events",
    items: ["Monthly Technical Seminars", "CPD Programs", "Workshop Sessions"],
  },
  {
    title: "Announcements",
    items: ["New Membership Applications", "Exam Schedule Updates", "Circular Downloads"],
  },
  {
    title: "Latest Circular",
    items: ["KYM Compliance Notice", "CEng Pathway Guidelines", "CPD Credit Updates"],
  },
];

const carouselCards = [
  {
    label: "NCVET",
    title: "Accredited Certification Courses",
  },
  {
    label: "KYM",
    title: "Know Your Member Compliance",
  },
  {
    label: "CPD",
    title: "Continuing Professional Development",
  },
  {
    label: "Events",
    title: "Technical Activities Calendar",
  },
];

export default function HeroSlider() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % carouselCards.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden border-b border-[#1c2647]/10 bg-[#dce0f5]">
      {/* Subtle wavy pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='20' viewBox='0 0 100 20'%3E%3Cpath d='M0 10 Q25 0 50 10 T100 10' fill='none' stroke='%231c2647' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: "100px 20px",
        }}
      />

      <div className="page-shell relative pb-16 pt-12 lg:pb-20 lg:pt-16">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          {/* Left: IEI Gothic title + tagline */}
          <div>
            <h1
              className="iei-gothic-title mb-3 text-4xl leading-[1.1] sm:text-5xl lg:text-[3.25rem]"
            >
              The Institution of Engineers (India)
            </h1>
            <p className="mb-2 text-lg font-medium italic text-[#800000] sm:text-xl">
              Engineering the Future, Honoring the Past
            </p>
            <p className="mb-6 text-sm font-semibold text-[#f4c430]">
              Kanyakumari Local Centre
            </p>

            <div className="mb-8 flex flex-wrap items-center gap-3">
              <Button
                as={Link}
                to="/membership"
                target="_blank"
                rel="noopener noreferrer"
                className="!bg-[#f4c430] !text-[#1c2647] hover:!bg-[#e5b42c]"
              >
                Become a Member
              </Button>
              <Button as={Link} to="/about" variant="secondary">
                Know More
              </Button>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#1c2647]/60">
              <span className="inline-flex items-center rounded-full border border-[#1c2647]/20 bg-white/60 px-3 py-1">
                Established 1920
              </span>
              <span className="inline-flex items-center rounded-full border border-[#1c2647]/20 bg-white/60 px-3 py-1">
                IEI HQ: Kolkata
              </span>
            </div>
          </div>

          {/* Right: Notice cards + carousel */}
          <div className="space-y-5">
            {/* Notice cards grid */}
            <div className="grid gap-3 sm:grid-cols-3">
              {noticeCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-xl bg-[#0c3c53] p-4 text-white"
                >
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#f4c430]">
                    {card.title}
                  </h3>
                  <ul className="space-y-1 text-xs text-white/80">
                    {card.items.slice(0, 2).map((item) => (
                      <li key={item} className="truncate">
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Carousel card */}
            <div className="relative rounded-2xl bg-[#0c3c53] p-5 shadow-lg">
              <div className="absolute right-5 top-5 flex gap-1.5">
                {carouselCards.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActive(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === active
                        ? "w-6 bg-[#f4c430]"
                        : "w-1.5 bg-white/30"
                    }`}
                    aria-label={`Go to card ${idx + 1}`}
                  />
                ))}
              </div>

              <div className="min-h-[120px]">
                {carouselCards.map((card, idx) => (
                  <div
                    key={card.label}
                    className={`absolute inset-0 flex items-center justify-between pl-1 pr-16 transition-opacity duration-500 ${
                      idx === active ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                  >
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#f4c430]">
                        {card.label}
                      </p>
                      <p className="text-lg font-medium text-white">
                        {card.title}
                      </p>
                    </div>
                    <div className="text-right">
                      <Link
                        to="/technical-activities"
                        className="text-sm font-medium text-white/70 hover:text-[#f4c430]"
                      >
                        More →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}