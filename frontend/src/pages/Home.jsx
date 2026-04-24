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

const membershipServiceCards = [
  {
    title: "Become a Member",
    description: "Start your IEI membership application and activate professional access.",
    to: "/membership#be-member",
    cta: "Know More",
  },
  {
    title: "Chartered Engineer",
    description: "Follow the CEng pathway for design, valuation, and project authority work.",
    to: "/membership#chartered-engineer",
    cta: "Apply Pathway",
  },
  {
    title: "Professional Engineer",
    description: "Advance to PEng-grade recognition for high-responsibility engineering practice.",
    to: "/membership#professional-engineer",
    cta: "Explore Track",
  },
  {
    title: "Section A & B Examination",
    description: "Get exam-oriented support for forms, admit cards, and progression planning.",
    to: "/membership#section-ab",
    cta: "Exam Services",
  },
  {
    title: "Journals & Publications",
    description: "Browse IEI-oriented journals, publications, and knowledge resources.",
    to: "/membership#publications",
    cta: "View Resources",
  },
  {
    title: "Events & CPD",
    description: "Join seminars, workshops, and continuous professional development activities.",
    to: "/membership#network-activities",
    cta: "Join Programs",
  },
];

const highlightPanels = [
  {
    title: "Career Manager Support",
    detail:
      "Build professional visibility through portfolio positioning, chapter networking, and mentorship channels.",
    to: "/membership#network-activities",
  },
  {
    title: "Downloads and Circulars",
    detail:
      "Get operational resources quickly including forms, policy notes, and chapter documentation.",
    to: "/links-downloads",
  },
  {
    title: "Technical Activities Calendar",
    detail:
      "Track this month technical programs, event schedules, and community-led engineering sessions.",
    to: "/technical-activities",
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

const heroTrustSignals = [
  "Established institutional legacy since 1920",
  "Professional-grade certifications and pathways",
  "Verified technical forums led by domain experts",
];

const chairmanMessage =
  '"Engineering is not just a profession — it is the foundation of progress. Our centre is dedicated to empowering engineers, motivating students, strengthening institutions, and serving society through innovative ideas and technical excellence. We invite all engineers, professionals, industries, and students to actively engage with KKLC and become part of a meaningful professional network."';

function getDivisionCount(membersList) {
  const divisions = new Set();

  membersList.forEach((member) => {
    const position = String(member?.position || "").trim();
    const match = position.match(/^(.*)\s+Committee Member$/i);
    if (match?.[1]) {
      divisions.add(match[1].trim());
    }
  });

  return divisions.size;
}

function getStaggerClass(index) {
  const sequence = ["stagger-1", "stagger-2", "stagger-3", "stagger-4", "stagger-5"];
  return sequence[index % sequence.length];
}

export default function Home() {
  const members = useFetchList(publicApi.getMembers);
  const activities = useFetchList(publicApi.getActivities);
  const newsletters = useFetchList(publicApi.getNewsletters);
  const cleanChairmanMessage = chairmanMessage.replace(/\s+/g, " ").trim();
  const heroMetrics = [
    {
      value: members.loading ? "..." : String(members.data.length),
      label: "Corporate Members",
    },
    {
      value: activities.loading ? "..." : String(activities.data.length),
      label: "Technical Programs",
    },
    {
      value: members.loading ? "..." : String(getDivisionCount(members.data)),
      label: "Engineering Divisions",
    },
  ];

  const isMembershipTarget = (to = "") => String(to).startsWith("/membership");

  return (
    <>
      {/* ── HERO ────────────────────────────────────────── */}
      <HeroSlider />

      {/* ── PREMIUM HERO COMPANION ─────────────────────── */}
      <section className="home-premium-shell border-b border-gray-200">
        <div className="page-shell py-8 sm:py-10">
          <div className="home-premium-panel animate-fade-up">
            <div className="grid gap-7 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-end">
              <div>
                <p className="home-premium-kicker">Institutional Excellence</p>
                <h2 className="home-premium-title mt-3">
                  Engineering leadership shaped for modern practice and long-term impact.
                </h2>
                <p className="home-premium-copy mt-4 max-w-2xl">
                  Explore a professional platform that combines institutional credibility,
                  skill growth, and member-first service delivery across the district.
                </p>

                <div className="home-premium-cta-row mt-6">
                  <Button
                    as={Link}
                    to="/membership"
                    target="_blank"
                    rel="noopener noreferrer"
                    size="sm"
                    className="home-premium-primary-action home-premium-cta-button"
                  >
                    Become a Member
                  </Button>
                  <Button
                    as={Link}
                    to="/technical-activities"
                    variant="secondary"
                    size="sm"
                    className="home-premium-secondary-action home-premium-cta-button"
                  >
                    Explore Technical Calendar
                  </Button>
                </div>

                <div className="mt-5 flex flex-wrap gap-2.5">
                  {heroTrustSignals.map((signal) => (
                    <span key={signal} className="home-premium-pill">
                      {signal}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                {heroMetrics.map((metric) => (
                  <div key={metric.label} className="home-premium-metric-card">
                    <p className="home-premium-metric-value">{metric.value}</p>
                    <p className="home-premium-metric-label">{metric.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── KYM SERVICE DESK ─────────────────────────────── */}
      <section className="border-b border-gray-200 bg-gradient-to-b from-white to-gray-50/40">
        <div className="page-shell home-rhythm-compact">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow-chip mb-2">KYM Service Desk</p>
              <h2 className="home-premium-section-title">
                Membership and Certification Services
              </h2>
            </div>
            <Button
              as={Link}
              to="/membership"
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              size="sm"
              className="home-premium-secondary-action home-section-action-btn"
            >
              Open Membership Portal
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {membershipServiceCards.map((item, idx) => (
              <Link
                key={item.title}
                to={item.to}
                target="_blank"
                rel="noopener noreferrer"
                className={`focus-ring home-premium-card home-reveal-card animate-fade-up ${getStaggerClass(idx)} group flex h-full flex-col rounded-2xl border border-gray-200 bg-gray-50 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:bg-white hover:shadow-sm`}
              >
                <h3 className="text-base font-semibold leading-tight text-gray-900">{item.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-500">{item.description}</p>
                <span className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-gray-400 transition-colors duration-200 group-hover:text-gray-900">
                  {item.cta}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── WELCOME — gray-50 bg ─────────────────────────── */}
      <section className="bg-gray-50/60">
        <div className="page-shell home-rhythm-shell">
          <div className="grid gap-8 md:grid-cols-2 md:items-start md:gap-10">
            {/* Welcome text */}
            <div className="max-w-2xl">
              <h2 className="home-premium-section-title mb-3">
                Welcome
              </h2>
              <p className="home-premium-display mb-5 max-w-[24ch]">
                The Institution of Engineers (India) —{" "}
                <span className="text-[color:var(--home-premium-accent)]">Kanyakumari Local Centre</span>
              </p>
              <p className="home-premium-lead mb-3 max-w-[62ch]">
                IEI KKLC is a dynamic professional body committed to advancing engineering excellence, innovation, technical leadership, and societal development. We serve engineers, academicians, and students across Kanyakumari District and surrounding regions.
              </p>
              <p className="home-premium-copy mb-6 max-w-[62ch] sm:mb-7">
                We strive to build a strong engineering ecosystem through knowledge sharing,
                professional networking, industry collaboration, and community service.
              </p>
              <Button
                as={Link}
                to="/membership"
                target="_blank"
                rel="noopener noreferrer"
                variant="primary"
                size="sm"
                className="home-premium-primary-action home-section-action-btn"
              >
                Become a Member
              </Button>
            </div>

            {/* Focus areas */}
            <div className="home-premium-card home-premium-glass animate-fade-up stagger-2 rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-sm sm:p-7">
              <h3 className="home-premium-subtitle mb-4">
                Our Focus Areas
              </h3>
              <ul className="grid gap-2.5 sm:gap-3">
                {focusAreas.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-6 text-gray-600">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-400" />
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
        <div className="page-shell home-rhythm-shell">
          <div className="mx-auto max-w-3xl">
            <h2 className="home-premium-section-title mb-5">
              Chairman&apos;s Message
            </h2>
            <div className="home-premium-card animate-fade-up stagger-2 rounded-2xl border border-gray-200 bg-gray-50/60 p-6 sm:p-8">
              <blockquote className="home-premium-quote mb-4 mr-auto max-w-[66ch] text-left italic sm:mb-5">
                {cleanChairmanMessage}
              </blockquote>
              <div className="mt-5 text-left">
                <p className="text-sm font-semibold text-gray-900">Dr. M. Marsaline Beno</p>
                <p className="mt-0.5 text-xs text-gray-400">Chairman, IEI Kanyakumari Local Centre</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HIGHLIGHTS — gray-50 bg ───────────────────────── */}
      <section className="bg-gray-50/60">
        <div className="page-shell home-rhythm-wide">
          <SectionHeader
            eyebrow="Highlights"
            title="Member Privileges and Service Channels"
            description="Key access points modeled around institutional workflows for growth, resources, and participation."
            className="mb-9 sm:mb-11"
            titleClassName="home-premium-section-title"
            descriptionClassName="home-premium-section-copy"
          />
          <div className="grid gap-4 md:grid-cols-3">
            {highlightPanels.map((item, idx) => (
              <Link
                key={item.title}
                to={item.to}
                target={isMembershipTarget(item.to) ? "_blank" : undefined}
                rel={isMembershipTarget(item.to) ? "noopener noreferrer" : undefined}
                className={`focus-ring home-premium-card home-reveal-card animate-fade-up ${getStaggerClass(idx)} group flex h-full flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-200 hover:shadow-md`}
              >
                <h2 className="text-base font-semibold text-gray-900">
                  {item.title}
                </h2>
                <p className="flex-1 text-sm leading-relaxed text-gray-500">{item.detail}</p>
                <span className="text-xs font-medium text-gray-300 transition-colors duration-200 group-hover:text-gray-900">
                  Learn More →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT — white bg ──────────────────────────────── */}
      <section className="bg-white">
        <div className="page-shell home-rhythm-shell">
          <SectionHeader
            eyebrow="Who We Are"
            title="About IEI Kanyakumari Local Centre"
            description="A vibrant institutional platform dedicated to engineering excellence, networking, and professional contribution."
            contentWidthClassName="max-w-none"
            className="mb-7 sm:mb-9"
            titleClassName="home-premium-section-title"
            descriptionClassName="home-premium-section-copy"
          />
          <p className="home-premium-lead mb-8 max-w-none sm:mb-10">
            IEI Kanyakumari Local Centre serves as a hub for engineers, educators, and students,
            focusing on technical competence and community impact. Our programs bridge academia and
            industry, enabling members to stay relevant in evolving technologies while upholding ethical
            and professional standards.
          </p>
          <div className="grid gap-5 sm:gap-6 md:grid-cols-3">
            {aboutPillars.map((item, idx) => (
              <div
                key={item.title}
                className={`home-premium-card animate-fade-up ${getStaggerClass(idx)} h-full rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-200 hover:shadow-sm`}
              >
                <h3 className="mb-2 text-base font-semibold text-gray-900">{item.title}</h3>
                <p className="text-sm leading-6 text-gray-600">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MEMBERS — gray-50 bg ──────────────────────────── */}
      <section className="bg-gray-50/60">
        <div className="page-shell home-rhythm-wide">
          <SectionHeader
            eyebrow="Leadership"
            title="Office Bearers & Members"
            description="Meet our experienced team that drives institutional and technical initiatives."
            titleClassName="home-premium-section-title"
            descriptionClassName="home-premium-section-copy"
            action={
              <div className="home-section-action-wrap">
                <Button
                  as={Link}
                  to="/members"
                  variant="secondary"
                  size="sm"
                  className="home-premium-secondary-action home-section-action-btn"
                >
                  View All Members
                </Button>
              </div>
            }
          />
          {members.loading && <SkeletonGrid count={6} />}
          {members.error && <ErrorState message={members.error} onRetry={members.reload} />}
          {!members.loading && !members.error && (
            members.data.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                {members.data.slice(0, 6).map((member, idx) => (
                  <div key={member.id} className={`home-list-card-shell animate-fade-up ${getStaggerClass(idx)}`}>
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

      {/* ── EVENTS — dark navy bg ──────────────────────────── */}
      <section className="home-premium-dark-shell bg-[#05154B]">
        <div className="page-shell home-rhythm-wide">
          <SectionHeader
            eyebrow="Events"
            title="Technical Activities"
            description="A preview of workshops, lectures, and technical engagement programs."
            eyebrowClassName="!text-white/70"
            titleClassName="!text-white"
            descriptionClassName="!text-slate-200"
            action={
              <div className="home-section-action-wrap">
                <Button
                  as={Link}
                  to="/technical-activities"
                  variant="secondary"
                  size="sm"
                  className="home-premium-secondary-action-dark home-section-action-btn"
                >
                  View All Events
                </Button>
              </div>
            }
          />
          {activities.loading && <SkeletonGrid count={3} />}
          {activities.error && <ErrorState message={activities.error} onRetry={activities.reload} />}
          {!activities.loading && !activities.error && (
            activities.data.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                {activities.data.slice(0, 3).map((activity, idx) => (
                  <div key={activity.id} className={`home-list-card-shell home-list-card-shell-dark animate-fade-up ${getStaggerClass(idx)}`}>
                    <EventCard activity={activity} darkTheme />
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
