import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { publicApi } from "../../services/api";
import SectionHeader from "../../components/SectionHeader";
import Card from "../../components/ui/Card";
import LoadingSpinner from "../../components/LoadingSpinner";
import ImageMedia from "../../components/ImageMedia";

export default function PortalSpeakers() {
  const { conference } = useOutletContext();
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchSpeakers = async () => {
      try {
        const res = await publicApi.getConferencePortalResource("speakers", conference.id);
        if (mounted) setSpeakers(res.data?.items || []);
      } catch (err) {
        console.error("Failed to fetch speakers", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (conference?.id) fetchSpeakers();
    else setLoading(false);
    return () => { mounted = false; };
  }, [conference]);

  if (loading) {
    return <div className="flex justify-center p-20"><LoadingSpinner /></div>;
  }

  const keynotes = speakers.filter(s => s.speaker_type === "keynote");
  const invited = speakers.filter(s => s.speaker_type === "invited");

  return (
    <div className="pb-24 pt-8">
      <div className="page-shell">
        <SectionHeader
          eyebrow="Eminent Speakers"
          title="Keynote & Invited Speakers"
          description="Hear from industry leaders and academic pioneers shaping the future of engineering."
          className="mb-12"
        />

        {speakers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            Speakers will be announced soon. Please check back later.
          </div>
        ) : (
          <div className="space-y-16">
            {keynotes.length > 0 && (
              <section>
                <h2 className="mb-8 text-2xl font-bold text-gray-900 border-b pb-2">Keynote Speakers</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {keynotes.map((speaker) => (
                    <SpeakerCard key={speaker.id} speaker={speaker} />
                  ))}
                </div>
              </section>
            )}

            {invited.length > 0 && (
              <section>
                <h2 className="mb-8 text-2xl font-bold text-gray-900 border-b pb-2">Invited Speakers</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {invited.map((speaker) => (
                    <SpeakerCard key={speaker.id} speaker={speaker} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SpeakerCard({ speaker }) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden p-0 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-900/10 bg-white/80 backdrop-blur-xl border-slate-200/60">
      <div className="aspect-[4/4] w-full overflow-hidden bg-slate-100">
        {speaker.image_url ? (
          <ImageMedia 
            src={speaker.image_url} 
            alt={speaker.name} 
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-emerald-50 text-emerald-200 transition-transform duration-700 group-hover:scale-105">
            <svg className="h-20 w-20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{speaker.name}</h3>
        {speaker.designation && <p className="mt-1 text-sm font-semibold text-emerald-600">{speaker.designation}</p>}
        {speaker.organization && <p className="mt-2 text-sm text-slate-500 leading-relaxed">{speaker.organization}</p>}
        {speaker.country && (
          <span className="mt-4 inline-block self-start rounded-full bg-slate-100/80 px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
            {speaker.country}
          </span>
        )}
      </div>
    </Card>
  );
}
