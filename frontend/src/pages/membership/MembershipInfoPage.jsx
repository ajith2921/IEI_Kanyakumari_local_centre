import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Card from "../../components/ui/Card";
import SectionHeader from "../../components/SectionHeader";

const infoSections = [
  {
    id: "engg-divisions",
    title: "Engineering Divisions",
    overview:
      "IEI technical activities are organized through discipline-focused divisions that support standards discussions, domain events, and knowledge exchange across branches of engineering.",
    audience: "Members, chapter coordinators, and engineers looking for division-specific engagement.",
    actions: [
      "Review division-wise technical focus areas.",
      "Track upcoming domain events and activities.",
      "Connect with relevant chapter-level communities.",
    ],
  },
  {
    id: "iei-council",
    title: "IEI Council",
    overview:
      "The Council provides institutional leadership, policy direction, and governance oversight for membership, certification, publications, and centre-level coordination.",
    audience: "Members and stakeholders seeking governance and decision-making context.",
    actions: [
      "View council role and responsibility areas.",
      "Follow policy-level institutional updates.",
      "Reference council-guided initiatives.",
    ],
  },
  {
    id: "policies-regulations",
    title: "Policies And Regulations",
    overview:
      "This section captures key policy references including membership norms, certification procedures, eligibility guidelines, and compliance-related operational rules.",
    audience: "Applicants, members, and administrators handling compliance-sensitive workflows.",
    actions: [
      "Check eligibility and process rules before submission.",
      "Review procedural standards for certification and services.",
      "Use policy references during member support operations.",
    ],
  },
  {
    id: "iei-centres-network",
    title: "IEI Centres & Network",
    overview:
      "IEI’s centre network enables regional member engagement through local programs, chapter activities, technical sessions, and on-ground professional support.",
    audience: "Members and applicants seeking local chapter access and network participation.",
    actions: [
      "Find centre-level engagement opportunities.",
      "Follow local events and chapter programs.",
      "Use centre channels for support and coordination.",
    ],
  },
  {
    id: "iei-guest-house",
    title: "IEI Guest House",
    overview:
      "Members may access approved guest house facilities as per institutional terms. Eligibility, booking flow, and usage conditions are maintained under this section.",
    audience: "Eligible members planning travel for institutional activities and events.",
    actions: [
      "Review guest house eligibility criteria.",
      "Check booking process and supporting requirements.",
      "Confirm applicable usage conditions.",
    ],
  },
  {
    id: "tender-notice",
    title: "Tender Notice",
    overview:
      "Tender announcements, reference documents, and timeline updates for institutional procurement and project requirements are published here.",
    audience: "Vendors, technical partners, and members monitoring institutional tender activity.",
    actions: [
      "Check active tender opportunities.",
      "Download relevant tender references.",
      "Track milestone and submission timelines.",
    ],
  },
  {
    id: "leadership",
    title: "Leadership",
    overview:
      "Leadership information includes key office bearers, role responsibilities, and strategic priorities that guide institutional and membership operations.",
    audience: "Members and partners seeking leadership structure and strategic direction.",
    actions: [
      "Review leadership role ownership.",
      "Understand strategic institutional priorities.",
      "Follow major leadership-led initiatives.",
    ],
  },
  {
    id: "career",
    title: "Career",
    overview:
      "Career notices, opportunities for professional engagement, and selected announcements relevant to engineers and members are posted here.",
    audience: "Members and engineering professionals exploring opportunities.",
    actions: [
      "Monitor newly published career notices.",
      "Identify role-fit engagement opportunities.",
      "Track application and announcement windows.",
    ],
  },
  {
    id: "downloads-forms",
    title: "Downloads / Forms",
    overview:
      "Official forms, templates, and process documents for membership services, requests, and related applications are maintained in this download area.",
    audience: "Applicants and members requiring official documents for submissions.",
    actions: [
      "Download latest official forms.",
      "Use standard templates for requests and applications.",
      "Verify document version before submission.",
    ],
  },
  {
    id: "arbitration",
    title: "Arbitration",
    overview:
      "IEI arbitration support includes process guidance, expert engagement context, and service pathways for technically grounded dispute-resolution scenarios.",
    audience: "Members, institutions, and stakeholders requiring technical arbitration guidance.",
    actions: [
      "Understand arbitration service scope.",
      "Review process and engagement expectations.",
      "Identify correct contact path for support.",
    ],
  },
  {
    id: "prize-awards",
    title: "Prize & Awards",
    overview:
      "Prize and award programs recognize engineering excellence, contributions to the profession, and impactful technical or institutional achievements.",
    audience: "Members, nominees, and institutions participating in recognition programs.",
    actions: [
      "Explore annual award program overview.",
      "Identify relevant recognition tracks.",
      "Track nomination and review timelines.",
    ],
  },
  {
    id: "award-categories",
    title: "Award Categories",
    overview:
      "Award categories are structured by contribution type, domain focus, and distinction level to ensure clear recognition pathways across professional profiles.",
    audience: "Nominees and nominators selecting the correct category fit.",
    actions: [
      "Match contribution type with category criteria.",
      "Review domain-focused distinctions.",
      "Select category before nomination preparation.",
    ],
  },
  {
    id: "award-eligibility",
    title: "Award Eligibility",
    overview:
      "Eligibility criteria define qualification baseline, experience relevance, contribution standards, and submission readiness for nomination consideration.",
    audience: "Prospective nominees and endorsers validating qualification readiness.",
    actions: [
      "Verify baseline qualification requirements.",
      "Check experience and contribution expectations.",
      "Confirm readiness before final nomination.",
    ],
  },
  {
    id: "nomination-process",
    title: "Nomination Process",
    overview:
      "The nomination workflow outlines required documents, recommendation practices, review stages, and timelines for fair and transparent evaluation.",
    audience: "Nominators, nominees, and review-support teams.",
    actions: [
      "Prepare required nomination documents.",
      "Follow stage-wise submission workflow.",
      "Track review status and communication windows.",
    ],
  },
  {
    id: "research-grant-in-aid",
    title: "Research Grant-In-Aid",
    overview:
      "Research Grant-in-Aid supports engineering-focused initiatives through structured funding pathways aligned with institutional and technical priorities.",
    audience: "Researchers and members pursuing institution-aligned technical projects.",
    actions: [
      "Review grant intent and funding scope.",
      "Assess alignment with project objectives.",
      "Prepare for scheme-level submission.",
    ],
  },
  {
    id: "grant-scheme-details",
    title: "Grant Scheme Details",
    overview:
      "Scheme details include objective scope, support model, expected outcomes, reporting checkpoints, and accepted project themes.",
    audience: "Applicants building compliant project proposals.",
    actions: [
      "Review accepted themes and scope boundaries.",
      "Understand expected deliverables and checkpoints.",
      "Use scheme rules while drafting proposal documents.",
    ],
  },
  {
    id: "grant-apply",
    title: "Grant Application",
    overview:
      "Application guidance covers submission format, mandatory documentation, review expectations, and key administrative checkpoints.",
    audience: "Applicants preparing complete grant submissions.",
    actions: [
      "Follow the prescribed submission format.",
      "Attach all mandatory documents.",
      "Validate checklist before final submission.",
    ],
  },
  {
    id: "grant-status",
    title: "Grant Status",
    overview:
      "Status updates provide stage visibility for submitted proposals, review progression, and official communication milestones.",
    audience: "Applicants and coordinators tracking grant lifecycle progress.",
    actions: [
      "Track current review stage.",
      "Monitor pending actions and response windows.",
      "Follow official communication milestones.",
    ],
  },
];

