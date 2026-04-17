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
        description="Reach us for membership guidance, event enquiries, or institutional collaboration."
      />

      <div className="grid gap-6 md:grid-cols-5">
        <Card className="space-y-5 p-7 md:col-span-2">
          <h3 className="heading-h3 font-semibold text-gray-900">Office Information</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p className="font-semibold text-gray-800">
              The Institution of Engineers (India)<br />
              Kanyakumari Local Centre
            </p>
            <p>Nagercoil, Kanyakumari District,<br />Tamil Nadu, India</p>
            <p>
              Email:{" "}
              <a href="mailto:ieikanyakumarilc@gmail.com" className="text-blue-600 underline">
                ieikanyakumarilc@gmail.com
              </a>
            </p>
            <p>
              Alt:{" "}
              <a href="mailto:kanyakumarilc@ieindia.org" className="text-blue-600 underline">
                kanyakumarilc@ieindia.org
              </a>
            </p>
            <p>Phone: <a href="tel:+919443993659" className="text-blue-600">+91-9443993659</a></p>
            <p>Website:{" "}
              <a href="https://www.ieikanyakumarilc.org" target="_blank" rel="noreferrer" className="text-blue-600 underline">
                www.ieikanyakumarilc.org
              </a>
            </p>
          </div>

          <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-4 text-sm text-brand-700">
            <p className="font-semibold mb-1">Office Hours</p>
            <p>Monday – Saturday: 10:00 AM – 5:30 PM</p>
            <p>Sunday: Closed</p>
          </div>
        </Card>

        <Card as="form" onSubmit={onSubmit} className="grid gap-5 p-7 md:col-span-3 md:grid-cols-2">
          <Input
            label="Full Name"
            name="name"
            value={form.name}
            onChange={onChange}
            required
            maxLength={120}
            placeholder="Enter your name"
          />
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
          <Input
            label="Phone (optional)"
            containerClassName="md:col-span-2"
            name="phone"
            value={form.phone}
            onChange={onChange}
            maxLength={30}
            placeholder="+91"
          />
          <Input
            as="textarea"
            label="Message"
            containerClassName="md:col-span-2"
            name="message"
            value={form.message}
            onChange={onChange}
            required
            rows={6}
            maxLength={3000}
            placeholder="How can we help you?"
          />

          <p className="text-xs text-gray-500 md:col-span-2">
            By submitting this form, you agree to be contacted by the organization.
          </p>

          <Button type="submit" disabled={loading} className="w-full md:col-span-2 md:w-fit">
            {loading ? "Sending..." : "Send Message"}
          </Button>
          {status.message && (
            <p
              className={`text-sm ${
                status.type === "success" ? "text-emerald-600" : "text-red-600"
              } md:col-span-2`}
            >
              {status.message}
            </p>
          )}
        </Card>
      </div>
    </section>
  );
}
