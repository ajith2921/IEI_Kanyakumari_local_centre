import { Suspense, lazy } from "react";
import SectionHeader from "../../components/SectionHeader";
import Card from "../../components/ui/Card";
import LoadingSpinner from "../../components/LoadingSpinner";

const MembershipRegisterWizard = lazy(() =>
  import("../../components/membership/MembershipRegisterWizard")
);

const onboardingSteps = [
  {
    title: "Create Application",
    detail: "Begin your application profile and provide your qualification and professional details.",
  },
  {
    title: "Verification Review",
    detail: "Chapter admin validates eligibility and membership category details.",
  },
  {
    title: "Portal Activation",
    detail: "After approval, sign in to access member dashboard, CPD services, and downloads.",
  },
];

export default function BecomeMemberPage() {
  return (
    <section className="page-shell section-block">
      <SectionHeader
        eyebrow="Membership Website"
        title="Become a Member"
        description="Dedicated onboarding space for new applicants and first-time profile activation."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {onboardingSteps.map((step) => (
          <Card key={step.title} className="border-gray-200 bg-white" padded={false}>
            <div className="p-6">
              <h3 className="text-base font-semibold text-gray-900">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">{step.detail}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <Suspense fallback={<LoadingSpinner text="Loading registration module..." />}>
          <MembershipRegisterWizard />
        </Suspense>
      </div>
    </section>
  );
}
