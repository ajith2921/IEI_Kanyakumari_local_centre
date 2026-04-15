import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="page-shell py-20 text-center">
      <div className="section-card p-10">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-brand-600">Error 404</p>
        <h1 className="my-3 text-3xl font-black text-brand-800">Page not found</h1>
        <p className="mb-6 text-slate-600">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="rounded-lg bg-brand-700 px-5 py-2 font-semibold text-white hover:bg-brand-800"
        >
          Back to Home
        </Link>
      </div>
    </section>
  );
}
