import { Suspense, lazy, useState } from "react";
import SectionHeader from "../components/SectionHeader";
import LoadingSpinner from "../components/LoadingSpinner";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import { useMembershipSession } from "../context/MembershipSessionContext";
import { parseApiError, publicApi } from "../services/api";

const MembershipAuthPanel = lazy(() => import("../components/membership/MembershipAuthPanel"));
const MembershipDashboardCard = lazy(() =>
  import("../components/membership/MembershipDashboardCard")
);
const MembershipRegisterWizard = lazy(() =>
  import("../components/membership/MembershipRegisterWizard")
);

const actionTabs = [
  { label: "Be a Member", href: "#be-member" },
  { label: "Membership Info", href: "#membership-info" },
  { label: "Academics / Certification", href: "#academics-certification" },
  { label: "Network / Activities", href: "#network-activities" },
  { label: "Sign In", href: "#auth-panel" },
];

const membershipBenefits = [
  "Practice of Engineering Profession",
  "Continuous Professional Development",
  "Access to Technical Publications",
  "Peer Networking",
  "R&D Grants",
  "Technical Events Participation",
  "Knowledge Resources",
  "Guest House Facility",
  "Job Opportunities",
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
];

function BenefitItem({ text }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-brand-100 bg-white px-3 py-2.5">
      <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-100 text-brand-700">
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
      <p className="text-sm font-medium text-gray-700">{text}</p>
    </div>
  );
}

