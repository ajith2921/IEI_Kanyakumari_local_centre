import { useMemo, useState } from "react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Input from "../ui/Input";
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
          ? "border-gray-200 bg-gray-50 text-gray-700"
          : active
            ? "border-gray-200 bg-white text-gray-900"
            : "border-gray-200 bg-white text-gray-500"
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
        message:
          "Application submitted successfully. You can sign in after admin approval is completed.",
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
    <Card as="section" id="be-member" className="p-5 md:p-6" padded={false}>
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-gray-500">Apply Membership</p>
      <h3 className="mt-2 text-2xl font-semibold text-gray-900">Create Membership Account</h3>
      <p className="mt-1 text-sm text-gray-600">
        Complete the guided application. Account access is enabled after admin review and approval.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
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
            <p className="text-sm font-medium text-gray-600">Existing Member?</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex items-center rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600">
                <input
                  type="radio"
                  name="existing_member"
                  value="yes"
                  checked={form.existing_member === "yes"}
                  onChange={onChange}
                />
                <span className="ml-3">Yes</span>
              </label>
              <label className="flex items-center rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600">
                <input
                  type="radio"
                  name="existing_member"
                  value="no"
                  checked={form.existing_member === "no"}
                  onChange={onChange}
                />
                <span className="ml-3">No</span>
              </label>
            </div>

            {form.existing_member === "yes" && (
              <Input
                label="Membership Number"
                name="membership_no"
                value={form.membership_no}
                onChange={onChange}
                placeholder="Enter your membership number"
              />
            )}
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Name"
              containerClassName="md:col-span-2"
              name="name"
              value={form.name}
              onChange={onChange}
              placeholder="Enter full name"
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="you@example.com"
            />
            <Input
              label="Mobile"
              type="tel"
              name="mobile"
              value={form.mobile}
              onChange={onChange}
              placeholder="+91"
            />
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              placeholder="Create password"
              autoComplete="new-password"
            />
            <Input
              label="Confirm Password"
              type="password"
              name="confirm_password"
              value={form.confirm_password}
              onChange={onChange}
              placeholder="Re-enter password"
              autoComplete="new-password"
            />
            <Input
              as="select"
              label="Membership Type"
              name="membership_type"
              value={form.membership_type}
              onChange={onChange}
            >
              <option value="AMIE">AMIE</option>
              <option value="MIE">MIE</option>
              <option value="FIE">FIE</option>
            </Input>
            <Input
              label="Interest Area"
              name="interest_area"
              value={form.interest_area}
              onChange={onChange}
              placeholder="Power systems, structural design, automation..."
            />
            <p className="text-xs text-gray-500 md:col-span-2">{PASSWORD_RULE}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-4 pt-1">
          {step > 1 && (
            <Button type="button" onClick={prevStep} variant="secondary">
              Back
            </Button>
          )}

          {step < 3 ? (
            <Button type="button" onClick={nextStep}>
              Continue
            </Button>
          ) : (
            <Button type="submit" disabled={loading}>
              {loading ? "Submitting Application..." : "Submit Application"}
            </Button>
          )}
        </div>

        {status.message && (
          <p className={`text-sm ${status.type === "success" ? "text-[#3B82F6]" : "text-gray-500"}`}>
            {status.message}
          </p>
        )}
      </form>
    </Card>
  );
}
