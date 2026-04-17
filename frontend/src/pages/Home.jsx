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
import Card from "../components/ui/Card";
import useFetchList from "../hooks/useFetchList";
import { publicApi } from "../services/api";

export default function Home() {
  const members = useFetchList(publicApi.getMembers);
  const activities = useFetchList(publicApi.getActivities);
  const newsletters = useFetchList(publicApi.getNewsletters);

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

  return (
    <>
      <HeroSlider />

      {/* ── WELCOME / IEI KKLC INTRO ─────────────────── */}
      <section className="page-shell pb-10 pt-10">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Welcome text */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-red-800 mb-2">
              Welcome to IEI Kanyakumari Local Centre
            </p>
            <h2 className="text-2xl font-bold text-blue-900 mb-4 leading-snug">
              The Institution of Engineers (India)<br />
              <span className="text-xl font-semibold text-blue-700">Kanyakumari Local Centre (KKLC)</span>
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              IEI KKLC is a dynamic professional body committed to advancing engineering excellence, innovation, technical leadership, and societal development. As a regional centre of IEI, KKLC serves engineers, academicians, industrial experts, entrepreneurs, researchers, and students across Kanyakumari District and surrounding regions.
            </p>
            <p className="text-sm text-gray-700 leading-relaxed mb-4">
              We strive to build a strong engineering ecosystem through knowledge sharing, professional networking, industry collaboration, and community service.
            </p>
            <div className="border-l-4 border-red-700 pl-4 py-1">
              <p className="text-xs font-bold uppercase tracking-widest text-red-700 mb-1">Motto</p>
              <p className="text-sm font-semibold text-blue-900">
                Engineering Excellence · Innovation · Ethics · Nation Building
              </p>
            </div>
          </div>

          {/* Focus areas */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-800 mb-3">Our Focus Areas</p>
            <ul className="space-y-2">
              {[
                "Technical Seminars & Conferences",
                "Workshops & Faculty Development Programmes",
                "Industrial Visits",
                "Student Chapter Activities",
                "Career Guidance Programmes",
                "Entrepreneurship & Innovation Support",
                "Research Promotion",
                "Community Engineering Solutions",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="mt-0.5 text-red-700 font-bold flex-shrink-0">›</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── CHAIRMAN'S MESSAGE ────────────────────────── */}
      <section className="page-shell pb-10">
        <Card className="p-7 md:p-10 bg-blue-50 border border-blue-100">
          <p className="text-xs font-bold uppercase tracking-widest text-red-700 mb-3">
            Chairman's Message
          </p>
          <blockquote className="text-base text-gray-700 leading-relaxed mb-6 italic border-l-4 border-blue-800 pl-5">
            "Engineering is not just a profession — it is the foundation of progress. Our centre is dedicated to empowering engineers, motivating students, strengthening institutions, and serving society through innovative ideas and technical excellence. We invite all engineers, professionals, industries, and students to actively engage with KKLC and become part of a meaningful professional network."
          </blockquote>
          <div className="flex items-center gap-4">
            <div>
              <p className="font-bold text-blue-900 text-base">Dr. M. Marsaline Beno</p>
              <p className="text-sm text-gray-600">Chairman, IEI Kanyakumari Local Centre</p>
            </div>
          </div>
        </Card>
      </section>

      <section className="page-shell pb-16">
        <div className="grid gap-5 md:grid-cols-3">
          {shortcutCards.map((item, index) => (
            <Card
              key={item.to}
              as={Link}
              interactive
              to={item.to}
              className={`focus-ring p-6 ${index < 3 ? "stagger-in" : ""}`}
            >
              <p className="mb-3 inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-700">
                Quick Access
              </p>
              <h2 className="heading-h3 mb-2 font-semibold text-gray-900">{item.title}</h2>
              <p className="text-sm leading-relaxed text-gray-600">{item.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── ABOUT US SECTION ─────────────────────────────── */}
      <section className="page-shell pb-16">
        <SectionHeader
          eyebrow="Who We Are"
          title="About IEI Kanyakumari Local Centre"
          description="A vibrant institutional platform dedicated to engineering excellence, networking, and professional contribution."
        />

        <Card className="mb-8 p-7 leading-relaxed text-gray-700 md:p-9">
          <p className="mb-4">
            IEI Kanyakumari Local Centre serves as a hub for engineers, educators, and students,
            focusing on technical competence and community impact. Inspired by leading
            professional institutions, we create opportunities for growth through collaboration,
            events, and thought leadership.
          </p>
          <p>
            Our programs bridge academia and industry, enabling members to stay relevant in
            evolving technologies while upholding ethical and professional standards.
          </p>
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Professional Development",
              detail:
                "We organize seminars, lectures, and upskilling sessions for engineers across disciplines.",
            },
            {
              title: "Student Engagement",
              detail:
                "Through chapter activities and mentoring programs, students gain practical and industry-ready perspectives.",
            },
            {
              title: "Knowledge Sharing",
              detail:
                "Newsletter publications and panel discussions enable continuous technical learning.",
            },
          ].map((item) => (
            <Card key={item.title} interactive className="p-6">
              <h3 className="mb-3 text-lg font-semibold text-gray-900">{item.title}</h3>
              <p className="text-sm leading-relaxed text-gray-600">{item.detail}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="page-shell pb-16">
        <SectionHeader
          eyebrow="Leadership"
          title="Office Bearers & Members"
          description="Meet our experienced team that drives institutional and technical initiatives."
          action={
            <Button
              as={Link}
              to="/members"
              variant="secondary"
            >
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
                <div key={member.id} className="stagger-in">
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
      </section>

      <section className="page-shell pb-16">
        <SectionHeader
          eyebrow="Events"
          title="Technical Activities"
          description="A preview of workshops, lectures, and technical engagement programs."
          action={
            <Button
              as={Link}
              to="/technical-activities"
              variant="secondary"
            >
              View All Events
            </Button>
          }
        />

        {activities.loading && <SkeletonGrid count={3} />}
        {activities.error && <ErrorState message={activities.error} onRetry={activities.reload} />}
        {!activities.loading && !activities.error && (
          activities.data.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
              {activities.data.slice(0, 3).map((activity) => (
                <div key={activity.id} className="stagger-in">
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
      </section>

      <AnnouncementSection
        newsletters={newsletters.data.slice(0, 3)}
        loading={newsletters.loading && !newsletters.error}
      />
      {newsletters.error && (
        <section className="page-shell pb-16">
          <ErrorState message={newsletters.error} onRetry={newsletters.reload} />
        </section>
      )}
    </>
  );
}
