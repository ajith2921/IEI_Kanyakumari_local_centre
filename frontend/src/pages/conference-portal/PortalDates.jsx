import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { publicApi } from "../../services/api";
import SectionHeader from "../../components/SectionHeader";
import Card from "../../components/ui/Card";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function PortalDates() {
  const { conference } = useOutletContext();
  const [stateDates, setStateDates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchDates = async () => {
      try {
        const res = await publicApi.getConferencePortalResource("dates", conference.id);
        if (mounted) setStateDates(res.data?.items || []);
      } catch (err) {
        console.error("Failed to fetch dates", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (conference?.id) {
      fetchDates();
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
      <div className="page-shell max-w-4xl">
        <SectionHeader
          eyebrow="Timeline"
          title="Important Dates"
          description="Keep track of all the key deadlines and milestones for the conference."
          className="mb-12"
        />

        <Card className="overflow-hidden p-0 shadow-sm">
          {stateDates.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No important dates have been announced yet. Please check back later.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {stateDates.map((item, index) => (
                <div key={item.id || index} className="flex flex-col p-6 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50 transition-colors">
                  <div className="mb-2 sm:mb-0">
                    <h3 className="text-base font-medium text-slate-900">{item.label}</h3>
                    {item.is_extended && (
                      <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-amber-800 uppercase">
                        Extended
                      </span>
                    )}
                  </div>
                  <div className="text-left font-semibold text-emerald-700 sm:text-right sm:text-lg">
                    {item.date_value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
