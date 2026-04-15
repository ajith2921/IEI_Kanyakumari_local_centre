import { useState } from "react";
import SectionHeader from "../components/SectionHeader";
import { parseApiError, publicApi } from "../services/api";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

const PHONE_PATTERN = /^[+]?[0-9\s()-]{7,18}$/;

function sanitizePayload(payload) {
  return {
    name: payload.name.trim(),
    email: payload.email.trim(),
    phone: payload.phone.trim(),
    message: payload.message.trim(),
  };
}

function validatePayload(payload) {
  if (payload.name.length < 2) {
    return "Please enter a valid name (at least 2 characters).";
  }
  if (!payload.email) {
    return "Email address is required.";
  }
  if (payload.phone && !PHONE_PATTERN.test(payload.phone)) {
    return "Please enter a valid phone number.";
  }
  if (payload.message.length < 10) {
    return "Message should be at least 10 characters long.";
  }
  return "";
}

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const onChange = (event) => {
    const { name, value } = event.target;
    if (status.message) {
      setStatus({ type: "", message: "" });
    }
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const payload = sanitizePayload(form);
    const validationError = validatePayload(payload);
    if (validationError) {
      setStatus({ type: "error", message: validationError });
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: "" });
    try {
      await publicApi.submitContact(payload);
      setStatus({ type: "success", message: "Message sent successfully." });
      setForm(initialForm);
    } catch (error) {
      setStatus({ type: "error", message: parseApiError(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="page-shell section-block">
      <SectionHeader
        eyebrow="Get in Touch"
        title="Contact Us"
        description="Use the contact form for support, collaboration, or institutional enquiries."
      />

      <div className="grid gap-6 md:grid-cols-5">
        <article className="section-card space-y-5 p-7 md:col-span-2">
          <h3 className="heading-h3 font-black text-brand-800">Office Information</h3>
          <div className="space-y-3 text-sm text-slate-600">
            <p>IEI Kanyakumari Local Centre</p>
            <p>Kanyakumari, Tamil Nadu, India</p>
            <p>Email: info@iei-kanyakumari.org</p>
            <p>Phone: +91 00000 00000</p>
          </div>

          <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-4 text-sm text-brand-700">
            Average response time: within 2 business days.
          </div>
        </article>

        <form onSubmit={onSubmit} className="section-card grid gap-5 p-7 md:col-span-3 md:grid-cols-2">
          <label className="space-y-2 text-sm font-semibold text-slate-700">
            Full Name
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              required
              maxLength={120}
              placeholder="Enter your name"
              className="focus-ring w-full rounded-lg border border-brand-200 px-3 py-3"
            />
          </label>
          <label className="space-y-2 text-sm font-semibold text-slate-700">
            Email Address
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              required
              maxLength={120}
              placeholder="you@example.com"
              className="focus-ring w-full rounded-lg border border-brand-200 px-3 py-3"
            />
          </label>
          <label className="space-y-2 text-sm font-semibold text-slate-700 md:col-span-2">
            Phone (optional)
            <input
              name="phone"
              value={form.phone}
              onChange={onChange}
              maxLength={30}
              placeholder="+91"
              className="focus-ring w-full rounded-lg border border-brand-200 px-3 py-3"
            />
          </label>
          <label className="space-y-2 text-sm font-semibold text-slate-700 md:col-span-2">
            Message
            <textarea
              name="message"
              value={form.message}
              onChange={onChange}
              required
              rows={6}
              maxLength={3000}
              placeholder="How can we help you?"
              className="focus-ring w-full rounded-lg border border-brand-200 px-3 py-3"
            />
          </label>

          <p className="text-xs text-slate-500 md:col-span-2">
            By submitting this form, you agree to be contacted by the organization.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="focus-ring w-full rounded-lg bg-brand-700 px-5 py-3 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand-800 disabled:opacity-70 md:col-span-2 md:w-fit"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
          {status.message && (
            <p
              className={`text-sm ${
                status.type === "success" ? "text-emerald-600" : "text-red-600"
              } md:col-span-2`}
            >
              {status.message}
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
