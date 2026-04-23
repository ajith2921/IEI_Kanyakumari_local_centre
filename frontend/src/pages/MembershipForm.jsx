import { Suspense, lazy, useState } from "react";
import { Link } from "react-router-dom";
import SectionHeader from "../components/SectionHeader";
import LoadingSpinner from "../components/LoadingSpinner";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import MembershipHeroCampaign from "../components/membership/MembershipHeroCampaign";
import MembershipServiceDesk from "../components/membership/MembershipServiceDesk";
import MembershipEventsBoard from "../components/membership/MembershipEventsBoard";
import MembershipHighlightsCarousel from "../components/membership/MembershipHighlightsCarousel";
import MembershipAnnouncementsCarousel from "../components/membership/MembershipAnnouncementsCarousel";
import MembershipStatsBand from "../components/membership/MembershipStatsBand";
import { useMembershipSession } from "../context/MembershipSessionContext";
import { parseApiError, publicApi } from "../services/api";
import useFetchList from "../hooks/useFetchList";

const MembershipAuthPanel = lazy(() => import("../components/membership/MembershipAuthPanel"));
const MembershipDashboardCard = lazy(() =>
  import("../components/membership/MembershipDashboardCard")
);
const MembershipRegisterWizard = lazy(() =>
  import("../components/membership/MembershipRegisterWizard")
);

const membershipBenefits = [
  "Chartered Engineer (CEng) pathway for design, report, and valuation certification authority",
  "Professional Engineer (PEng) recognition for advanced competency and technical approvals",
  "Independent consultancy practice readiness for civil, mechanical, and electrical domains",
  "Support for government approvals, bank loan project validation, and insurance assessments",
  "Engineering arbitration and technical expert-opinion role pathways",
  "IEI-Springer journals, technical publications, reports, and library network access",
  "National and international conferences, workshops, seminars, and CPD programs",
  "Networking through 100+ centres, local chapter ecosystems, and ENGGtalks",
  "Career Manager portfolio support, R&D grant pathways, and guest house concessions",
];

const premiumPlanCoverage = [
  "CEng-focused certification support for technical drawings, structural design, and project reports",
  "PEng-level professional competency recognition for infrastructure and approval-centric work",
  "Consultancy and valuation practice alignment for govt, bank, and insurance-facing engagements",
  "Legal and technical authority pathways including arbitration and expert-opinion assignments",
  "Deep resource stack: IEI-Springer journals, technical libraries, and premium reports",
  "Continuous learning through CPD, workshops, seminars, and discounted conferences",
  "Professional visibility via Career Manager, ENGGtalks, local centre networking, and R&D grants",
  "Operational benefits including guest house concessions for travel and conference participation",
];

const membershipTypes = [
  {
    code: "AMIE",
    title: "Associate Member",
    eligibility: "Diploma or equivalent engineering qualification pursuing professional progression.",
    description: "Designed for early-career engineers building foundational credentials and practice readiness.",
    fees: "Application and annual subscription as per chapter notification.",
  },
  {
    code: "MIE",
    title: "Member",
    eligibility: "Recognized engineering degree with professional experience in industry, academia, or services.",
    description: "For practicing professionals seeking institutional recognition and technical leadership roles.",
    fees: "Standard membership admission and renewal fee.",
  },
  {
    code: "FIE",
    title: "Fellow",
    eligibility: "Senior engineering professionals with substantial experience, leadership, and contribution to the profession.",
    description: "Highest category focused on mentorship, governance, and strategic professional engagement.",
    fees: "Fellowship nomination and subscription structure as notified.",
  },
];

const memberPortalActions = [
  "Download Membership Certificate",
  "View Membership Profile",
  "Access CPD and Event Passes",
  "View CPD Analytics (Premium)",
];

function BenefitItem({ text }) {
  return (
    <div className="flex items-start rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
      <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-500">
        <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
          <path
            d="M5 10.5L8.2 13.5L15 6.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <p className="ml-3 text-sm font-medium text-gray-600">{text}</p>
    </div>
  );
}

