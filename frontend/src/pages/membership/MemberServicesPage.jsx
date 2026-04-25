import { Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import SectionHeader from "../../components/SectionHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/LoadingSpinner";

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

export default function MemberServicesPage() {
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
