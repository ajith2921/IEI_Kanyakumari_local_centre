import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { publicApi } from "../../services/api";
import SectionHeader from "../../components/SectionHeader";
import Card from "../../components/ui/Card";

export default function PortalSubmission() {
  const { conference } = useOutletContext();
  const [formData, setFormData] = useState({
    author_name: "",
    co_authors: "",
    email: "",
    organization: "",
    paper_title: "",
    abstract: "",
    keywords: "",
    track: "",
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!pdfFile) {
      setError("Please attach your full paper in PDF format.");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const payload = new FormData();
      Object.keys(formData).forEach(key => payload.append(key, formData[key]));
      payload.append("conference_id", conference.id);
      payload.append("pdf_url", pdfFile); // pdf_url field will receive the file, backend handles it
      
      await publicApi.submitConferencePortal("submissions", payload);
      setSuccess(true);
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message || "Failed to submit paper. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="pb-24 pt-16">
        <div className="page-shell max-w-2xl text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="mb-4 text-3xl font-bold text-gray-900">Paper Submitted Successfully!</h2>
          <p className="mb-8 text-lg text-slate-600">
            Thank you for submitting your paper "{formData.paper_title}". 
            Our review committee will evaluate it and get back to you at {formData.email}.
          </p>
          <button 
            onClick={() => { 
              setSuccess(false); 
              setFormData({ author_name: '', co_authors: '', email: '', organization: '', paper_title: '', abstract: '', keywords: '', track: ''});
              setPdfFile(null);
            }}
            className="rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700"
          >
            Submit Another Paper
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-8">
      <div className="page-shell max-w-4xl">
        <SectionHeader
          eyebrow="Contribute"
          title="Submit Your Paper"
          description="Upload your research paper for review by our technical committee."
          className="mb-12"
        />

        <Card className="p-6 shadow-sm sm:p-8 border-t-4 border-t-emerald-500">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 border-b pb-4">Paper Submission Form</h2>
          
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-800">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Primary Author Name *</label>
                <input required type="text" name="author_name" value={formData.author_name} onChange={handleChange} className="w-full rounded-lg border border-slate-300 p-3 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Author Email Address *</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full rounded-lg border border-slate-300 p-3 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">Co-Authors (comma separated)</label>
                <input type="text" name="co_authors" value={formData.co_authors} onChange={handleChange} placeholder="John Doe, Jane Smith" className="w-full rounded-lg border border-slate-300 p-3 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">Organization / University *</label>
                <input required type="text" name="organization" value={formData.organization} onChange={handleChange} className="w-full rounded-lg border border-slate-300 p-3 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
              </div>
              
              <div className="sm:col-span-2 mt-4 pt-4 border-t border-slate-100">
                <label className="mb-2 block text-sm font-medium text-gray-700">Paper Title *</label>
                <input required type="text" name="paper_title" value={formData.paper_title} onChange={handleChange} className="w-full rounded-lg border border-slate-300 p-3 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">Abstract (Optional)</label>
                <textarea name="abstract" value={formData.abstract} onChange={handleChange} rows={4} className="w-full rounded-lg border border-slate-300 p-3 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"></textarea>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Keywords *</label>
                <input required type="text" name="keywords" value={formData.keywords} onChange={handleChange} placeholder="e.g. AI, Machine Learning, Robotics" className="w-full rounded-lg border border-slate-300 p-3 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Relevant Track / Topic *</label>
                <input required type="text" name="track" value={formData.track} onChange={handleChange} placeholder="e.g. Track 1: Sustainable Energy" className="w-full rounded-lg border border-slate-300 p-3 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
              </div>
              
              <div className="sm:col-span-2 mt-4 pt-4 border-t border-slate-100">
                <label className="mb-2 block text-sm font-bold text-gray-900">Upload Full Paper (PDF) *</label>
                <div className="flex w-full items-center justify-center">
                  <label className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-emerald-300 bg-emerald-50 hover:bg-emerald-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pb-6 pt-5">
                      <svg className="mb-3 h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500">
                        {pdfFile ? (
                          <span className="font-semibold text-emerald-700">{pdfFile.name}</span>
                        ) : (
                          <><span className="font-semibold">Click to upload</span> or drag and drop</>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">PDF up to 10MB</p>
                    </div>
                    <input type="file" className="hidden" accept=".pdf" onChange={handleFileChange} />
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-6 text-center">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full sm:w-auto min-w-[200px] rounded-lg bg-emerald-700 px-8 py-3 text-lg font-bold text-white transition hover:bg-emerald-800 disabled:opacity-70"
              >
                {loading ? "Uploading Paper..." : "Submit Paper"}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
