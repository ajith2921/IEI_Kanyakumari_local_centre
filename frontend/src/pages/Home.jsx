import { Link } from "react-router-dom";
import HeroSlider from "../components/HeroSlider";
import SectionHeader from "../components/SectionHeader";
import MemberCard from "../components/MemberCard";
import EventCard from "../components/EventCard";
import AnnouncementSection from "../components/AnnouncementSection";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import { SkeletonGrid } from "../components/Skeletons";
import Button from "../components/ui/Button";
import useFetchList from "../hooks/useFetchList";
import { publicApi } from "../services/api";

const shortcutCards = [
  {
    title: "Upcoming Events",
    description: "Find lectures, workshops, and chapter activities.",
    to: "/technical-activities",
  },
  {
    title: "Member Directory",
    description: "View office bearers and professional members.",
    to: "/members",
  },
  {
    title: "Download Center",
    description: "Access forms, circulars, and publications.",
    to: "/links-downloads",
  },
];

const aboutPillars = [
  {
    title: "Professional Development",
    detail: "We organize seminars, lectures, and upskilling sessions for engineers across disciplines.",
  },
  {
    title: "Student Engagement",
    detail: "Through chapter activities and mentoring programs, students gain practical and industry-ready perspectives.",
  },
  {
    title: "Knowledge Sharing",
    detail: "Newsletter publications and panel discussions enable continuous technical learning.",
  },
];

const focusAreas = [
  "Technical Seminars & Conferences",
  "Workshops & Faculty Development Programmes",
  "Industrial Visits",
  "Student Chapter Activities",
  "Career Guidance Programmes",
  "Entrepreneurship & Innovation Support",
  "Research Promotion",
  "Community Engineering Solutions",
];

