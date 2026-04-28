import { Suspense, lazy, useState } from "react";
import { Link } from "react-router-dom";
import SectionHeader from "../../components/SectionHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/LoadingSpinner";
import { parseApiError, publicApi } from "../../services/api";

const MembershipAuthPanel = lazy(() =>
  import("../../components/membership/MembershipAuthPanel")
);

const serviceItems = [
  "Membership profile access",
  "Certificate download",
  "CPD history",
  "Premium analytics",
  "Account recovery",
  "Portal support",
];

const faqItems = [
  {
    question: "How do I access my membership dashboard?",
    answer: "Sign in through the Member Access panel in the membership portal using membership number, email, or mobile.",
  },
  {
    question: "When is premium access activated?",
    answer: "Premium access is enabled after verified payment confirmation and subscription activation.",
  },
  {
    question: "How can I reset my password?",
    answer: "Use the forgot-password flow from the sign-in panel and complete OTP verification.",
  },
];

const DISCREPANCY_TICKET_PATTERN = /^DISC-\d{4}-\d{4}$/i;
const DESPATCH_REFERENCE_PATTERN = /^DSP-\d{4}-\d{5}$/i;

export default function MemberServicesPage() {
  const [memberQuery, setMemberQuery] = useState("");
  const [memberSearchDone, setMemberSearchDone] = useState(false);
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberError, setMemberError] = useState("");
  const [memberResults, setMemberResults] = useState([]);

  const [centreQuery, setCentreQuery] = useState("");
  const [centreSearchDone, setCentreSearchDone] = useState(false);
  const [centreLoading, setCentreLoading] = useState(false);
  const [centreError, setCentreError] = useState("");
  const [centreResults, setCentreResults] = useState([]);

  const [despatchRef, setDespatchRef] = useState("");
  const [despatchCheckDone, setDespatchCheckDone] = useState(false);
  const [despatchLoading, setDespatchLoading] = useState(false);
  const [despatchError, setDespatchError] = useState("");
  const [despatchResult, setDespatchResult] = useState(null);

  const [engineerQuery, setEngineerQuery] = useState("");
  const [engineerSearchDone, setEngineerSearchDone] = useState(false);
  const [engineerLoading, setEngineerLoading] = useState(false);
  const [engineerError, setEngineerError] = useState("");
  const [engineerResults, setEngineerResults] = useState([]);

  const [discrepancyRef, setDiscrepancyRef] = useState("");
  const [discrepancyCheckDone, setDiscrepancyCheckDone] = useState(false);
  const [discrepancyLoading, setDiscrepancyLoading] = useState(false);
  const [discrepancyError, setDiscrepancyError] = useState("");
  const [discrepancyResult, setDiscrepancyResult] = useState(null);

  const discrepancyHasValue = Boolean(discrepancyRef.trim());
  const despatchHasValue = Boolean(despatchRef.trim());
  const discrepancyFormatIsValid = !discrepancyHasValue || DISCREPANCY_TICKET_PATTERN.test(discrepancyRef.trim());
  const despatchFormatIsValid = !despatchHasValue || DESPATCH_REFERENCE_PATTERN.test(despatchRef.trim());

  const handleMemberSearch = async (event) => {
    event.preventDefault();
    setMemberSearchDone(true);
    setMemberLoading(true);
    setMemberError("");

    try {
      const response = await publicApi.searchMembershipMembers(memberQuery.trim());
      setMemberResults(Array.isArray(response.data?.items) ? response.data.items : []);
    } catch (error) {
      setMemberResults([]);
      setMemberError(parseApiError(error));
    } finally {
      setMemberLoading(false);
    }
  };

  const handleCentreSearch = async (event) => {
    event.preventDefault();
    setCentreSearchDone(true);
    setCentreLoading(true);
    setCentreError("");

    try {
      const response = await publicApi.searchMembershipCentres(centreQuery.trim());
      setCentreResults(Array.isArray(response.data?.items) ? response.data.items : []);
    } catch (error) {
      setCentreResults([]);
      setCentreError(parseApiError(error));
    } finally {
      setCentreLoading(false);
    }
  };

  const handleEngineerSearch = async (event) => {
    event.preventDefault();
    setEngineerSearchDone(true);
    setEngineerLoading(true);
    setEngineerError("");

    try {
      const response = await publicApi.searchPracticingEngineers(engineerQuery.trim());
      setEngineerResults(Array.isArray(response.data?.items) ? response.data.items : []);
    } catch (error) {
      setEngineerResults([]);
      setEngineerError(parseApiError(error));
    } finally {
      setEngineerLoading(false);
    }
  };

  const handleDiscrepancySearch = async (event) => {
    event.preventDefault();
    setDiscrepancyCheckDone(true);
    setDiscrepancyLoading(true);
    setDiscrepancyError("");
    setDiscrepancyResult(null);

    const normalizedTicket = discrepancyRef.trim();
    if (!normalizedTicket) {
      setDiscrepancyLoading(false);
      setDiscrepancyError("Discrepancy ticket is required.");
      return;
    }

    if (!DISCREPANCY_TICKET_PATTERN.test(normalizedTicket)) {
      setDiscrepancyLoading(false);
      setDiscrepancyError("Use valid format: DISC-YYYY-NNNN (example: DISC-2026-0782).");
      return;
    }

    try {
      const response = await publicApi.getDiscrepancyStatus(normalizedTicket);
      setDiscrepancyResult(response.data || null);
    } catch (error) {
      setDiscrepancyError(parseApiError(error));
    } finally {
      setDiscrepancyLoading(false);
    }
  };

  const handleDespatchSearch = async (event) => {
    event.preventDefault();
    setDespatchCheckDone(true);
    setDespatchLoading(true);
    setDespatchError("");
    setDespatchResult(null);

    const normalizedReference = despatchRef.trim();
    if (!normalizedReference) {
      setDespatchLoading(false);
      setDespatchError("Despatch reference is required.");
      return;
    }

    if (!DESPATCH_REFERENCE_PATTERN.test(normalizedReference)) {
      setDespatchLoading(false);
      setDespatchError("Use valid format: DSP-YYYY-NNNNN (example: DSP-2026-11483).");
      return;
    }

    try {
      const response = await publicApi.getDespatchStatus(normalizedReference);
      setDespatchResult(response.data || null);
    } catch (error) {
      setDespatchError(parseApiError(error));
    } finally {
      setDespatchLoading(false);
    }
  };

  return (
    <section className="page-shell section-block">
      <SectionHeader
        eyebrow="Member Services"
        title="Portal Access and Authenticated Services"
        description="Dedicated service page for sign in, profile actions, subscriptions, and member-only features."
      />

      <div className="grid gap-4 lg:grid-cols-[1.2fr,0.8fr]">
        <Card className="border-gray-200 bg-white" padded={false}>
          <div className="p-6">
            <h3 className="text-base font-semibold text-gray-900">Available Services</h3>
            <ul className="mt-3 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
              {serviceItems.map((item) => (
                <li key={item} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Card>

        <Card className="border-gray-200 bg-gray-50" padded={false}>
          <div className="p-6">
            <h3 className="text-base font-semibold text-gray-900">Quick Actions</h3>
            <div className="mt-4 grid gap-3">
              <Button as={Link} to="/membership/member-services#auth-panel" variant="secondary">
                Open Sign In Panel
              </Button>
              <Button as={Link} to="/membership/member-services#faq" variant="secondary">
                Forgot Password
              </Button>
              <Button as={Link} to="/membership/become-member" variant="secondary">
                New Member Application
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div id="auth-panel" className="mt-6 scroll-mt-28">
        <Suspense fallback={<LoadingSpinner text="Loading member access panel..." />}>
          <MembershipAuthPanel />
        </Suspense>
      </div>

      <Card id="fees-subscriptions" className="mt-6 border-gray-200 bg-white p-6 scroll-mt-28" padded={false}>
        <h3 className="text-lg font-semibold text-gray-900">Fees & Subscriptions</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Membership fees and premium subscriptions are managed through approved chapter rules and secure payment flow.
        </p>
      </Card>

      <Card id="upgrade-membership" className="mt-6 border-gray-200 bg-white p-6 scroll-mt-28" padded={false}>
        <h3 className="text-lg font-semibold text-gray-900">Upgrade Membership</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Members can apply for grade upgradation by updating profile documents, validating eligibility, and submitting the
          required review forms through the member services workflow.
        </p>
      </Card>

      <Card id="institutional-membership" className="mt-6 border-gray-200 bg-white p-6 scroll-mt-28" padded={false}>
        <h3 className="text-lg font-semibold text-gray-900">Institutional Membership</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Institutions can enroll for membership by submitting organization details, accreditation references, and authorized
          representative information for approval.
        </p>
      </Card>

      <Card id="find-member" className="mt-6 border-gray-200 bg-white p-6 scroll-mt-28" padded={false}>
        <h3 className="text-lg font-semibold text-gray-900">Find a Member</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Search registered member records using membership number or verified identity details.
        </p>

        <form className="mt-4 grid gap-3 md:grid-cols-[1fr,auto]" onSubmit={handleMemberSearch}>
          <label className="text-sm text-gray-700" htmlFor="member-search-input">
            <span className="mb-1 block font-medium">Membership No. / Name / Centre</span>
            <input
              id="member-search-input"
              type="text"
              value={memberQuery}
              onChange={(event) => setMemberQuery(event.target.value)}
              placeholder="Example: M-21084 or Kolkata"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-[#0b3a67] focus:ring-1 focus:ring-[#0b3a67]"
            />
          </label>
          <Button type="submit" className="h-10 self-end" disabled={memberLoading}>
            {memberLoading ? "Searching..." : "Search Member"}
          </Button>
        </form>

        {memberSearchDone ? (
          <div className="mt-4 grid gap-2 text-sm text-gray-700">
            {memberError ? (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">{memberError}</p>
            ) : memberResults.length > 0 ? (
              memberResults.map((item) => (
                <article key={item.id} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <p className="text-gray-600">{item.id} • {item.grade} • {item.centre}</p>
                </article>
              ))
            ) : (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
                No matching member found for this query.
              </p>
            )}
          </div>
        ) : null}
      </Card>

      <Card id="find-nearest-centre" className="mt-6 border-gray-200 bg-white p-6 scroll-mt-28" padded={false}>
        <h3 className="text-lg font-semibold text-gray-900">Find Nearest Centre</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Locate the nearest IEI centre for membership assistance, chapter activities, and local services.
        </p>

        <form className="mt-4 grid gap-3 md:grid-cols-[1fr,auto]" onSubmit={handleCentreSearch}>
          <label className="text-sm text-gray-700" htmlFor="centre-search-input">
            <span className="mb-1 block font-medium">City / Centre Code</span>
            <input
              id="centre-search-input"
              type="text"
              value={centreQuery}
              onChange={(event) => setCentreQuery(event.target.value)}
              placeholder="Example: Chennai or CTR-14"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-[#0b3a67] focus:ring-1 focus:ring-[#0b3a67]"
            />
          </label>
          <Button type="submit" variant="secondary" className="h-10 self-end" disabled={centreLoading}>
            {centreLoading ? "Searching..." : "Find Centre"}
          </Button>
        </form>

        {centreSearchDone ? (
          <div className="mt-4 grid gap-2 text-sm text-gray-700">
            {centreError ? (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">{centreError}</p>
            ) : centreResults.length > 0 ? (
              centreResults.map((item) => (
                <article key={item.code} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                  <p className="font-semibold text-gray-900">{item.city} Centre ({item.code})</p>
                  <p className="text-gray-600">{item.address}</p>
                </article>
              ))
            ) : (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
                No centre matched this location or code.
              </p>
            )}
          </div>
        ) : null}
      </Card>

      <Card id="practicing-chartered-engineer" className="mt-6 border-gray-200 bg-white p-6 scroll-mt-28" padded={false}>
        <h3 className="text-lg font-semibold text-gray-900">Practicing Chartered Engineer</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Verify practicing chartered engineer profiles and certification-linked professional standing.
        </p>

        <form className="mt-4 grid gap-3 md:grid-cols-[1fr,auto]" onSubmit={handleEngineerSearch}>
          <label className="text-sm text-gray-700" htmlFor="practicing-engineer-input">
            <span className="mb-1 block font-medium">License / Name / Discipline</span>
            <input
              id="practicing-engineer-input"
              type="text"
              value={engineerQuery}
              onChange={(event) => setEngineerQuery(event.target.value)}
              placeholder="Example: PCE-3011 or Civil"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-[#0b3a67] focus:ring-1 focus:ring-[#0b3a67]"
            />
          </label>
          <Button type="submit" variant="secondary" className="h-10 self-end" disabled={engineerLoading}>
            {engineerLoading ? "Verifying..." : "Verify Engineer"}
          </Button>
        </form>

        {engineerSearchDone ? (
          <div className="mt-4 grid gap-2 text-sm text-gray-700">
            {engineerError ? (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">{engineerError}</p>
            ) : engineerResults.length > 0 ? (
              engineerResults.map((item) => (
                <article key={item.license} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  <p className="text-gray-600">{item.license} • {item.discipline}</p>
                  <p className="text-gray-600">{item.validity}</p>
                </article>
              ))
            ) : (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800">
                No practicing chartered engineer record found for this query.
              </p>
            )}
          </div>
        ) : null}
      </Card>

      <Card id="find-discrepancies" className="mt-6 border-gray-200 bg-white p-6 scroll-mt-28" padded={false}>
        <h3 className="text-lg font-semibold text-gray-900">Find Discrepancies</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Report and track membership profile discrepancies related to records, credentials, or issuance details.
        </p>

        <form className="mt-4 grid gap-3 md:grid-cols-[1fr,auto]" onSubmit={handleDiscrepancySearch}>
          <label className="text-sm text-gray-700" htmlFor="discrepancy-reference-input">
            <span className="mb-1 block font-medium">Discrepancy Ticket</span>
            <input
              id="discrepancy-reference-input"
              type="text"
              value={discrepancyRef}
              onChange={(event) => setDiscrepancyRef(event.target.value)}
              placeholder="Example: DISC-2026-0782"
              aria-invalid={!discrepancyFormatIsValid}
              className={`w-full rounded-md px-3 py-2 text-sm outline-none transition focus:ring-1 ${
                discrepancyFormatIsValid
                  ? "border border-gray-300 focus:border-[#0b3a67] focus:ring-[#0b3a67]"
                  : "border border-rose-300 focus:border-rose-500 focus:ring-rose-500"
              }`}
            />
            <span className={`mt-1 block text-xs ${discrepancyFormatIsValid ? "text-gray-500" : "text-rose-600"}`}>
              Format: DISC-YYYY-NNNN
            </span>
          </label>
          <Button
            type="submit"
            className="h-10 self-end"
            disabled={discrepancyLoading || !discrepancyRef.trim() || !discrepancyFormatIsValid}
          >
            {discrepancyLoading ? "Checking..." : "Track Ticket"}
          </Button>
        </form>

        {discrepancyCheckDone ? (
          discrepancyError ? (
            <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {discrepancyError}
            </p>
          ) : discrepancyResult ? (
            <article className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-3 text-sm text-blue-900">
              <p className="font-semibold">{discrepancyResult.ticket}</p>
              <p className="mt-1">Category: {discrepancyResult.category}</p>
              <p>Status: {discrepancyResult.status}</p>
              <p>Last Updated: {discrepancyResult.updated_on}</p>
            </article>
          ) : (
            <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Discrepancy ticket not found. Please verify your ticket ID.
            </p>
          )
        ) : null}
      </Card>

      <Card id="check-despatch-status" className="mt-6 border-gray-200 bg-white p-6 scroll-mt-28" padded={false}>
        <h3 className="text-lg font-semibold text-gray-900">Check Despatch Status</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Track certificate, ID card, and document despatch progress using your request reference.
        </p>

        <form className="mt-4 grid gap-3 md:grid-cols-[1fr,auto]" onSubmit={handleDespatchSearch}>
          <label className="text-sm text-gray-700" htmlFor="despatch-reference-input">
            <span className="mb-1 block font-medium">Despatch Reference</span>
            <input
              id="despatch-reference-input"
              type="text"
              value={despatchRef}
              onChange={(event) => setDespatchRef(event.target.value)}
              placeholder="Example: DSP-2026-11483"
              aria-invalid={!despatchFormatIsValid}
              className={`w-full rounded-md px-3 py-2 text-sm outline-none transition focus:ring-1 ${
                despatchFormatIsValid
                  ? "border border-gray-300 focus:border-[#0b3a67] focus:ring-[#0b3a67]"
                  : "border border-rose-300 focus:border-rose-500 focus:ring-rose-500"
              }`}
            />
            <span className={`mt-1 block text-xs ${despatchFormatIsValid ? "text-gray-500" : "text-rose-600"}`}>
              Format: DSP-YYYY-NNNNN
            </span>
          </label>
          <Button
            type="submit"
            className="h-10 self-end"
            disabled={despatchLoading || !despatchRef.trim() || !despatchFormatIsValid}
          >
            {despatchLoading ? "Checking..." : "Check Status"}
          </Button>
        </form>

        {despatchCheckDone ? (
          despatchError ? (
            <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {despatchError}
            </p>
          ) : despatchResult ? (
            <article className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-900">
              <p className="font-semibold">{despatchResult.item}</p>
              <p className="mt-1">Reference: {despatchResult.reference}</p>
              <p>Status: {despatchResult.status}</p>
              <p>Last Updated: {despatchResult.updated_on}</p>
            </article>
          ) : (
            <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Reference not found. Please check the despatch number and try again.
            </p>
          )
        ) : null}
      </Card>

      <Card id="faq" className="mt-6 border-gray-200 bg-white p-6 scroll-mt-28" padded={false}>
        <h3 className="text-lg font-semibold text-gray-900">FAQ</h3>
        <div className="mt-3 space-y-3">
          {faqItems.map((item) => (
            <article key={item.question} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <p className="text-sm font-semibold text-gray-900">{item.question}</p>
              <p className="mt-1 text-sm text-gray-600">{item.answer}</p>
            </article>
          ))}
        </div>
      </Card>
    </section>
  );
}
