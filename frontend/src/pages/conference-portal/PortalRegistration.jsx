import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { publicApi } from "../../services/api";
import SectionHeader from "../../components/SectionHeader";
import Card from "../../components/ui/Card";

export default function PortalRegistration() {
  const { conference } = useOutletContext();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    organization: "",
    designation: "",
    category: "Delegate",
    payment_ref: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = new FormData();
      Object.keys(formData).forEach(key => payload.append(key, formData[key]));
      payload.append("conference_id", conference.id);
      
      await publicApi.submitConferencePortal("registrations", payload);
      setSuccess(true);
      window.scrollTo(0, 0);
    } catch (err) {
      setError(err.message || "Failed to submit registration. Please try again.");
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mb-4 text-3xl font-bold text-gray-900">Registration Successful!</h2>
          <p className="mb-8 text-lg text-slate-600">
            Thank you for registering for {conference.short_title || conference.title}. 
            Your registration is currently pending review. We will contact you at {formData.email} shortly.
          </p>
          <button 
            onClick={() => { setSuccess(false); setFormData({...formData, full_name: '', email: '', phone: '', payment_ref: ''}); }}
            className="rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700"
          >
            Register Another Participant
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-8">
      <div className="page-shell max-w-4xl">
        <SectionHeader
          eyebrow="Join Us"
          title="Conference Registration"
          description="Register to attend the conference. Please review the fee categories before proceeding."
          className="mb-12"
        />

        <div className="mb-10 grid gap-6 sm:grid-cols-3">
          <Card className="border-t-4 border-t-emerald-500 p-6 text-center shadow-sm">
            <h3 className="mb-2 text-lg font-bold text-gray-900">Student</h3>
            <p className="text-3xl font-bold text-emerald-600">₹1,500</p>
          </Card>
          <Card className="border-t-4 border-t-sky-500 p-6 text-center shadow-sm">
            <h3 className="mb-2 text-lg font-bold text-gray-900">Academic / IEI Member</h3>
            <p className="text-3xl font-bold text-sky-600">₹2,500</p>
          </Card>
          <Card className="border-t-4 border-t-indigo-500 p-6 text-center shadow-sm">
            <h3 className="mb-2 text-lg font-bold text-gray-900">Industry Professional</h3>
            <p className="text-3xl font-bold text-indigo-600">₹4,000</p>
          </Card>
        </div>

        <Card className="p-6 shadow-sm sm:p-8">
          <h2 className="mb-6 text-2xl font-bold text-gray-900 border-b pb-4">Registration Form</h2>
          
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-800">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Full Name *</label>
                <input required type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="w-full rounded-lg border border-slate-300 p-3 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Email Address *</label>
                <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full rounded-lg border border-slate-300 p-3 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Phone Number *</label>
                <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full rounded-lg border border-slate-300 p-3 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Registration Category *</label>
                <select required name="category" value={formData.category} onChange={handleChange} className="w-full rounded-lg border border-slate-300 p-3 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white">
                  <option value="Student">Student</option>
                  <option value="Academic">Academic</option>
                  <option value="IEI Member">IEI Member</option>
                  <option value="Industry Professional">Industry Professional</option>
                  <option value="Delegate">General Delegate</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Organization/Institution</label>
                <input type="text" name="organization" value={formData.organization} onChange={handleChange} className="w-full rounded-lg border border-slate-300 p-3 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Designation</label>
                <input type="text" name="designation" value={formData.designation} onChange={handleChange} className="w-full rounded-lg border border-slate-300 p-3 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">Payment Reference No. (Transaction ID) *</label>
                <input required type="text" name="payment_ref" value={formData.payment_ref} onChange={handleChange} placeholder="e.g. UPI Ref / NEFT UTR / Cheque No." className="w-full rounded-lg border border-slate-300 p-3 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                <p className="mt-2 text-xs text-slate-500">Please complete your payment before filling this form and enter the reference ID.</p>
              </div>
            </div>

            <div className="pt-4 text-center">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full sm:w-auto min-w-[200px] rounded-lg bg-emerald-700 px-8 py-3 text-lg font-bold text-white transition hover:bg-emerald-800 disabled:opacity-70"
              >
                {loading ? "Submitting..." : "Submit Registration"}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
