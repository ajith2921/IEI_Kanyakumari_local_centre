import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Button from "./ui/Button";

const slides = [
  {
    title: "A Professional Home for Engineers in Kanyakumari",
    subtitle:
      "Access events, resources, publications, and membership services in one clear platform.",
  },
  {
    title: "Learn, Participate, and Contribute",
    subtitle:
      "Explore technical activities and chapter initiatives designed for practicing engineers and students.",
  },
  {
    title: "Stay Connected With Institutional Updates",
    subtitle:
      "View newsletters, member updates, and official downloads without friction.",
  },
];

const defaultStats = [
  { value: "100+", label: "Active Members" },
  { value: "50+", label: "Events Conducted" },
  { value: "8", label: "Engineering Divisions" },
];

export default function HeroSlider({ stats = defaultStats }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden border-b border-gray-200 bg-white">
      {/* Subtle dot-grid background */}
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-40" />

      <div className="page-shell relative pb-24 pt-12 sm:pt-14 lg:pb-28 lg:pt-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">

          {/* Left: Text content */}
          <div>
            <p className="eyebrow-chip mb-5">
              Premier Institutional Chapter · Est. 1920
            </p>
            <div key={active} className="animate-fade-up">
              <h1
                className="heading-h1 mb-6 text-gray-900"
                style={{ minHeight: "7rem" }}
              >
                {slides[active].title}
              </h1>
              <p className="mb-8 max-w-xl text-base leading-relaxed text-gray-500">
                {slides[active].subtitle}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button as={Link} to="/membership-form">
                Apply for Membership
              </Button>
              <Button as={Link} to="/technical-activities" variant="secondary">
                Explore Events
              </Button>
            </div>

            {/* Slide dots */}
            <div className="mt-10 flex gap-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.title}
                  type="button"
                  onClick={() => setActive(index)}
                  className={`focus-ring h-1 rounded-full transition-all duration-300 ${
                    index === active ? "w-8 bg-gray-900" : "w-2 bg-gray-200"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Stats strip */}
            <div className="mt-12 flex gap-10 border-t border-gray-100 pt-8">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-semibold tracking-tight text-gray-900">
                    {stat.value}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Quick actions card */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="eyebrow-chip mb-5">Quick Access</p>
            <div className="grid gap-2.5">
              {[
                { to: "/technical-activities", title: "View Events", hint: "Workshops and lectures" },
                { to: "/members", title: "Check Members", hint: "Leadership and office bearers" },
                { to: "/links-downloads", title: "Download Resources", hint: "Official documents" },
                { to: "/contact", title: "Contact Organization", hint: "Send your query" },
                { to: "/membership-form", title: "Apply Membership", hint: "Submit application" },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="focus-ring group flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3.5 transition-all duration-200 hover:border-gray-200 hover:bg-white hover:shadow-sm"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-400">{item.hint}</p>
                  </div>
                  <svg
                    className="h-4 w-4 flex-shrink-0 text-gray-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-gray-500"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
