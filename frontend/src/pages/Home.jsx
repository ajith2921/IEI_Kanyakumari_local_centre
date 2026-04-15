import { Link } from "react-router-dom";
import HeroSlider from "../components/HeroSlider";
import SectionHeader from "../components/SectionHeader";
import MemberCard from "../components/MemberCard";
import EventCard from "../components/EventCard";
import AnnouncementSection from "../components/AnnouncementSection";
import ErrorState from "../components/ErrorState";
import { SkeletonGrid } from "../components/Skeletons";
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

      <section className="page-shell pb-16">
        <div className="grid gap-5 md:grid-cols-3">
          {shortcutCards.map((item, index) => (
            <Link
              key={item.to}
              to={item.to}
              className={`section-card interactive-card focus-ring p-6 ${index < 3 ? "stagger-in" : ""}`}
            >
              <p className="mb-3 inline-flex rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-brand-700">
                Quick Access
              </p>
              <h2 className="heading-h3 mb-2 font-black text-brand-900">{item.title}</h2>
              <p className="text-sm leading-relaxed text-slate-600">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="page-shell pb-16">
        <SectionHeader
          eyebrow="Leadership"
          title="Office Bearers & Members"
          description="Meet our experienced team that drives institutional and technical initiatives."
          action={
            <Link
              to="/members"
              className="focus-ring rounded-lg border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:-translate-y-0.5 hover:bg-brand-50"
            >
              View All Members
            </Link>
          }
        />

        {members.loading && <SkeletonGrid count={6} />}
        {members.error && <ErrorState message={members.error} onRetry={members.reload} />}
        {!members.loading && !members.error && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {members.data.slice(0, 6).map((member) => (
              <div key={member.id} className="stagger-in">
                <MemberCard member={member} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="page-shell pb-16">
        <SectionHeader
          eyebrow="Events"
          title="Technical Activities"
          description="A preview of workshops, lectures, and technical engagement programs."
          action={
            <Link
              to="/technical-activities"
              className="focus-ring rounded-lg border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:-translate-y-0.5 hover:bg-brand-50"
            >
              View All Events
            </Link>
          }
        />

        {activities.loading && <SkeletonGrid count={3} />}
        {activities.error && <ErrorState message={activities.error} onRetry={activities.reload} />}
        {!activities.loading && !activities.error && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {activities.data.slice(0, 3).map((activity) => (
              <div key={activity.id} className="stagger-in">
                <EventCard activity={activity} />
              </div>
            ))}
          </div>
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
