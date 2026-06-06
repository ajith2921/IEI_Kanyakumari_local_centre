import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { publicApi } from "../../services/api";
import SectionHeader from "../../components/SectionHeader";
import LoadingSpinner from "../../components/LoadingSpinner";
import ImageMedia from "../../components/ImageMedia";

export default function PortalGallery() {
  const { conference } = useOutletContext();
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchGallery = async () => {
      try {
        const res = await publicApi.getConferencePortalResource("gallery", conference.id);
        if (mounted) setGallery(res.data?.items || []);
      } catch (err) {
        console.error("Failed to fetch gallery", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (conference?.id) fetchGallery();
    else setLoading(false);
    return () => { mounted = false; };
  }, [conference]);

  if (loading) {
    return <div className="flex justify-center p-20"><LoadingSpinner /></div>;
  }

  // Group by album_label
  const albumsMap = {};
  gallery.forEach(item => {
    const album = item.album_label || "Conference Highlights";
    if (!albumsMap[album]) albumsMap[album] = [];
    albumsMap[album].push(item);
  });

  const sortedAlbums = Object.keys(albumsMap).sort();

  return (
    <div className="pb-24 pt-8">
      <div className="page-shell">
        <SectionHeader
          eyebrow="Memories"
          title="Photo Gallery"
          description="Browse through the moments captured during our conference."
          className="mb-12"
        />

        {gallery.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500 max-w-4xl mx-auto">
            No photos have been uploaded yet. Check back after the event!
          </div>
        ) : (
          <div className="space-y-16">
            {sortedAlbums.map(album => (
              <section key={album}>
                <h2 className="mb-6 text-2xl font-bold text-gray-900 border-b pb-2">{album}</h2>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {albumsMap[album].map(photo => (
                    <div key={photo.id} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 shadow-sm transition-all hover:shadow-md">
                      <ImageMedia 
                        src={photo.image_url} 
                        alt={photo.title || album} 
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {photo.title && (
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                          <p className="text-sm font-medium text-white">{photo.title}</p>
                        </div>
                      )}
                    </div>
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
