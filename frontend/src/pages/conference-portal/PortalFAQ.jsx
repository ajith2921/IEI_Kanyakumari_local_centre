import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { publicApi } from "../../services/api";
import SectionHeader from "../../components/SectionHeader";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function PortalFAQ() {
  const { conference } = useOutletContext();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(0); // first item open by default

  useEffect(() => {
    let mounted = true;
    const fetchFaqs = async () => {
      try {
        const res = await publicApi.getConferencePortalResource("faq", conference.id);
        if (mounted) setFaqs(res.data?.items || []);
      } catch (err) {
        console.error("Failed to fetch FAQs", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (conference?.id) fetchFaqs();
    else setLoading(false);
    return () => { mounted = false; };
  }, [conference]);

  if (loading) {
    return <div className="flex justify-center p-20"><LoadingSpinner /></div>;
  }

  return (
    <div className="pb-24 pt-8">
      <div className="page-shell max-w-3xl">
        <SectionHeader
          eyebrow="Help Center"
          title="Frequently Asked Questions"
          description="Find answers to common questions about registration, submissions, and attendance."
          className="mb-12"
        />

        {faqs.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            No FAQs available at the moment.
          </div>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div 
                  key={faq.id} 
                  className={`overflow-hidden rounded-xl border transition-colors ${isOpen ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    className="flex w-full items-center justify-between px-6 py-5 text-left focus:outline-none"
                  >
                    <span className="text-lg font-medium text-slate-900">{faq.question}</span>
                    <span className={`ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors ${isOpen ? 'border-emerald-200 bg-emerald-100 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                      <svg className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </button>
                  <div 
                    className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="px-6 pb-6 text-slate-600 whitespace-pre-wrap leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
