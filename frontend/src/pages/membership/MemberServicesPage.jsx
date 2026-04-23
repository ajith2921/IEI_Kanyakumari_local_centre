import { Link } from "react-router-dom";
import SectionHeader from "../../components/SectionHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

const serviceItems = [
  "Membership profile access",
  "Certificate download",
  "CPD history",
  "Premium analytics",
  "Account recovery",
  "Portal support",
];

export default function MemberServicesPage() {
  return (
    <section className="page-shell section-block">
      <SectionHeader
        eyebrow="Member Services"
        title="Portal Access and Authenticated Services"
        description="Dedicated service page for sign in, profile actions, and member-only features."
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
              <Button as={Link} to="/membership#auth-panel">Open Sign In Panel</Button>
              <Button as={Link} to="/membership#auth-panel" variant="secondary">
                Forgot Password
              </Button>
              <Button as={Link} to="/membership#apply-membership" variant="secondary">
                New Member Application
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
