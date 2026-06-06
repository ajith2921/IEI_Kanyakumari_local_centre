import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { publicApi } from "../../services/api";
import SectionHeader from "../../components/SectionHeader";
import Card from "../../components/ui/Card";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function PortalCommittees() {
  const { conference } = useOutletContext();
  const [committees, setCommittees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchCommittees = async () => {
      try {
        const res = await publicApi.getConferencePortalResource("committees", conference.id);
        if (mounted) setCommittees(res.data?.items || []);
      } catch (err) {
        console.error("Failed to fetch committees", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (conference?.id) fetchCommittees();
    else setLoading(false);
    return () => { mounted = false; };
  }, [conference]);

  if (loading) {
    return <div className="flex justify-center p-20"><LoadingSpinner /></div>;
  }

  // Group committees by role
  const rolesMap = {};
  committees.forEach(c => {
    const role = c.role || "Other Members";
    if (!rolesMap[role]) rolesMap[role] = [];
    rolesMap[role].push(c);
  });
  
  // Sort roles to ensure Patrons/Chairmen appear first if possible
  const rolePriority = {
    "Chief Patron": 1,
    "Patron": 2,
    "General Chair": 3,
    "Chairman": 4,
    "Organizing Secretary": 5,
    "Technical Committee": 6,
    "Advisory Committee": 7,
  };
  
  const sortedRoles = Object.keys(rolesMap).sort((a, b) => {
    const aPriority = rolePriority[a] || 99;
    const bPriority = rolePriority[b] || 99;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return a.localeCompare(b);
  });

  return (
    <div className="pb-24 pt-8">
      <div className="page-shell max-w-5xl">
        <SectionHeader
          eyebrow="Organization"
          title="Conference Committees"
          description="Meet the dedicated individuals organizing and guiding this conference."
          className="mb-12"
        />

        {committees.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            Committee members will be announced soon.
          </div>
        ) : (
          <div className="grid gap-12">
            {sortedRoles.map(role => (
              <section key={role} className="relative">
                <h2 className="mb-8 flex items-center text-2xl font-bold text-gray-900 border-b border-slate-200 pb-3">
                  <span className="w-1.5 h-6 bg-emerald-500 rounded-full mr-3 inline-block"></span>
                  {role}
                </h2>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {rolesMap[role].map(member => (
                    <Card key={member.id} className="group p-6 bg-white/80 backdrop-blur-sm border border-slate-200/80 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/5 hover:border-emerald-200">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{member.member_name}</h3>
                      {member.designation && <p className="mt-1 text-sm font-semibold text-emerald-600">{member.designation}</p>}
                      {member.organization && <p className="mt-2 text-sm text-slate-500">{member.organization}</p>}
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
