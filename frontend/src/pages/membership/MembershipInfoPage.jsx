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
    id: "industry-excellence-award",
    title: "Industry Excellence Award",
    overview:
      "This award highlights outstanding industrial practice, applied engineering leadership, and measurable contribution to engineering excellence in industry settings.",
    audience: "Industry members and teams showcasing applied engineering impact.",
    actions: [
      "Review the recognition focus for industrial achievement.",
      "Assess project and operational impact evidence.",
      "Track award submission and review updates.",
    ],
  },
  {
    id: "education-excellence-award",
    title: "Education Excellence Award",
    overview:
      "This award recognizes exceptional contributions to engineering education, teaching practice, curriculum leadership, and learning innovation.",
    audience: "Educators, academic leaders, and institutions advancing engineering education.",
    actions: [
      "Review education-focused recognition criteria.",
      "Document teaching and learning outcomes.",
      "Prepare supporting academic evidence.",
    ],
  },
  {
    id: "iei-young-engineers-award",
    title: "IEI Young Engineers Award",
    overview:
      "This award celebrates emerging engineers for technical promise, early-career achievement, and professional development contributions.",
    audience: "Young engineers and mentors preparing nomination materials.",
    actions: [
      "Verify early-career eligibility requirements.",
      "Highlight technical and professional milestones.",
      "Follow nomination and shortlist updates.",
    ],
  },
  {
    id: "best-journal-prize",
    title: "Best Journal Prize",
    overview:
      "The Best Journal Prize identifies strong scholarly publication quality, original contribution, and technical relevance in IEI journal output.",
    audience: "Authors and editorial contributors focused on journal excellence.",
    actions: [
      "Review journal evaluation emphasis.",
      "Check contribution and originality expectations.",
      "Track editorial recognition cycles.",
    ],
  },
  {
    id: "the-sail-awards",
    title: "The SAIL Awards",
    overview:
      "The SAIL Awards recognize notable achievement and contribution within an award framework associated with industrial and engineering excellence.",
    audience: "Nominees, nominators, and industry stakeholders.",
    actions: [
      "Review award scope and recognition context.",
      "Prepare nomination evidence and references.",
      "Monitor award communication timelines.",
    ],
  },
  {
    id: "ndrf-design-awards",
    title: "NDRF Design Awards",
    overview:
      "These awards acknowledge design excellence, resilience-focused thinking, and engineering solutions with strong practical and social value.",
    audience: "Design teams, engineers, and institutions with resilient engineering work.",
    actions: [
      "Review design-oriented recognition criteria.",
      "Document design intent and impact.",
      "Confirm award submission requirements.",
    ],
  },
  {
    id: "the-coal-india-awards",
    title: "The Coal India Awards",
    overview:
      "The Coal India Awards honor engineering performance, innovation, and impactful contribution within the associated industrial domain.",
    audience: "Industry participants and technical contributors in the award domain.",
    actions: [
      "Review industrial recognition parameters.",
      "Assemble impact evidence and references.",
      "Track nomination and award status updates.",
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
  {
    id: "research-grant-overview",
    title: "Research Grant-in-Aid — Overview",
    overview:
      "IEI's Research Grant-in-Aid programme funds engineering-focused research initiatives aligned with national priorities. Grants support applied research, prototype development, and technical studies undertaken by member researchers.",
    audience: "IEI members, faculty researchers, and engineers with active or planned R&D projects.",
    actions: [
      "Understand the grant programme's institutional purpose.",
      "Review the scope of fundable engineering research areas.",
      "Determine if your project qualifies for submission.",
    ],
  },
  {
    id: "research-grant-highlights",
    title: "Research Grant-in-Aid — Key Highlights",
    overview:
      "Key highlights include structured funding cycles, multi-domain scope covering civil, mechanical, electrical, and emerging technologies, milestone-based disbursement, and a formal review board to evaluate technical merit.",
    audience: "Prospective applicants evaluating grant suitability and benefit alignment.",
    actions: [
      "Note the funding cycle timelines for the current year.",
      "Identify your engineering domain within the eligible categories.",
      "Review milestone disbursement schedule and deliverable expectations.",
    ],
  },
  {
    id: "research-grant-eligibility",
    title: "Research Grant-in-Aid — Eligibility Criteria",
    overview:
      "Applicants must be corporate members of IEI in good standing. Projects must have a clear engineering focus, defined objectives, and measurable outcomes. Collaborative proposals with institutions are encouraged.",
    audience: "IEI corporate members (AMIE, MIE, FIE) planning a research project submission.",
    actions: [
      "Confirm active IEI corporate membership status.",
      "Validate project scope against stated engineering eligibility criteria.",
      "Prepare evidence of institutional affiliation if applicable.",
    ],
  },
  {
    id: "research-grant-apply",
    title: "Research Grant-in-Aid — How to Apply",
    overview:
      "Applications are submitted through the IEI portal using the prescribed proposal format. Required documents include project synopsis, budget justification, timeline, and recommender details. Review happens in two stages: technical and administrative.",
    audience: "Eligible IEI members ready to submit a structured research proposal.",
    actions: [
      "Download the official proposal template from the Downloads section.",
      "Complete all mandatory fields including budget and timeline.",
      "Submit through the IEI portal before the notified deadline.",
    ],
  },
  {
    id: "research-grant-funded-projects",
    title: "Research Grant-in-Aid — Funded Projects",
    overview:
      "A repository of previously funded projects is maintained to provide applicants with reference examples, scope clarity, and thematic direction. Completed projects contribute to IEI's technical knowledge base.",
    audience: "Researchers seeking inspiration, scope reference, or outcome benchmarks.",
    actions: [
      "Browse funded project summaries relevant to your domain.",
      "Identify outcome reporting standards from completed projects.",
      "Use funded project themes as scope alignment reference.",
    ],
  },
  {
    id: "research-grant-rd-compendium",
    title: "Research Grant-in-Aid — R&D Compendium",
    overview:
      "The R&D Compendium compiles research outcomes, technical findings, and engineering insights from IEI-funded projects. It serves as a reference publication for members and the broader engineering community.",
    audience: "Members, researchers, and engineering stakeholders referencing applied R&D outcomes.",
    actions: [
      "Download the latest R&D Compendium edition.",
      "Reference specific domain findings for ongoing project work.",
      "Submit completed project summaries for compendium inclusion.",
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
