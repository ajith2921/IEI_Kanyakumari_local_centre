import { useMemo, useState } from "react";
import { parseApiError, publicApi } from "../../services/api";

const PASSWORD_RULE =
  "Password must be 8+ characters and include uppercase, lowercase, number, and special character.";
const STRONG_PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,64}$/;
const MOBILE_PATTERN = /^[+]?[0-9\s()-]{7,18}$/;
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const initialForm = {
  existing_member: "no",
  membership_no: "",
  name: "",
  email: "",
  mobile: "",
  password: "",
  confirm_password: "",
  membership_type: "AMIE",
  interest_area: "",
};

function StepChip({ index, title, active, completed }) {
  return (
    <div
      className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
        completed
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : active
            ? "border-brand-300 bg-brand-50 text-brand-700"
            : "border-slate-200 bg-white text-slate-500"
      }`}
    >
      Step {index}: {title}
    </div>
  );
}

export default function MembershipRegisterWizard() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const progress = useMemo(() => [1, 2, 3], []);

  const clearStatus = () => {
    if (status.message) {
      setStatus({ type: "", message: "" });
    }
  };

  const onChange = (event) => {
    const { name, value } = event.target;
    clearStatus();
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      if (!form.existing_member) {
        return "Please indicate whether you are an existing member.";
      }
      if (form.existing_member === "yes" && !form.membership_no.trim()) {
        return "Membership number is required for existing members.";
      }
      return "";
    }

    if (currentStep === 2) {
      if (form.name.trim().length < 2) {
        return "Please enter a valid name.";
      }
      const email = form.email.trim();
      if (!email) {
        return "Email is required.";
      }
      if (!EMAIL_PATTERN.test(email)) {
        return "Please enter a valid email address.";
      }
      if (!MOBILE_PATTERN.test(form.mobile.trim())) {
        return "Please enter a valid mobile number.";
      }
      return "";
    }

    if (!STRONG_PASSWORD_PATTERN.test(form.password)) {
      return PASSWORD_RULE;
    }
    if (form.password !== form.confirm_password) {
      return "Password and confirm password do not match.";
    }
    if (!form.membership_type) {
      return "Please choose a membership type.";
    }
    if (form.interest_area.trim().length < 2) {
      return "Please enter your interest area.";
    }
    return "";
  };

  const nextStep = () => {
    const error = validateStep(step);
    if (error) {
      setStatus({ type: "error", message: error });
      return;
    }
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    clearStatus();
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const error = validateStep(3);
    if (error) {
      setStatus({ type: "error", message: error });
      return;
    }

    const payload = {
      existing_member: form.existing_member === "yes",
      membership_no: form.membership_no.trim(),
      name: form.name.trim(),
      email: form.email.trim(),
      mobile: form.mobile.trim(),
      password: form.password,
      confirm_password: form.confirm_password,
      membership_type: form.membership_type,
      interest_area: form.interest_area.trim(),
    };

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      await publicApi.membershipRegister(payload);
      setStatus({
        type: "success",
        message: "Membership account created successfully. You can now sign in from the panel.",
      });
      setForm(initialForm);
      setStep(1);
    } catch (error) {
      setStatus({ type: "error", message: parseApiError(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="be-member" className="section-card rounded-2xl p-5 md:p-6">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600">Apply Membership</p>
      <h3 className="mt-2 text-2xl font-black text-brand-900">Create Membership Account</h3>
      <p className="mt-1 text-sm text-slate-600">
        Complete the guided registration to access institutional membership services.
      </p>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {progress.map((item) => (
          <StepChip
            key={item}
            index={item}
            title={item === 1 ? "Member Status" : item === 2 ? "Personal Details" : "Credentials"}
            active={step === item}
            completed={step > item}
          />
        ))}
      </div>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700">Existing Member?</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="flex items-center gap-2 rounded-lg border border-brand-200 px-3 py-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="existing_member"
                  value="yes"
                  checked={form.existing_member === "yes"}
                  onChange={onChange}
                />
                Yes
              </label>
              <label className="flex items-center gap-2 rounded-lg border border-brand-200 px-3 py-2 text-sm text-slate-700">
                <input
                  type="radio"
                  name="existing_member"
                  value="no"
                  checked={form.existing_member === "no"}
                  onChange={onChange}
                />
                No
              </label>
            </div>

            {form.existing_member === "yes" && (
              <label className="block space-y-1 text-sm font-semibold text-slate-700">
                Membership Number
                <input
                  name="membership_no"
                  value={form.membership_no}
                  onChange={onChange}
                  placeholder="Enter your membership number"
                  className="focus-ring w-full rounded-lg border border-brand-200 px-3 py-2.5"
                />
              </label>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block space-y-1 text-sm font-semibold text-slate-700 md:col-span-2">
              Name
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="Enter full name"
                className="focus-ring w-full rounded-lg border border-brand-200 px-3 py-2.5"
              />
            </label>
            <label className="block space-y-1 text-sm font-semibold text-slate-700">
              Email
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="you@example.com"
                className="focus-ring w-full rounded-lg border border-brand-200 px-3 py-2.5"
              />
            </label>
            <label className="block space-y-1 text-sm font-semibold text-slate-700">
              Mobile
              <input
                type="tel"
                name="mobile"
                value={form.mobile}
                onChange={onChange}
                placeholder="+91"
                className="focus-ring w-full rounded-lg border border-brand-200 px-3 py-2.5"
              />
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block space-y-1 text-sm font-semibold text-slate-700">
              Password
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={onChange}
                placeholder="Create password"
                className="focus-ring w-full rounded-lg border border-brand-200 px-3 py-2.5"
                autoComplete="new-password"
              />
            </label>
            <label className="block space-y-1 text-sm font-semibold text-slate-700">
              Confirm Password
              <input
                type="password"
                name="confirm_password"
                value={form.confirm_password}
                onChange={onChange}
                placeholder="Re-enter password"
                className="focus-ring w-full rounded-lg border border-brand-200 px-3 py-2.5"
                autoComplete="new-password"
              />
            </label>
            <label className="block space-y-1 text-sm font-semibold text-slate-700">
              Membership Type
              <select
                name="membership_type"
                value={form.membership_type}
                onChange={onChange}
                className="focus-ring w-full rounded-lg border border-brand-200 px-3 py-2.5"
              >
                <option value="AMIE">AMIE</option>
                <option value="MIE">MIE</option>
                <option value="FIE">FIE</option>
              </select>
            </label>
            <label className="block space-y-1 text-sm font-semibold text-slate-700">
              Interest Area
              <input
                name="interest_area"
                value={form.interest_area}
                onChange={onChange}
                placeholder="Power systems, structural design, automation..."
                className="focus-ring w-full rounded-lg border border-brand-200 px-3 py-2.5"
              />
            </label>
            <p className="text-xs text-slate-500 md:col-span-2">{PASSWORD_RULE}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          {step > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="focus-ring rounded-lg border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50"
            >
              Back
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={nextStep}
              className="focus-ring rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
            >
              Continue
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="focus-ring rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-70"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          )}
        </div>

        {status.message && (
          <p className={`text-sm ${status.type === "success" ? "text-emerald-600" : "text-red-600"}`}>
            {status.message}
          </p>
        )}
      </form>
    </section>
  );
}
