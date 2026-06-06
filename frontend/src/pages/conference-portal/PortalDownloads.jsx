import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { publicApi, toAbsoluteUploadUrl } from "../../services/api";
import SectionHeader from "../../components/SectionHeader";
import Card from "../../components/ui/Card";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function PortalDownloads() {
  const { conference } = useOutletContext();
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchDownloads = async () => {
      try {
        const res = await publicApi.getConferencePortalResource("downloads", conference.id);
        if (mounted) setDownloads(res.data?.items || []);
      } catch (err) {
        console.error("Failed to fetch downloads", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (conference?.id) fetchDownloads();
    else setLoading(false);
    return () => { mounted = false; };
  }, [conference]);

  if (loading) {
    return <div className="flex justify-center p-20"><LoadingSpinner /></div>;
  }

  // Group by category
  const categoriesMap = {};
  downloads.forEach(item => {
    const category = item.category || "General Documents";
    if (!categoriesMap[category]) categoriesMap[category] = [];
    categoriesMap[category].push(item);
  });

  const sortedCategories = Object.keys(categoriesMap).sort();

  return (
    <div className="pb-24 pt-8">
      <div className="page-shell max-w-4xl">
        <SectionHeader
          eyebrow="Resources"
          title="Downloads & Materials"
          description="Access conference proceedings, templates, brochures, and other essential documents."
          className="mb-12"
        />

        {downloads.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            No materials are currently available for download.
          </div>
        ) : (
          <div className="space-y-12">
            {sortedCategories.map(category => (
              <section key={category}>
                <h2 className="mb-6 text-xl font-bold text-gray-900 border-b pb-2">{category}</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {categoriesMap[category].map(doc => (
                    <a 
                      key={doc.id} 
                      href={toAbsoluteUploadUrl(doc.file_url)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-emerald-200 hover:shadow-md"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 line-clamp-2">{doc.title}</h3>
                        {doc.description && <p className="mt-1 text-sm text-slate-500 line-clamp-2">{doc.description}</p>}
                        <p className="mt-2 text-xs font-semibold uppercase text-emerald-600 tracking-wider">Download {doc.file_type}</p>
                      </div>
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
