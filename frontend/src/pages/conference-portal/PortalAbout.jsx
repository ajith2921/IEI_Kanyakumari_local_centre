import { useOutletContext } from "react-router-dom";
import SectionHeader from "../../components/SectionHeader";
import Card from "../../components/ui/Card";

export default function PortalAbout() {
  const { conference } = useOutletContext();

  return (
    <div className="pb-24 pt-8">
      <div className="page-shell">
        <SectionHeader
          eyebrow="About the Conference"
          title={conference.title}
          description="Discover the objectives, theme, and details of our premier engineering conference."
          className="mb-12"
          contentWidthClassName="max-w-4xl"
        />

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="p-8 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-gray-900">Conference Overview</h2>
              <div className="prose prose-emerald max-w-none text-slate-600">
                <p className="whitespace-pre-wrap leading-relaxed">
                  {conference.description || "Welcome to the IEI Kanyakumari Local Centre's Annual Technical Conference. This event brings together engineering professionals, researchers, and students to exchange knowledge and discuss emerging trends in technology and sustainable engineering."}
                </p>
              </div>

              <h3 className="mt-8 mb-4 text-lg font-bold text-gray-900">Conference Theme</h3>
              <p className="text-slate-600">
                "Advancing Science & Technology for Sustainable Goals"
              </p>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="bg-emerald-50 p-6 shadow-sm">
              <h3 className="mb-4 text-lg font-bold text-emerald-900">Key Information</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Dates</p>
                  <p className="font-medium text-emerald-950">{conference.start_date} – {conference.end_date}</p>
                </div>
                
                <hr className="border-emerald-200" />
                
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Venue</p>
                  <p className="font-medium text-emerald-950">{conference.venue || "To be announced"}</p>
                </div>
                
                <hr className="border-emerald-200" />
                
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Registration</p>
                  <p className="font-medium text-emerald-950">Deadline: {conference.registration_deadline}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
