import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { publicApi } from "../../services/api";
import SectionHeader from "../../components/SectionHeader";
import Card from "../../components/ui/Card";

export default function PortalContact() {
  const { conference } = useOutletContext();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: `Query regarding ${conference.short_title || conference.title}`,
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await publicApi.submitContact(formData);
      setSuccess(true);
      setFormData({ name: "", email: "", subject: `Query regarding ${conference.short_title || conference.title}`, message: "" });
    } catch (err) {
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-24 pt-8">
      <div className="page-shell max-w-5xl">
        <SectionHeader
          eyebrow="Get in Touch"
          title="Contact Secretariat"
          description="Have questions about the conference? Reach out to our organizing team."
          className="mb-12"
        />

        <div className="grid gap-12 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Conference Secretariat</h2>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Address</h3>
                  <p className="mt-1 text-slate-600">
                    The Institution of Engineers (India)<br />
                    Kanyakumari Local Centre<br />
                    Nagercoil, Tamil Nadu, India
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Email</h3>
                  <p className="mt-1 text-slate-600">ieikklc@gmail.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <Card className="p-6 shadow-sm sm:p-8">
              {success ? (
                <div className="rounded-xl bg-emerald-50 p-8 text-center text-emerald-800">
                  <svg className="mx-auto mb-4 h-12 w-12 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mb-2 text-xl font-bold">Message Sent!</h3>
                  <p>Thank you for reaching out. The secretariat will get back to you shortly.</p>
                  <button 
                    onClick={() => setSuccess(false)}
                    className="mt-6 font-medium text-emerald-600 hover:text-emerald-700 underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="rounded-lg bg-red-50 p-4 text-red-800">{error}</div>
                  )}
                  
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Name *</label>
                      <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full rounded-lg border border-slate-300 p-3 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Email *</label>
                      <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full rounded-lg border border-slate-300 p-3 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Subject *</label>
                    <input required type="text" name="subject" value={formData.subject} onChange={handleChange} className="w-full rounded-lg border border-slate-300 p-3 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                  </div>
                  
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Message *</label>
                    <textarea required name="message" value={formData.message} onChange={handleChange} rows={5} className="w-full rounded-lg border border-slate-300 p-3 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"></textarea>
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full rounded-lg bg-emerald-700 px-6 py-3 font-bold text-white transition hover:bg-emerald-800 disabled:opacity-70"
                  >
                    {loading ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