export default function Home() {
  const members = useFetchList(publicApi.getMembers);
  const activities = useFetchList(publicApi.getActivities);
  const newsletters = useFetchList(publicApi.getNewsletters);

  return (
    <>
      {/* ── HERO ────────────────────────────────────────── */}
      <HeroSlider />

      {/* ── WELCOME — gray-50 bg ─────────────────────────── */}
      <section className="bg-gray-50/60">
        <div className="page-shell py-20">
          <div className="grid gap-12 md:grid-cols-2 md:items-start">
            {/* Welcome text */}
            <div>
              <p className="eyebrow-chip mb-4">Welcome</p>
              <h2 className="heading-h2 mb-6 text-gray-900">
                The Institution of Engineers (India) —{" "}
                <span className="text-gray-400">Kanyakumari Local Centre</span>
              </h2>
              <p className="mb-4 text-base leading-relaxed text-gray-500">
                IEI KKLC is a dynamic professional body committed to advancing engineering excellence,
                innovation, technical leadership, and societal development. We serve engineers,
                academicians, and students across Kanyakumari District and surrounding regions.
              </p>
              <p className="mb-8 text-sm leading-relaxed text-gray-400">
                We strive to build a strong engineering ecosystem through knowledge sharing,
                professional networking, industry collaboration, and community service.
              </p>
              <Button as={Link} to="/membership-form" variant="secondary" size="sm">
                Become a Member
              </Button>
            </div>

            {/* Focus areas */}
            <div>
              <p className="eyebrow-chip mb-5">Our Focus Areas</p>
              <ul className="grid gap-3">
                {focusAreas.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="h-1 w-1 flex-shrink-0 rounded-full bg-gray-300" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── CHAIRMAN'S MESSAGE — white bg ─────────────────── */}
      <section className="bg-white">
        <div className="page-shell py-20">
          <div className="max-w-3xl">
            <p className="eyebrow-chip mb-5">Chairman's Message</p>
            <blockquote className="mb-8 border-l-2 border-gray-200 pl-6 text-lg leading-relaxed text-gray-500 italic">
              "Engineering is not just a profession — it is the foundation of progress. Our centre is
              dedicated to empowering engineers, motivating students, strengthening institutions, and
              serving society through innovative ideas and technical excellence. We invite all engineers,
              professionals, industries, and students to actively engage with KKLC and become part of a
              meaningful professional network."
            </blockquote>
            <div>
              <p className="text-sm font-semibold text-gray-900">Dr. M. Marsaline Beno</p>
              <p className="mt-0.5 text-xs text-gray-400">Chairman, IEI Kanyakumari Local Centre</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── QUICK ACCESS — gray-50 bg ─────────────────────── */}
      <section className="bg-gray-50/60">
        <div className="page-shell py-20">
          <div className="grid gap-4 md:grid-cols-3">
            {shortcutCards.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="focus-ring group flex h-full flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-200 hover:shadow-md"
              >
                <h2 className="text-base font-semibold text-gray-900">
                  {item.title}
                </h2>
                <p className="flex-1 text-sm leading-relaxed text-gray-500">{item.description}</p>
                <span className="text-xs font-medium text-gray-300 transition-colors duration-200 group-hover:text-gray-900">
                  Explore →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT — white bg ──────────────────────────────── */}
      <section className="bg-white">
        <div className="page-shell py-20">
          <SectionHeader
            eyebrow="Who We Are"
            title="About IEI Kanyakumari Local Centre"
            description="A vibrant institutional platform dedicated to engineering excellence, networking, and professional contribution."
          />
          <p className="mb-12 max-w-3xl text-sm leading-relaxed text-gray-500">
            IEI Kanyakumari Local Centre serves as a hub for engineers, educators, and students,
            focusing on technical competence and community impact. Our programs bridge academia and
            industry, enabling members to stay relevant in evolving technologies while upholding ethical
            and professional standards.
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {aboutPillars.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-gray-100 bg-gray-50/60 p-6 transition-all duration-200 hover:border-gray-200 hover:bg-white hover:shadow-sm"
              >
                <h3 className="mb-2 text-sm font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MEMBERS — gray-50 bg ──────────────────────────── */}
      <section className="bg-gray-50/60">
        <div className="page-shell py-20">
          <SectionHeader
            eyebrow="Leadership"
            title="Office Bearers & Members"
            description="Meet our experienced team that drives institutional and technical initiatives."
            action={
              <Button as={Link} to="/members" variant="secondary" size="sm">
                View All Members
              </Button>
            }
          />
          {members.loading && <SkeletonGrid count={6} />}
          {members.error && <ErrorState message={members.error} onRetry={members.reload} />}
          {!members.loading && !members.error && (
            members.data.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                {members.data.slice(0, 6).map((member) => (
                  <div key={member.id}>
                    <MemberCard member={member} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No members found"
                description="Member profiles will appear here once published."
              />
            )
          )}
        </div>
      </section>

      {/* ── EVENTS — white bg ─────────────────────────────── */}
      <section className="bg-white">
        <div className="page-shell py-20">
          <SectionHeader
            eyebrow="Events"
            title="Technical Activities"
            description="A preview of workshops, lectures, and technical engagement programs."
            action={
              <Button as={Link} to="/technical-activities" variant="secondary" size="sm">
                View All Events
              </Button>
            }
          />
          {activities.loading && <SkeletonGrid count={3} />}
          {activities.error && <ErrorState message={activities.error} onRetry={activities.reload} />}
          {!activities.loading && !activities.error && (
            activities.data.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                {activities.data.slice(0, 3).map((activity) => (
                  <div key={activity.id}>
                    <EventCard activity={activity} />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No activities published"
                description="Upcoming technical activities will be listed here."
              />
            )
          )}
        </div>
      </section>

      {/* ── ANNOUNCEMENTS ─────────────────────────────────── */}
      <AnnouncementSection
        newsletters={newsletters.data.slice(0, 3)}
        loading={newsletters.loading && !newsletters.error}
      />
      {newsletters.error && (
        <section className="page-shell pb-20">
          <ErrorState message={newsletters.error} onRetry={newsletters.reload} />
        </section>
      )}
    </>
  );
}
