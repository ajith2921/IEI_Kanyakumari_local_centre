import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { publicApi } from "../../services/api";
import SectionHeader from "../../components/SectionHeader";
import Card from "../../components/ui/Card";
import LoadingSpinner from "../../components/LoadingSpinner";
import ImageMedia from "../../components/ImageMedia";

export default function PortalVenue() {
  const { conference } = useOutletContext();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchVenue = async () => {
      try {
        const res = await publicApi.getConferencePortalResource("venue", conference.id);
        if (mounted && res.data?.items?.length > 0) {
          setVenue(res.data.items[0]);
        }
      } catch (err) {
        console.error("Failed to fetch venue", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (conference?.id) fetchVenue();
    else setLoading(false);
    return () => { mounted = false; };
  }, [conference]);

  if (loading) {
    return <div className="flex justify-center p-20"><LoadingSpinner /></div>;
  }

  if (!venue) {
    return (
      <div className="pb-24 pt-8">
        <div className="page-shell max-w-4xl">
          <SectionHeader
            eyebrow="Location"
            title="Venue & Accommodation"
            description="Details about the conference venue and accommodation options."
          />
          <Card className="p-8 shadow-sm">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Conference Venue</h2>
            <div className="flex items-start gap-3 text-slate-600">
              <svg className="mt-1 h-5 w-5 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p className="font-medium text-slate-800">{conference.venue || "Venue to be announced"}</p>
                <p className="mt-1 text-sm text-slate-500">More detailed information regarding travel and stay will be updated soon.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-8">
      <div className="page-shell">
        <SectionHeader
          eyebrow="Location"
          title="Venue & Accommodation"
          description="Find all the information you need to reach the conference venue and book your stay."
          className="mb-12"
        />

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Venue Details */}
          <div className="flex flex-col gap-6">
            <Card className="flex-1 p-8 shadow-sm">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">{venue.venue_name}</h2>
              <div className="mb-6 flex items-start gap-3 text-slate-600">
                <svg className="mt-1 h-5 w-5 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p>{venue.address}</p>
                  <p>{venue.city}{venue.state ? `, ${venue.state}` : ''} {venue.pincode}</p>
                </div>
              </div>

              {venue.directions && (
                <div className="mb-6">
                  <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-500">How to reach</h3>
                  <p className="whitespace-pre-wrap text-sm text-slate-700">{venue.directions}</p>
                </div>
              )}

              {venue.nearby_hotels && (
                <div>
                  <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-slate-500">Nearby Hotels</h3>
                  <p className="whitespace-pre-wrap text-sm text-slate-700">{venue.nearby_hotels}</p>
                </div>
              )}
            </Card>

            {venue.image_url && (
              <div className="overflow-hidden rounded-2xl shadow-sm">
                <ImageMedia src={venue.image_url} alt={venue.venue_name} className="h-64 w-full object-cover" />
              </div>
            )}
          </div>

          {/* Map Embed */}
          <div className="overflow-hidden rounded-2xl bg-slate-100 shadow-sm border border-slate-200">
            {venue.map_embed_url ? (
              <iframe 
                src={venue.map_embed_url} 
                width="100%" 
                height="100%" 
                style={{ border: 0, minHeight: '400px' }} 
                allowFullScreen="" 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Conference Venue Map"
              ></iframe>
            ) : (
              <div className="flex h-full min-h-[400px] flex-col items-center justify-center p-8 text-center text-slate-400">
                <svg className="mb-4 h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <p>Map view is not available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
