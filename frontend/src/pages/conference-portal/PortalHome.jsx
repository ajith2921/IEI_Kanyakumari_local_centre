import { useOutletContext } from "react-router-dom";
import SectionHeader from "../../components/SectionHeader";
import Card from "../../components/ui/Card";

export default function PortalHome() {
  const { conference } = useOutletContext();

  const formatDate = (dateString) => {
    if (!dateString) return "TBA";
    try {
      return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="pb-24">
      {/* Hero Section */}
      <header className="relative w-full overflow-hidden bg-gradient-to-br from-slate-900 via-[#0a231f] to-emerald-950 px-6 py-20 pb-32 sm:px-10 sm:py-24 sm:pb-36 shadow-2xl">
        <div className="pointer-events-none absolute -right-48 -top-48 h-96 w-96 rounded-full bg-emerald-500/20 blur-[100px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-teal-400/10 blur-[80px]" />
        <div className="pointer-events-none absolute inset-0 opacity-10 [background-image:linear-gradient(to_right,rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.2)_1px,transparent_1px)] [background-size:40px_40px]" />

        <div className="page-shell relative z-10 mx-auto max-w-5xl text-center">
          <p className="mb-4 inline-block rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-300 ring-1 ring-inset ring-emerald-500/20 backdrop-blur-md">
            Welcome to the Conference Portal
          </p>
          <h1 className="mx-auto mt-4 max-w-4xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl text-balance">
            {conference.title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-emerald-100/80 sm:text-xl whitespace-pre-wrap text-balance">
            {conference.description || "A premier platform for engineers, researchers, and academics to share knowledge, present innovations, and collaborate on technical challenges."}
          </p>
        </div>
      </header>

      <div className="page-shell relative z-20 -mt-16 max-w-5xl mx-auto">
        {/* Quick Stats / Info - Overlapping Cards */}
        <section className="mb-20">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="group rounded-2xl border border-slate-200/60 bg-white/90 p-6 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-200">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Dates</p>
              <p className="mt-3 text-lg font-bold text-slate-800">{formatDate(conference.start_date)}</p>
              <p className="text-sm font-medium text-slate-500">to {formatDate(conference.end_date)}</p>
            </div>
            
            <div className="group rounded-2xl border border-slate-200/60 bg-white/90 p-6 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-200">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Venue</p>
              <p className="mt-3 text-lg font-bold text-slate-800">{conference.venue || "TBA"}</p>
            </div>
            
            <div className="group rounded-2xl border border-slate-200/60 bg-white/90 p-6 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-200">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Registration</p>
              <p className="mt-3 text-sm font-medium text-slate-500">Closes</p>
              <p className="text-lg font-bold text-slate-800">{formatDate(conference.registration_deadline)}</p>
            </div>
            
            <div className="group relative overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50/90 p-6 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-300">
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-200/50 blur-2xl" />
              <p className="relative z-10 text-[11px] font-bold uppercase tracking-widest text-emerald-600">Status</p>
              <p className="relative z-10 mt-3 text-2xl font-black capitalize text-emerald-900 tracking-tight">{conference.status}</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
