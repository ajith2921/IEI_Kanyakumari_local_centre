import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { publicApi } from "../../services/api";
import SectionHeader from "../../components/SectionHeader";
import Card from "../../components/ui/Card";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function PortalCallForPapers() {
  const { conference } = useOutletContext();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchTracks = async () => {
      try {
        const res = await publicApi.getConferencePortalResource("tracks", conference.id);
        if (mounted) setTracks(res.data?.items || []);
      } catch (err) {
        console.error("Failed to fetch tracks", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (conference?.id) {
      fetchTracks();
    } else {
      setLoading(false);
    }
    return () => { mounted = false; };
  }, [conference]);

  if (loading) {
    return <div className="flex justify-center p-20"><LoadingSpinner /></div>;
  }

  return (
    <div className="pb-24 pt-8">
      <div className="page-shell">
        <SectionHeader
          eyebrow="Call for Papers"
          title="Submission Tracks & Guidelines"
          description="We invite original, unpublished research papers across multiple engineering disciplines."
          className="mb-12"
          contentWidthClassName="max-w-4xl"
        />

        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Conference Tracks</h2>
          
          {tracks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
              Technical tracks will be announced shortly.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tracks.map((track) => (
                <Card key={track.id} className="h-full border-t-4 border-t-emerald-500 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                  <h3 className="mb-3 text-lg font-bold text-gray-900">{track.track_name}</h3>
                  <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">{track.description}</p>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-8 shadow-sm sm:p-10">
          <h2 className="mb-6 text-xl font-bold text-emerald-950">Submission Guidelines</h2>
          <div className="prose prose-emerald max-w-none text-slate-700">
            <ul>
              <li>Papers must be original and not simultaneously submitted to another journal or conference.</li>
              <li>Please format your paper according to the provided IEEE / Springer template.</li>
              <li>Maximum paper length is typically 6-8 pages including references.</li>
              <li>All submissions undergo a double-blind peer review process.</li>
              <li>Accepted and presented papers will be considered for publication in conference proceedings.</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
