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

const quickActions = [
  { to: "/technical-activities", title: "View Events", hint: "Workshops and lectures" },
  { to: "/members", title: "Check Members", hint: "Leadership and office bearers" },
  { to: "/links-downloads", title: "Download Resources", hint: "Official documents" },
  { to: "/contact", title: "Contact Organization", hint: "Send your query" },
  { to: "/membership-form", title: "Apply Membership", hint: "Submit application" },
];

export default function HeroSlider() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="page-shell section-block !pb-10 md:!pb-12">
      <div
        className="banner-grid relative overflow-hidden rounded-3xl p-6 text-white shadow-[0_24px_60px_-32px_rgba(37,99,235,0.6)] md:p-8 lg:p-10"
        style={{
          background: "linear-gradient(135deg, #312e81 0%, #4338ca 52%, #2563eb 100%)",
        }}
      >
        <div className="absolute -left-16 top-6 h-56 w-56 rounded-full bg-cyan-300/18 blur-2xl" />
        <div className="absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-sky-300/12 blur-2xl" />

        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:gap-10">
          <div>
            <div key={slides[active].title} className="hero-reveal">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">
                Premier Institutional Chapter
              </p>
              <h1 className="heading-h1 mb-4 min-h-[120px] font-semibold text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.35)]">
                {slides[active].title}
              </h1>
              <p className="mb-6 max-w-2xl text-base text-blue-50 [text-shadow:0_1px_8px_rgba(0,0,0,0.3)] md:text-lg">
                {slides[active].subtitle}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                as={Link}
                to="/membership-form"
                variant="secondary"
                className="border-transparent bg-white text-brand-700"
              >
                Apply for Membership
              </Button>
              <Button
                as={Link}
                to="/technical-activities"
                variant="secondary"
                className="border border-white/60 bg-white/95 text-brand-700 hover:bg-white"
              >
                Explore Events
              </Button>
            </div>

            <div className="relative z-10 mt-7 flex gap-2">
              {slides.map((slide, index) => (
                <button
                  key={slide.title}
                  type="button"
                  onClick={() => setActive(index)}
                  className={`focus-ring h-2.5 rounded-full transition ${
                    index === active ? "w-10 bg-white" : "w-5 bg-white/45"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/25 bg-white/92 p-4 text-brand-900 shadow-xl md:p-5">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Popular Tasks
            </h2>
            <div className="grid gap-2">
              {quickActions.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="focus-ring rounded-xl border border-slate-200 bg-white px-4 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-sm"
                >
                  <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-600">{item.hint}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
