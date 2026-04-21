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
    to: "/membership-form#be-member",
    cta: "Know More",
  },
  {
    title: "Chartered Engineer",
    description: "Follow the CEng pathway for design, valuation, and project authority work.",
    to: "/membership-form#chartered-engineer",
    cta: "Apply Pathway",
  },
  {
    title: "Professional Engineer",
    description: "Advance to PEng-grade recognition for high-responsibility engineering practice.",
    to: "/membership-form#professional-engineer",
    cta: "Explore Track",
  },
  {
    title: "Section A & B Examination",
    description: "Get exam-oriented support for forms, admit cards, and progression planning.",
    to: "/membership-form#section-ab",
    cta: "Exam Services",
  },
  {
    title: "Journals & Publications",
    description: "Browse IEI-oriented journals, publications, and knowledge resources.",
    to: "/membership-form#publications",
    cta: "View Resources",
  },
  {
    title: "Events & CPD",
    description: "Join seminars, workshops, and continuous professional development activities.",
    to: "/membership-form#network-activities",
    cta: "Join Programs",
  },
];

const highlightPanels = [
  {
    title: "Career Manager Support",
    detail:
      "Build professional visibility through portfolio positioning, chapter networking, and mentorship channels.",
    to: "/membership-form#network-activities",
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

export default function Home() {
  const members = useFetchList(publicApi.getMembers);
  const activities = useFetchList(publicApi.getActivities);
  const newsletters = useFetchList(publicApi.getNewsletters);
  const cleanChairmanMessage = chairmanMessage.replace(/\s+/g, " ").trim();
  const heroStats = [
    {
      value: members.loading ? "..." : String(members.data.length),
      label: "Active Members",
    },
    {
      value: activities.loading ? "..." : String(activities.data.length),
      label: "Events Conducted",
    },
    {
      value: members.loading ? "..." : String(getDivisionCount(members.data)),
      label: "Engineering Divisions",
    },
  ];

  const isMembershipTarget = (to = "") => String(to).startsWith("/membership-form");

  return (
    <>
      {/* ── HERO ────────────────────────────────────────── */}
      <HeroSlider stats={heroStats} />

      {/* ── KYM SERVICE DESK ─────────────────────────────── */}
      <section className="border-b border-gray-200 bg-white">
        <div className="page-shell py-10 sm:py-12">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow-chip mb-2">KYM Service Desk</p>
              <h2 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                Membership and Certification Services
              </h2>
            </div>
            <Button
              as={Link}
              to="/membership-form"
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              size="sm"
            >
              Open Membership Portal
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {membershipServiceCards.map((item) => (
              <Link
                key={item.title}
                to={item.to}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring group flex h-full flex-col rounded-2xl border border-gray-200 bg-gray-50 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:bg-white hover:shadow-sm"
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
        <div className="page-shell pb-10 pt-12 sm:pb-14 sm:pt-16">
          <div className="grid gap-8 md:grid-cols-2 md:items-start md:gap-10">
            {/* Welcome text */}
            <div className="max-w-2xl">
              <h2 className="mb-3 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                Welcome
              </h2>
              <p className="mb-5 max-w-[24ch] text-2xl font-semibold leading-tight tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
                The Institution of Engineers (India) —{" "}
                <span className="text-gray-400">Kanyakumari Local Centre</span>
              </p>
              <p className="mb-3 max-w-[62ch] text-[15px] leading-7 text-gray-600 sm:text-base">
                IEI KKLC is a dynamic professional body committed to advancing engineering excellence, innovation, technical leadership, and societal development. We serve engineers, academicians, and students across Kanyakumari District and surrounding regions.
              </p>
              <p className="mb-6 max-w-[62ch] text-sm leading-7 text-gray-500 sm:mb-7 sm:text-[15px]">
                We strive to build a strong engineering ecosystem through knowledge sharing,
                professional networking, industry collaboration, and community service.
              </p>
              <Button
                as={Link}
                to="/membership-form"
                target="_blank"
                rel="noopener noreferrer"
                variant="secondary"
                size="sm"
              >
                Become a Member
              </Button>
            </div>

            {/* Focus areas */}
            <div className="rounded-2xl border border-gray-200 bg-white/90 p-6 shadow-sm sm:p-7">
              <h3 className="mb-4 text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
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
        <div className="page-shell pb-10 pt-12 sm:pb-14 sm:pt-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-5 text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              Chairman&apos;s Message
            </h2>
            <div className="rounded-2xl border border-gray-200 bg-gray-50/60 p-6 sm:p-8">
              <blockquote className="mb-4 mr-auto max-w-[66ch] text-left text-[17px] leading-8 text-gray-600 italic sm:mb-5 sm:text-lg">
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
        <div className="page-shell py-20">
          <SectionHeader
            eyebrow="Highlights"
            title="Member Privileges and Service Channels"
            description="Key access points modeled around institutional workflows for growth, resources, and participation."
            className="mb-8"
          />
          <div className="grid gap-4 md:grid-cols-3">
            {highlightPanels.map((item) => (
              <Link
                key={item.title}
                to={item.to}
                target={isMembershipTarget(item.to) ? "_blank" : undefined}
                rel={isMembershipTarget(item.to) ? "noopener noreferrer" : undefined}
                className="focus-ring group flex h-full flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-200 hover:shadow-md"
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
        <div className="page-shell pb-10 pt-12 sm:pb-14 sm:pt-16">
          <SectionHeader
            eyebrow="Who We Are"
            title="About IEI Kanyakumari Local Centre"
            description="A vibrant institutional platform dedicated to engineering excellence, networking, and professional contribution."
            contentWidthClassName="max-w-none"
            className="mb-7 sm:mb-9"
          />
          <p className="mb-8 max-w-none text-[15px] leading-7 text-gray-600 sm:mb-10 sm:text-base">
            IEI Kanyakumari Local Centre serves as a hub for engineers, educators, and students,
            focusing on technical competence and community impact. Our programs bridge academia and
            industry, enabling members to stay relevant in evolving technologies while upholding ethical
            and professional standards.
          </p>
          <div className="grid gap-5 sm:gap-6 md:grid-cols-3">
            {aboutPillars.map((item) => (
              <div
                key={item.title}
                className="h-full rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-200 hover:shadow-sm"
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