function ProtectedPortalActions({ isAuthenticated, member }) {
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("success");
  const [loadingAction, setLoadingAction] = useState("");
  const [profile, setProfile] = useState(null);
  const [cpdRecords, setCpdRecords] = useState([]);

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

  const runCertificateDownload = async () => {
    setLoadingAction("certificate");
    setStatusMessage("");
    setStatusType("success");
    try {
      const response = await publicApi.downloadMembershipCertificate();
      const contentDisposition = response.headers?.["content-disposition"] || "";
      const filenameMatch = /filename=\"?([^\";]+)\"?/.exec(contentDisposition);
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
    <Card as="section" className="border border-slate-200 p-5" padded={false}>
      <p className="text-sm font-semibold text-gray-900">Member-only Portal Actions</p>
      {!isAuthenticated ? (
        <>
          <p className="mt-1 text-sm text-gray-600">
            Sign in to unlock protected services such as profile access, member credentials, and
            downloadable membership resources.
          </p>
          <Button as="a" href="#auth-panel" variant="secondary" size="sm" className="mt-3">
            Sign In to Continue
          </Button>
        </>
      ) : (
        <>
          <p className="mt-1 text-sm text-gray-600">
            Signed in as <span className="font-semibold text-brand-800">{member?.name || "Member"}</span>
          </p>
          <div className="mt-3 grid gap-2">
            <Button
              onClick={runCertificateDownload}
              disabled={loadingAction === "certificate"}
              variant="secondary"
              className="w-full justify-start text-left"
            >
              {loadingAction === "certificate" ? "Preparing Certificate..." : memberPortalActions[0]}
            </Button>
            <Button
              onClick={runProfileFetch}
              disabled={loadingAction === "profile"}
              variant="secondary"
              className="w-full justify-start text-left"
            >
              {loadingAction === "profile" ? "Loading Profile..." : memberPortalActions[1]}
            </Button>
            <Button
              onClick={runCpdFetch}
              disabled={loadingAction === "cpd"}
              variant="secondary"
              className="w-full justify-start text-left"
            >
              {loadingAction === "cpd" ? "Loading CPD History..." : memberPortalActions[2]}
            </Button>
          </div>
          {profile && (
            <dl className="mt-3 space-y-1 rounded-xl border border-brand-100 bg-brand-50/70 p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-gray-600">Membership Type</dt>
                <dd className="font-semibold text-gray-900">{profile.membership_type || "N/A"}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-gray-600">Interest Area</dt>
                <dd className="font-semibold text-gray-900">{profile.interest_area || "N/A"}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-gray-600">Contact</dt>
                <dd className="font-semibold text-gray-900">{profile.email || profile.mobile || "N/A"}</dd>
              </div>
            </dl>
          )}

          {cpdRecords.length > 0 && (
            <div className="mt-3 rounded-xl border border-brand-100 bg-brand-50/70 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-700">
                CPD History
              </p>
              <ul className="mt-2 space-y-2 text-sm text-gray-700">
                {cpdRecords.slice(0, 5).map((record) => (
                  <li key={record.id} className="rounded-lg border border-brand-100 bg-white px-2.5 py-2">
                    <p className="font-semibold text-brand-800">{record.title}</p>
                    <p className="text-xs text-gray-500">
                      {record.category} | {record.credit_hours} hrs | {record.attended_on}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {statusMessage && (
            <p className={`mt-3 text-sm ${statusType === "error" ? "text-red-600" : "text-emerald-600"}`}>
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

  return (
    <section className="page-shell section-block">
      <div className="mb-5 overflow-x-auto">
        <div className="inline-flex min-w-max gap-2 rounded-xl border border-slate-200 bg-white p-2">
          {actionTabs.map((tab) => (
            <a
              key={tab.label}
              href={tab.href}
              className="focus-ring rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-slate-100"
            >
              {tab.label}
            </a>
          ))}
        </div>
      </div>

      <SectionHeader
        eyebrow="Membership Portal"
        title="Be a part of IEI Kanyakumari Local Centre"
        description="Benefits of Corporate Membership"
      />

      <Card className="mb-6 bg-gradient-to-r from-brand-700 to-brand-500 p-6 text-white md:p-8" padded={false}>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-100">
          Institutional Membership
        </p>
        <h2 className="mt-2 text-2xl font-semibold md:text-3xl">Professional Membership Gateway</h2>
        <p className="mt-2 max-w-3xl text-sm text-brand-50 md:text-base">
          Join a structured engineering community with standards-based professional development,
          technical resources, certification pathways, and chapter-level collaboration.
        </p>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.35fr,0.85fr]">
        <div className="space-y-6">
          <Card as="section" id="membership-info" className="p-5 md:p-6" padded={false}>
            <h3 className="text-xl font-semibold text-gray-900">Benefits of Corporate Membership</h3>
            <p className="mt-1 text-sm text-gray-600">
              Structured services supporting engineering practice, learning, and long-term career growth.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {membershipBenefits.map((benefit) => (
                <BenefitItem key={benefit} text={benefit} />
              ))}
            </div>
          </Card>

          <Card as="section" id="academics-certification" className="p-5 md:p-6" padded={false}>
            <h3 className="text-xl font-semibold text-gray-900">Academics / Certification</h3>
            <p className="mt-1 text-sm text-gray-600">
              Access guided certification tracks, technical talks, and recognized learning opportunities
              aligned with professional practice.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-brand-100 bg-white p-4">
                <p className="text-sm font-semibold text-gray-900">Structured Learning Pathways</p>
                <p className="mt-1 text-sm text-gray-600">
                  Curated orientation and progression resources for AMIE, MIE, and FIE candidates.
                </p>
              </div>
              <div className="rounded-xl border border-brand-100 bg-white p-4">
                <p className="text-sm font-semibold text-gray-900">Certification Support</p>
                <p className="mt-1 text-sm text-gray-600">
                  Official chapter guidance for exams, documentation, and continuing education records.
                </p>
              </div>
            </div>
          </Card>

          <Card as="section" id="network-activities" className="p-5 md:p-6" padded={false}>
            <h3 className="text-xl font-semibold text-gray-900">Network / Activities</h3>
            <p className="mt-1 text-sm text-gray-600">
              Participate in chapter activities, peer exchanges, technical forums, and institutional events.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-brand-100 bg-white p-4">
                <p className="text-sm font-semibold text-gray-900">Technical Chapters</p>
                <p className="mt-1 text-sm text-gray-600">
                  Engage with focused engineering domains and collaborative chapter groups.
                </p>
              </div>
              <div className="rounded-xl border border-brand-100 bg-white p-4">
                <p className="text-sm font-semibold text-gray-900">Professional Networking</p>
                <p className="mt-1 text-sm text-gray-600">
                  Connect with senior professionals, practitioners, and institutional mentors.
                </p>
              </div>
            </div>
          </Card>

          <Suspense fallback={<LoadingSpinner text="Loading registration module..." />}>
            <MembershipRegisterWizard />
          </Suspense>

          <Card as="section" className="p-5 md:p-6" padded={false}>
            <h3 className="text-xl font-semibold text-gray-900">Membership Categories</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {membershipTypes.map((item) => (
                <article key={item.code} className="rounded-xl border border-brand-100 bg-white p-4">
                  <p className="inline-flex rounded-md bg-brand-100 px-2 py-1 text-xs font-semibold text-brand-700">
                    {item.code}
                  </p>
                  <h4 className="mt-2 text-base font-semibold text-gray-900">{item.title}</h4>
                  <p className="mt-2 text-sm font-semibold text-gray-700">Eligibility</p>
                  <p className="text-sm text-gray-600">{item.eligibility}</p>
                  <p className="mt-2 text-sm font-semibold text-gray-700">Description</p>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  <p className="mt-2 text-sm font-semibold text-gray-700">Fees</p>
                  <p className="text-sm text-gray-600">{item.fees}</p>
                </article>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <Suspense fallback={<LoadingSpinner text="Loading member access panel..." />}>
            <MembershipAuthPanel />
          </Suspense>

          <Suspense fallback={<LoadingSpinner text="Loading member dashboard..." />}>
            <MembershipDashboardCard />
          </Suspense>

          <ProtectedPortalActions isAuthenticated={isAuthenticated} member={member} />

          <Card className="border border-slate-200 p-5" padded={false}>
            <p className="text-sm font-semibold text-gray-900">Portal Support</p>
            <p className="mt-1 text-sm text-gray-600">
              For technical help with account access and membership verification, contact chapter office.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
