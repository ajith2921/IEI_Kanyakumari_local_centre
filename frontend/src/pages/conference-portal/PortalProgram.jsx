import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { publicApi } from "../../services/api";
import SectionHeader from "../../components/SectionHeader";
import Card from "../../components/ui/Card";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function PortalProgram() {
  const { conference } = useOutletContext();
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchSchedule = async () => {
      try {
        const res = await publicApi.getConferencePortalResource("schedule", conference.id);
        if (mounted) setSchedule(res.data?.items || []);
      } catch (err) {
        console.error("Failed to fetch schedule", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (conference?.id) fetchSchedule();
    else setLoading(false);
    return () => { mounted = false; };
  }, [conference]);

  if (loading) {
    return <div className="flex justify-center p-20"><LoadingSpinner /></div>;
  }

  // Group by day_label
  const daysMap = {};
  schedule.forEach(item => {
    const day = item.day_label || "General";
    if (!daysMap[day]) daysMap[day] = [];
    daysMap[day].push(item);
  });

  const sortedDays = Object.keys(daysMap).sort();

  return (
    <div className="pb-24 pt-8">
      <div className="page-shell max-w-5xl">
        <SectionHeader
          eyebrow="Agenda"
          title="Program Schedule"
          description="Explore the full itinerary of keynotes, sessions, and networking events."
          className="mb-12"
        />

        {schedule.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            The detailed program schedule will be published shortly.
          </div>
        ) : (
          <div className="space-y-12">
            {sortedDays.map((day, dayIndex) => (
              <div key={day} className="relative rounded-2xl border border-slate-200/80 bg-white/60 backdrop-blur-sm shadow-xl shadow-slate-200/40 overflow-hidden">
                <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 px-8 py-5 border-b border-emerald-950">
                  <h2 className="text-xl font-bold text-white tracking-wide">Day {dayIndex + 1}: {day}</h2>
                </div>
                <div className="relative px-8 py-6">
                  {/* Vertical Timeline Line */}
                  <div className="absolute left-[39px] top-6 bottom-6 w-0.5 bg-emerald-100 hidden sm:block"></div>
                  
                  <div className="space-y-8 relative">
                    {daysMap[day].map((session, index) => (
                      <div key={session.id} className="group relative flex flex-col sm:flex-row gap-6 transition-all">
                        {/* Timeline Dot */}
                        <div className="hidden sm:flex absolute left-[-21px] top-1.5 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-emerald-50 group-hover:scale-125 transition-transform duration-300"></div>
                        
                        <div className="sm:w-40 flex-shrink-0 pt-0.5">
                          <span className="inline-block px-3 py-1 text-sm font-bold text-emerald-700 bg-emerald-50 rounded-md border border-emerald-100 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                            {session.start_time} - {session.end_time}
                          </span>
                        </div>
                        <div className="flex-1 bg-white p-5 rounded-xl border border-slate-100 shadow-sm group-hover:shadow-md group-hover:border-emerald-100 transition-all duration-300">
                          <h3 className="text-lg font-bold text-slate-900 mb-1">{session.session_title}</h3>
                          {session.speaker_name && (
                            <p className="text-emerald-600 font-semibold mb-3">{session.speaker_name}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                            {session.session_type && (
                              <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md">
                                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                {session.session_type}
                              </span>
                            )}
                            {session.venue_room && (
                              <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md">
                                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {session.venue_room}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
