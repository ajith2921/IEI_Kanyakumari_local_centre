import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <section className="page-shell flex min-h-[60vh] items-center justify-center py-20">
      <div className="text-center">
        <p className="eyebrow-chip mb-3">Error 404</p>
        <h1 className="heading-h2 mb-3 text-gray-900">Page not found</h1>
        <p className="mx-auto mb-8 max-w-md text-sm text-gray-500">
          The page you are looking for does not exist or has been moved.
        </p>
        <Button as={Link} to="/">
          Back to Home
        </Button>
      </div>
    </section>
  );
}