export default function MembershipInfoPage() {
  const location = useLocation();
  const [activeSectionId, setActiveSectionId] = useState(infoSections[0]?.id || "");

  useEffect(() => {
    if (!location.hash) {
      return;
    }

    const targetId = String(location.hash).replace("#", "");
    const targetNode = document.getElementById(targetId);
    if (targetNode) {
      targetNode.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries.length > 0) {
          setActiveSectionId(visibleEntries[0].target.id);
        }
      },
      {
        root: null,
        rootMargin: "-20% 0px -65% 0px",
        threshold: [0.1, 0.25, 0.4, 0.6],
      }
    );

    const trackedNodes = infoSections
      .map((section) => document.getElementById(section.id))
      .filter(Boolean);

    trackedNodes.forEach((node) => observer.observe(node));

    return () => {
      trackedNodes.forEach((node) => observer.unobserve(node));
      observer.disconnect();
    };
  }, []);

  return (
    <section className="page-shell section-block pb-16 md:pb-20">
      <SectionHeader
        eyebrow="Membership Information"
        title="Membership Information Architecture"
        description="All newly structured menu destinations are available here and will evolve into dedicated pages."
      />

      <div className="grid gap-4 xl:grid-cols-[260px,1fr] xl:items-start">
        <aside className="hidden xl:block xl:sticky xl:top-24">
          <Card className="border border-[#d4e1f1] bg-white p-4" padded={false}>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6b8298]">Quick Index</p>
            <nav className="mt-3" aria-label="Membership info section index">
              <ul className="space-y-1.5">
                {infoSections.map((section) => (
                  <li key={`index-${section.id}`}>
                    <a
                      href={`#${section.id}`}
                      aria-current={activeSectionId === section.id ? "location" : undefined}
                      className={`block rounded-md border px-2 py-1.5 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#0b3a67] ${
                        activeSectionId === section.id
                          ? "border-[#c8d9ee] bg-[#edf4ff] text-[#123252]"
                          : "border-transparent text-[#325170] hover:border-[#d4e1f1] hover:bg-[#f7fbff] hover:text-[#123252]"
                      }`}
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </Card>
        </aside>

        <div className="grid gap-4">
          {infoSections.map((section) => (
            <Card
              key={section.id}
              as="section"
              id={section.id}
              className="scroll-mt-28 border border-[#d4e1f1] bg-white p-5"
              padded={false}
            >
              <h3 className="text-lg font-semibold text-[#123252]">{section.title}</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                <article className="rounded-xl border border-[#d9e5f3] bg-[#f8fbff] px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6b8298]">
                    Overview
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#577089]">{section.overview}</p>
                </article>
                <article className="rounded-xl border border-[#d9e5f3] bg-[#f8fbff] px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6b8298]">
                    Who It Is For
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#577089]">{section.audience}</p>
                </article>
                <article className="rounded-xl border border-[#d9e5f3] bg-[#f8fbff] px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6b8298]">
                    Key Actions
                  </p>
                  <ul className="mt-1.5 space-y-1.5 text-sm text-[#577089]">
                    {section.actions.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-[0.34rem] inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#0b3a67]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
