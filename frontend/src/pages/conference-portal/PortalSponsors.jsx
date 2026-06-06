import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { publicApi } from "../../services/api";
import SectionHeader from "../../components/SectionHeader";
import Card from "../../components/ui/Card";
import LoadingSpinner from "../../components/LoadingSpinner";
import ImageMedia from "../../components/ImageMedia";

export default function PortalSponsors() {
  const { conference } = useOutletContext();
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchSponsors = async () => {
      try {
        const res = await publicApi.getConferencePortalResource("sponsors", conference.id);
        if (mounted) setSponsors(res.data?.items || []);
      } catch (err) {
        console.error("Failed to fetch sponsors", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (conference?.id) fetchSponsors();
    else setLoading(false);
    return () => { mounted = false; };
  }, [conference]);

  if (loading) {
    return <div className="flex justify-center p-20"><LoadingSpinner /></div>;
  }

  // Group sponsors by category
  const categoryMap = {};
  sponsors.forEach(s => {
    const category = s.category || "General Sponsor";
    if (!categoryMap[category]) categoryMap[category] = [];
    categoryMap[category].push(s);
  });
  
  // Sort categories
  const categoryPriority = {
    "Title Sponsor": 1,
    "Platinum Sponsor": 2,
    "Gold Sponsor": 3,
    "Silver Sponsor": 4,
    "Bronze Sponsor": 5,
    "Exhibitor": 6,
    "Academic Partner": 7,
    "Media Partner": 8,
  };
  
  const sortedCategories = Object.keys(categoryMap).sort((a, b) => {
    const aPriority = categoryPriority[a] || 99;
    const bPriority = categoryPriority[b] || 99;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return a.localeCompare(b);
  });

  return (
    <div className="pb-24 pt-8">
      <div className="page-shell max-w-5xl">
        <SectionHeader
          eyebrow="Partners"
          title="Our Sponsors & Partners"
          description="We gratefully acknowledge the support of our sponsors in making this conference a success."
          className="mb-16"
        />

        {sponsors.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            Sponsors will be announced soon.
          </div>
        ) : (
          <div className="space-y-16">
            {sortedCategories.map(category => (
              <section key={category}>
                <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">{category}s</h2>
                <div className="flex flex-wrap justify-center gap-8">
                  {categoryMap[category].map(sponsor => (
                    <a 
                      key={sponsor.id} 
                      href={sponsor.website_url || "#"} 
                      target={sponsor.website_url ? "_blank" : "_self"} 
                      rel="noopener noreferrer"
                      className="group flex h-40 w-64 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md"
                    >
                      {sponsor.logo_url ? (
                        <img 
                          src={sponsor.logo_url} 
                          alt={sponsor.name} 
                          className="max-h-full max-w-full object-contain grayscale transition-all duration-300 group-hover:grayscale-0"
                        />
                      ) : (
                        <span className="text-xl font-bold text-slate-400 group-hover:text-emerald-700">{sponsor.name}</span>
                      )}
                    </a>
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
