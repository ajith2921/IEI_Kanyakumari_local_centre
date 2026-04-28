import { Suspense, lazy } from "react";
import SectionHeader from "../../components/SectionHeader";
import Card from "../../components/ui/Card";
import LoadingSpinner from "../../components/LoadingSpinner";

const MembershipRegisterWizard = lazy(() =>
  import("../../components/membership/MembershipRegisterWizard")
);

const onboardingSteps = [
  {
    step: "01",
    title: "Create Application",
    detail:
      "Begin your application profile and provide your qualification and professional details.",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <polyline points="10 9 9 9 8 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    step: "02",
    title: "Verification Review",
    detail:
      "Chapter admin validates eligibility and membership category details.",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    step: "03",
    title: "Portal Activation",
    detail:
      "After approval, sign in to access member dashboard, CPD services, and downloads.",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

const trustStats = [
  { value: "100+", label: "IEI Centres" },
  { value: "1920", label: "Established" },
  { value: "3", label: "Membership Grades" },
  { value: "National", label: "Statutory Body" },
];

const eligibilityPoints = [
  "Hold a recognized engineering diploma, degree, or equivalent qualification",
  "Have relevant professional experience (for MIE / FIE grades)",
  "Be willing to uphold IEI's code of professional conduct",
];

export default function BecomeMemberPage() {
  return (
    <section className="page-shell section-block">
      <SectionHeader
        eyebrow="Membership Portal"
        title="Become a Member"
        description="Dedicated onboarding space for new applicants and first-time profile activation."
      />

      {/* ── Trust stats band ── */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {trustStats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center rounded-2xl border border-[#d4e1f1] bg-[#f0f6ff] px-4 py-4 text-center"
          >
            <span className="text-2xl font-bold tracking-tight text-[#0b3a67]">{stat.value}</span>
            <span className="mt-1 text-xs font-medium text-[#5b7ea0]">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* ── Numbered onboarding steps ── */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {onboardingSteps.map((step, index) => (
          <div key={step.step} className="relative flex flex-col">
            <Card className="h-full border-gray-200 bg-white" padded={false}>
              <div className="p-6">
                {/* Step number + icon */}
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#0b3a67] text-sm font-bold text-white">
                    {step.step}
                  </span>
                  <span className="text-[#0b3a67]">{step.icon}</span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">{step.detail}</p>
              </div>
            </Card>
            {/* Connector arrow (desktop) */}
            {index < onboardingSteps.length - 1 && (
              <div className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 md:flex">
                <span className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm">
                  <svg className="h-3 w-3 text-gray-400" viewBox="0 0 12 12" fill="none">
                    <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Eligibility quick-check ── */}
      <Card className="mb-6 border border-[#d4e1f1] bg-[#f7fbff]" padded={false}>
        <div className="p-5">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-[#0b3a67]" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
              <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p className="text-sm font-semibold text-[#0b3a67]">Eligibility Quick-Check</p>
          </div>
          <ul className="mt-3 space-y-2">
            {eligibilityPoints.map((point) => (
              <li key={point} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="mt-[0.3rem] inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#0b3a67]" />
                {point}
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* ── Registration Wizard ── */}
      <div>
        <Suspense fallback={<LoadingSpinner text="Loading registration module..." />}>
          <MembershipRegisterWizard />
        </Suspense>
      </div>
    </section>
  );
}