function ProtectedPortalActions({ isAuthenticated, member }) {
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("success");
  const [loadingAction, setLoadingAction] = useState("");
  const [profile, setProfile] = useState(null);
  const [cpdRecords, setCpdRecords] = useState([]);
  const [cpdAnalytics, setCpdAnalytics] = useState(null);

  const runProfileFetch = async () => {
    setLoadingAction("profile");
    setStatusMessage("");
    setStatusType("success");
    try {
      const response = await publicApi.getMembershipProfile();
      setProfile(response.data || null);
      setStatusMessage("Membership profile loaded.");
      setStatusType("success");
    } catch (error) {
      setStatusMessage(parseApiError(error));
      setStatusType("error");
    } finally {
      setLoadingAction("");
    }
  };

  const runCpdFetch = async () => {
    setLoadingAction("cpd");
    setStatusMessage("");
    setStatusType("success");
    try {
      const response = await publicApi.getMembershipCpdHistory();
      setCpdRecords(Array.isArray(response.data) ? response.data : []);
      setStatusMessage("CPD history loaded.");
      setStatusType("success");
    } catch (error) {
      setStatusMessage(parseApiError(error));
      setStatusType("error");
    } finally {
      setLoadingAction("");
    }
  };

  const runCpdAnalyticsFetch = async () => {
    setLoadingAction("analytics");
    setStatusMessage("");
    setStatusType("success");
    try {
      const response = await publicApi.getMembershipCpdAnalytics();
      setCpdAnalytics(response.data || null);
      setStatusMessage("Premium CPD analytics loaded.");
      setStatusType("success");
    } catch (error) {
      setStatusMessage(parseApiError(error));
      setStatusType("error");
    } finally {
      setLoadingAction("");
    }
  };

  const runCertificateDownload = async () => {
    setLoadingAction("certificate");
    setStatusMessage("");
    setStatusType("success");
    try {
      const response = await publicApi.downloadMembershipCertificate();
      const contentDisposition = response.headers?.["content-disposition"] || "";
      const filenameMatch = /filename=\"?([^";]+)\"?/.exec(contentDisposition);
      const filename = filenameMatch?.[1] || "membership-certificate.txt";

      const blob = new Blob([response.data], {
        type: response.headers?.["content-type"] || "text/plain",
      });
      const objectUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(objectUrl);

      setStatusMessage("Certificate download started.");
      setStatusType("success");
    } catch (error) {
      setStatusMessage(parseApiError(error));
      setStatusType("error");
    } finally {
      setLoadingAction("");
    }
  };

  return (
    <Card as="section" className="p-5" padded={false}>
      <p className="text-sm font-semibold text-gray-900">Member-only Portal Actions</p>
      {!isAuthenticated ? (
        <>
          <p className="mt-1.5 text-sm text-gray-500">
            Sign in to unlock protected services such as profile access, member credentials, and
            downloadable membership resources.
          </p>
          <Button as="a" href="#auth-panel" variant="secondary" size="sm" className="mt-3">
            Sign In to Continue
          </Button>
        </>
      ) : (
        <>
          <p className="mt-1.5 text-sm text-gray-500">
            Signed in as{" "}
            <span className="font-semibold text-gray-900">{member?.name || "Member"}</span>
          </p>
          <div className="mt-3 grid gap-4">
            <Button
              onClick={runCertificateDownload}
              disabled={loadingAction === "certificate"}
              variant="secondary"
              size="sm"
              className="w-full justify-start text-left"
            >
              {loadingAction === "certificate" ? "Preparing Certificate..." : memberPortalActions[0]}
            </Button>
            <Button
              onClick={runProfileFetch}
              disabled={loadingAction === "profile"}
              variant="secondary"
              size="sm"
              className="w-full justify-start text-left"
            >
              {loadingAction === "profile" ? "Loading Profile..." : memberPortalActions[1]}
            </Button>
            <Button
              onClick={runCpdFetch}
              disabled={loadingAction === "cpd"}
              variant="secondary"
              size="sm"
              className="w-full justify-start text-left"
            >
              {loadingAction === "cpd" ? "Loading CPD History..." : memberPortalActions[2]}
            </Button>
            <Button
              onClick={runCpdAnalyticsFetch}
              disabled={loadingAction === "analytics"}
              variant="secondary"
              size="sm"
              className="w-full justify-start text-left"
            >
              {loadingAction === "analytics" ? "Loading CPD Analytics..." : memberPortalActions[3]}
            </Button>
          </div>
          {profile && (
            <dl className="mt-4 space-y-1.5 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-gray-500">Membership Type</dt>
                <dd className="font-semibold text-gray-900">{profile.membership_type || "N/A"}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-gray-500">Interest Area</dt>
                <dd className="font-semibold text-gray-900">{profile.interest_area || "N/A"}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-gray-500">Contact</dt>
                <dd className="font-semibold text-gray-900">{profile.email || profile.mobile || "N/A"}</dd>
              </div>
            </dl>
          )}

          {cpdRecords.length > 0 && (
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="eyebrow-chip mb-3">CPD History</p>
              <ul className="space-y-2 text-sm text-gray-700">
                {cpdRecords.slice(0, 5).map((record) => (
                  <li key={record.id} className="rounded-lg border border-gray-200 bg-white px-3 py-2">
                    <p className="font-semibold text-gray-900">{record.title}</p>
                    <p className="text-xs text-gray-400">
                      {record.category} | {record.credit_hours} hrs | {record.attended_on}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {cpdAnalytics && (
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="eyebrow-chip mb-3">Premium CPD Analytics</p>
              <div className="grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
                <p>
                  Total Activities: <span className="font-semibold text-gray-900">{cpdAnalytics.total_activities || 0}</span>
                </p>
                <p>
                  Total Credit Hours: <span className="font-semibold text-gray-900">{cpdAnalytics.total_credit_hours || 0}</span>
                </p>
              </div>
              {cpdAnalytics.recent_activity_title && (
                <p className="mt-2 text-sm text-gray-600">
                  Recent Activity: <span className="font-semibold text-gray-900">{cpdAnalytics.recent_activity_title}</span>
                </p>
              )}
              {Array.isArray(cpdAnalytics.category_breakdown) && cpdAnalytics.category_breakdown.length > 0 && (
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  {cpdAnalytics.category_breakdown.map((item) => (
                    <li
                      key={item.category}
                      className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2"
                    >
                      <span className="font-medium text-gray-800">{item.category}</span>
                      <span className="text-xs text-gray-500">
                        {item.activities} activity(ies) | {item.credit_hours} hrs
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {statusMessage && (
            <p className={`mt-3 text-sm ${statusType === "error" ? "text-gray-500" : "text-[#3B82F6]"}`}>
              {statusMessage}
            </p>
          )}
        </>
      )}
    </Card>
  );
}

export default function MembershipForm() {
  const { isAuthenticated, member } = useMembershipSession();
  const activities = useFetchList(publicApi.getActivities);
  const newsletters = useFetchList(publicApi.getNewsletters);
  const metrics = {
    serviceCount: 6,
    activityCount: activities.data.length,
    noticeCount: newsletters.data.length,
  };

  return (
    <section className="page-shell section-block pb-28 md:pb-20">

      <div className="mb-8 space-y-5">
        <MembershipHeroCampaign />
        <MembershipServiceDesk />
        <MembershipEventsBoard activities={activities.data} loading={activities.loading} />
        <MembershipHighlightsCarousel />
        <MembershipAnnouncementsCarousel
          newsletters={newsletters.data}
          loading={newsletters.loading}
        />
        <MembershipStatsBand metrics={metrics} />
      </div>

      <SectionHeader
        eyebrow="Membership Portal"
        title="Be a part of IEI Kanyakumari Local Centre"
        description="Benefits of Corporate Membership"
      />

      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <Card className="border-gray-200 bg-white p-6" padded={false}>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">New Applicant</p>
          <h3 className="mt-2 text-xl font-semibold text-gray-900">Start Membership Application</h3>
          <p className="mt-2 text-sm text-gray-500">
            Complete the guided membership wizard and submit your profile for admin approval.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button as="a" href="#apply-membership">Start Application</Button>
            <Button as="a" href="#membership-info" variant="secondary">View Benefits</Button>
          </div>
        </Card>

        <Card className="border-gray-200 bg-white p-6" padded={false}>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">Existing Member</p>
          <h3 className="mt-2 text-xl font-semibold text-gray-900">Sign In to Member Portal</h3>
          <p className="mt-2 text-sm text-gray-500">
            Access your profile, subscription, CPD analytics, and member-only actions.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button as="a" href="#auth-panel">Go to Sign In</Button>
            <Button as="a" href="#network-activities" variant="secondary">Explore Programs</Button>
          </div>
        </Card>
      </div>

      {/* ── Membership Gateway Banner ──────────────────── */}
      <div id="be-member" className="mb-8 rounded-2xl border border-gray-200 bg-gray-50 p-8 scroll-mt-28">
        <p className="eyebrow-chip mb-3">Institutional Membership</p>
        <h2 className="text-2xl font-semibold text-gray-900 md:text-3xl">
          Professional Membership Gateway
        </h2>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-gray-500">
          Join a structured engineering community with standards-based professional development,
          technical resources, certification pathways, and chapter-level collaboration.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr,0.85fr]">
        <div className="order-2 space-y-6 xl:order-1">

          <section id="apply-membership" className="scroll-mt-28">
            <Suspense fallback={<LoadingSpinner text="Loading registration module..." />}>
              <MembershipRegisterWizard />
            </Suspense>
          </section>

          {/* Benefits */}
          <Card as="section" id="membership-info" className="p-6 scroll-mt-28" padded={false}>
            <h3 className="text-xl font-medium text-gray-900">Benefits of Corporate Membership</h3>
            <p className="mt-1.5 text-sm text-gray-500">
              Structured services supporting engineering practice, learning, and long-term career growth.
            </p>
            <details className="group mt-5">
              <summary className="focus-ring flex cursor-pointer list-none items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800">
                <span>View complete benefit matrix</span>
                <span className="text-xs text-gray-400 transition-transform group-open:rotate-180">▼</span>
              </summary>
              <div className="mt-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {membershipBenefits.map((benefit) => (
                    <BenefitItem key={benefit} text={benefit} />
                  ))}
                </div>
                <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-900">Reality Check</p>
                  <p className="mt-1.5 text-sm text-gray-500">
                    Highest practical value is typically seen for Civil, Mechanical, and Electrical engineers
                    pursuing consultancy-led, approval-heavy, or project-verification roles.
                  </p>
                </div>
              </div>
            </details>
          </Card>

          <Card as="section" className="p-6" padded={false}>
            <h3 className="text-xl font-medium text-gray-900">Recommended Premium Plan Coverage</h3>
            <p className="mt-1.5 text-sm text-gray-500">
              Premium Chartered Professional is structured to satisfy the full professional-authority and
              career-growth spectrum outlined for high-value engineering practice.
            </p>
            <details className="group mt-5">
              <summary className="focus-ring flex cursor-pointer list-none items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-800">
                <span>View premium entitlement coverage</span>
                <span className="text-xs text-gray-400 transition-transform group-open:rotate-180">▼</span>
              </summary>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                {premiumPlanCoverage.map((item) => (
                  <li key={item} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                    {item}
                  </li>
                ))}
              </ul>
            </details>
          </Card>

          {/* Academics */}
          <Card as="section" id="academics-certification" className="p-6 scroll-mt-28" padded={false}>
            <h3 className="text-xl font-medium text-gray-900">Academics / Certification</h3>
            <p className="mt-1.5 text-sm text-gray-500">
              Certification-first pathways aligned with engineering authority, compliance-ready documentation,
              and career-grade professional recognition.
            </p>
            <div className="mt-5 grid gap-4">
              <article id="chartered-engineer" className="rounded-xl border border-gray-200 bg-gray-50 p-4 scroll-mt-28">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-400">Certification Track</p>
                <p className="mt-1.5 text-base font-semibold text-gray-900">Chartered Engineer (CEng)</p>
                <p className="mt-1.5 text-sm text-gray-500">
                  Built for engineers targeting authority-backed technical design approvals, valuation reports,
                  and project execution validation.
                </p>
              </article>

              <article id="professional-engineer" className="rounded-xl border border-gray-200 bg-gray-50 p-4 scroll-mt-28">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-400">Professional Recognition</p>
                <p className="mt-1.5 text-base font-semibold text-gray-900">Professional Engineer (PEng)</p>
                <p className="mt-1.5 text-sm text-gray-500">
                  Advanced competency route for high-stakes assignments in infrastructure, consultancy-led
                  execution, and institutional review workflows.
                </p>
              </article>

              <article id="section-ab" className="rounded-xl border border-gray-200 bg-gray-50 p-4 scroll-mt-28">
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-400">Academic Services</p>
                <p className="mt-1.5 text-base font-semibold text-gray-900">Section A & B Examination</p>
                <p className="mt-1.5 text-sm text-gray-500">
                  End-to-end support for form filling, admit cards, results tracking, and progression planning
                  for aspiring members.
                </p>
              </article>
            </div>
          </Card>

          <Card as="section" id="publications" className="p-6 scroll-mt-28" padded={false}>
            <h3 className="text-xl font-medium text-gray-900">Journals / Publications</h3>
            <p className="mt-1.5 text-sm text-gray-500">
              Access IEI-focused technical publications, curated research streams, and submission opportunities
              for professional and academic visibility.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-900">Journal Access</p>
                <p className="mt-1.5 text-sm text-gray-500">
                  Explore engineering journals, institutional papers, and technical references for domain practice.
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-900">Paper Submission Pathway</p>
                <p className="mt-1.5 text-sm text-gray-500">
                  Prepare and publish original work through guided submission channels and editorial standards.
                </p>
              </div>
            </div>
          </Card>

          {/* Network */}
          <Card as="section" id="network-activities" className="p-6 scroll-mt-28" padded={false}>
            <h3 className="text-xl font-medium text-gray-900">Network / Activities</h3>
            <p className="mt-1.5 text-sm text-gray-500">
              Participate in technical forums, chapter events, CPD sessions, and professional networking programs.
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-900">Technical Chapters & ENGGtalks</p>
                <p className="mt-1.5 text-sm text-gray-500">
                  Engage with focused engineering domains and collaborative chapter groups.
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-900">CPD & Professional Networking</p>
                <p className="mt-1.5 text-sm text-gray-500">
                  Connect with senior professionals, practitioners, and institutional mentors.
                </p>
              </div>
            </div>
          </Card>

          {/* Membership Categories */}
          <Card as="section" className="p-6" padded={false}>
            <h3 className="text-xl font-medium text-gray-900">Membership Categories</h3>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {membershipTypes.map((item) => (
                <article key={item.code} className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                  <p className="inline-flex rounded-md bg-gray-200 px-2 py-1 text-xs font-semibold text-gray-600">
                    {item.code}
                  </p>
                  <h4 className="mt-3 text-sm font-medium text-gray-900">{item.title}</h4>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Eligibility</p>
                  <p className="text-sm text-gray-500">{item.eligibility}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Description</p>
                  <p className="text-sm text-gray-500">{item.description}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Fees</p>
                  <p className="text-sm text-gray-500">{item.fees}</p>
                </article>
              ))}
            </div>
          </Card>

        </div>

        {/* Sidebar */}
        <div className="order-1 space-y-4 xl:order-2 xl:sticky xl:top-24 xl:self-start">
          <Suspense fallback={<LoadingSpinner text="Loading member access panel..." />}>
            <MembershipAuthPanel />
          </Suspense>

          <Suspense fallback={<LoadingSpinner text="Loading member dashboard..." />}>
            <MembershipDashboardCard />
          </Suspense>

          <ProtectedPortalActions isAuthenticated={isAuthenticated} member={member} />

          <Card className="p-5" padded={false}>
            <p className="text-sm font-medium text-gray-900">Portal Support</p>
            <p className="mt-1.5 text-sm text-gray-500">
              For technical help with account access and membership verification, contact chapter office.
            </p>
          </Card>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 px-3 py-2.5 shadow-[0_-6px_22px_-14px_rgba(17,24,39,0.35)] backdrop-blur md:hidden">
        <nav className="mx-auto grid max-w-6xl grid-cols-3 gap-2" aria-label="Membership quick actions">
          <Button as="a" href="#apply-membership" className="!h-10 !px-2 !text-xs">
            Apply
          </Button>
          <Button as="a" href="#auth-panel" variant="secondary" className="!h-10 !px-2 !text-xs">
            Sign In
          </Button>
          <Button as="a" href="/" variant="secondary" className="!h-10 !px-2 !text-xs">
            Main Site
          </Button>
        </nav>
      </div>

      <div className="fixed bottom-5 right-5 z-40 hidden md:block">
        <nav className="rounded-2xl border border-gray-200 bg-white/95 p-2 shadow-lg backdrop-blur" aria-label="Membership quick dock">
          <div className="grid gap-2">
            <Button as="a" href="#apply-membership" size="sm" className="!h-9 !px-3 !text-xs">
              Apply
            </Button>
            <Button as="a" href="#auth-panel" variant="secondary" size="sm" className="!h-9 !px-3 !text-xs">
              Sign In
            </Button>
            <Button as={Link} to="/membership/events-cpd" variant="secondary" size="sm" className="!h-9 !px-3 !text-xs">
              Events
            </Button>
          </div>
        </nav>
      </div>
    </section>
  );
}
