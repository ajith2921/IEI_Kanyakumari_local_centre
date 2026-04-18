import { useState } from "react";
import SectionHeader from "../components/SectionHeader";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
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
  if (payload.name.length < 2) return "Please enter a valid name (at least 2 characters).";
  if (!payload.email) return "Email address is required.";
  if (payload.phone && !PHONE_PATTERN.test(payload.phone)) return "Please enter a valid phone number.";
  if (payload.message.length < 10) return "Message should be at least 10 characters long.";
  return "";
}

const officeInfo = [
  { label: "Organisation", value: "The Institution of Engineers (India)\nKanyakumari Local Centre" },
  { label: "Address",      value: "Nagercoil, Kanyakumari District,\nTamil Nadu, India" },
  { label: "Email",        value: "ieikanyakumarilc@gmail.com",  href: "mailto:ieikanyakumarilc@gmail.com" },
  { label: "Alt Email",    value: "kanyakumarilc@ieindia.org",   href: "mailto:kanyakumarilc@ieindia.org" },
  { label: "Phone",        value: "+91-9443993659",              href: "tel:+919443993659" },
  { label: "Website",      value: "www.ieikanyakumarilc.org",    href: "https://www.ieikanyakumarilc.org", external: true },
];

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const onChange = (event) => {
    const { name, value } = event.target;
    if (status.message) setStatus({ type: "", message: "" });
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
        description="Reach us for membership guidance, event enquiries, or institutional collaboration."
      />

      <div className="grid gap-6 md:grid-cols-5">

        {/* Office Information */}
        <Card className="space-y-6 md:col-span-2" padded={false}>
          <div className="p-6">
            <h3 className="mb-6 text-sm font-semibold text-gray-900">Office Information</h3>
            <dl className="space-y-5">
              {officeInfo.map((item) => (
                <div key={item.label}>
                  <dt className="eyebrow-chip mb-0.5">{item.label}</dt>
                  <dd className="text-sm text-gray-600">
                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.external ? "_blank" : undefined}
                        rel={item.external ? "noreferrer" : undefined}
                        className="text-gray-600 underline underline-offset-2 transition-colors duration-200 hover:text-gray-900"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <span className="whitespace-pre-line">{item.value}</span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="border-t border-gray-100 bg-gray-50/60 p-5 text-sm text-gray-500">
            <p className="mb-1 font-semibold text-gray-900">Office Hours</p>
            <p>Monday – Saturday: 10:00 AM – 5:30 PM</p>
            <p>Sunday: Closed</p>
          </div>
        </Card>

        {/* Contact Form */}
        <Card as="form" onSubmit={onSubmit} className="grid gap-5 md:col-span-3 md:grid-cols-2" padded={false}>
          <div className="p-6 pb-0 md:col-span-2">
            <h3 className="text-sm font-semibold text-gray-900">Send a Message</h3>
          </div>
          <div className="px-6 md:col-span-1">
            <Input
              label="Full Name"
              name="name"
              value={form.name}
              onChange={onChange}
              required
              maxLength={120}
              placeholder="Enter your name"
            />
          </div>
          <div className="px-6 md:col-span-1">
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              required
              maxLength={120}
              placeholder="you@example.com"
            />
          </div>
          <div className="px-6 md:col-span-2">
            <Input
              label="Phone (optional)"
              name="phone"
              value={form.phone}
              onChange={onChange}
              maxLength={30}
              placeholder="+91"
            />
          </div>
          <div className="px-6 md:col-span-2">
            <Input
              as="textarea"
              label="Message"
              name="message"
              value={form.message}
              onChange={onChange}
              required
              rows={6}
              maxLength={3000}
              placeholder="How can we help you?"
            />
          </div>

          <p className="px-6 text-xs text-gray-300 md:col-span-2">
            By submitting this form, you agree to be contacted by the organization.
          </p>

          <div className="px-6 pb-6 md:col-span-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send Message"}
            </Button>
            {status.message && (
              <p className={`mt-3 text-sm ${status.type === "success" ? "text-blue-500" : "text-gray-500"}`}>
                {status.message}
              </p>
            )}
          </div>
        </Card>
      </div>
    </section>
  );
}
