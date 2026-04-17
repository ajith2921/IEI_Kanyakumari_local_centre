import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

export default function NotFound() {
  return (
    <section className="page-shell py-20 text-center">
      <Card className="p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">Error 404</p>
        <h1 className="my-3 text-3xl font-semibold text-gray-900">Page not found</h1>
        <p className="mb-6 text-gray-600">
          The page you are looking for does not exist or has been moved.
        </p>
        <Button as={Link} to="/">
          Back to Home
        </Button>
      </Card>
    </section>
  );
}
