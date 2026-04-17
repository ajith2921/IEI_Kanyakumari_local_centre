import { useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Card from "../ui/Card";
import { useMembershipSession } from "../../context/MembershipSessionContext";
import { parseApiError, publicApi } from "../../services/api";

const initialLogin = {
  identifier: "",
  password: "",
};

const initialForgot = {
  identifier: "",
};

export default function MembershipAuthPanel() {
  const {
    isAuthenticated,
    member,
    loading: loginLoading,
    login,
    logout,
  } = useMembershipSession();
  const [activeTab, setActiveTab] = useState("login");
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [forgotForm, setForgotForm] = useState(initialForgot);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const clearStatus = () => {
    if (status.message) {
      setStatus({ type: "", message: "" });
    }
  };

  const onLoginChange = (event) => {
    const { name, value } = event.target;
    clearStatus();
    setLoginForm((prev) => ({ ...prev, [name]: value }));
  };

  const onForgotChange = (event) => {
    const { name, value } = event.target;
    clearStatus();
    setForgotForm((prev) => ({ ...prev, [name]: value }));
  };

  const onLoginSubmit = async (event) => {
    event.preventDefault();

    const identifier = loginForm.identifier.trim();
    if (!identifier || !loginForm.password) {
      setStatus({ type: "error", message: "Membership number/email/mobile and password are required." });
      return;
    }

    setStatus({ type: "", message: "" });

    try {
      const result = await login(identifier, loginForm.password);
      if (!result.success) {
        setStatus({ type: "error", message: result.message || "Login failed." });
        return;
      }

      setStatus({ type: "success", message: "Sign in successful." });
      setLoginForm(initialLogin);
    } catch {
      setStatus({ type: "error", message: "Unable to complete sign in." });
    }
  };

  const onForgotSubmit = async (event) => {
    event.preventDefault();
    const identifier = forgotForm.identifier.trim();
    if (!identifier) {
      setStatus({ type: "error", message: "Please enter your email or mobile number." });
      return;
    }

    setForgotLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await publicApi.membershipForgotPassword({ identifier });
      setStatus({
        type: "success",
        message:
          response.data?.message ||
          "If an account exists, password reset instructions have been sent.",
      });
      setForgotForm(initialForgot);
    } catch (error) {
      setStatus({ type: "error", message: parseApiError(error) });
    } finally {
      setForgotLoading(false);
    }
  };

  if (isAuthenticated) {
    return (
      <Card as="aside" id="auth-panel" className="p-5 md:p-6" padded={false}>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Member Access</p>
        <h3 className="mt-2 text-xl font-semibold text-gray-900">Welcome Back</h3>
        <p className="mt-1 text-sm text-gray-600">You are signed in to the membership portal.</p>

        <dl className="mt-4 space-y-2 rounded-xl border border-brand-100 bg-brand-50/70 p-4 text-sm">
          <div className="flex items-center justify-between gap-2">
            <dt className="font-semibold text-gray-600">Name</dt>
            <dd className="font-semibold text-gray-900">{member?.name || "Member"}</dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="font-semibold text-gray-600">Category</dt>
            <dd className="font-semibold text-gray-900">{member?.membership_type || "N/A"}</dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="font-semibold text-gray-600">Membership No</dt>
            <dd className="font-semibold text-gray-900">{member?.membership_id || "Pending"}</dd>
          </div>
        </dl>

        <Button
          onClick={() => {
            logout();
            setStatus({ type: "success", message: "Signed out successfully." });
          }}
          variant="secondary"
          className="mt-4 w-full"
        >
          Sign Out
        </Button>

        {status.message && (
          <p
            className={`mt-3 text-sm ${
              status.type === "success" ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {status.message}
          </p>
        )}
      </Card>
    );
  }

  return (
    <Card as="aside" id="auth-panel" className="p-5 md:p-6" padded={false}>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Member Access</p>
      <h3 className="mt-2 text-xl font-semibold text-gray-900">Portal Sign In</h3>
      <p className="mt-1 text-sm text-gray-600">
        Access your membership profile, application updates, and institutional services.
      </p>

      <div className="mt-4 grid grid-cols-2 rounded-xl border border-brand-200 bg-brand-50 p-1">
        <Button
          type="button"
          onClick={() => {
            setActiveTab("login");
            clearStatus();
          }}
          variant="ghost"
          className={`w-full rounded-md px-3 py-2 text-sm font-semibold ${
            activeTab === "login" ? "bg-white text-brand-800 shadow-sm" : "text-brand-600 hover:bg-brand-100"
          }`}
        >
          Login
        </Button>
        <Button
          type="button"
          onClick={() => {
            setActiveTab("forgot");
            clearStatus();
          }}
          variant="ghost"
          className={`w-full rounded-md px-3 py-2 text-sm font-semibold ${
            activeTab === "forgot" ? "bg-white text-brand-800 shadow-sm" : "text-brand-600 hover:bg-brand-100"
          }`}
        >
          Forgot Password
        </Button>
      </div>

      {activeTab === "login" ? (
        <form onSubmit={onLoginSubmit} className="mt-4 space-y-3">
          <Input
            label="Membership No / Email / Mobile"
            name="identifier"
            value={loginForm.identifier}
            onChange={onLoginChange}
            placeholder="Enter membership no, email, or mobile"
            autoComplete="username"
          />
          <Input
            label="Password"
            type="password"
            name="password"
            value={loginForm.password}
            onChange={onLoginChange}
            placeholder="Enter password"
            autoComplete="current-password"
          />
          <Button type="submit" disabled={loginLoading} className="w-full">
            {loginLoading ? "Signing In..." : "Login"}
          </Button>
        </form>
      ) : (
        <form onSubmit={onForgotSubmit} className="mt-4 space-y-3">
          <Input
            label="Email / Mobile"
            name="identifier"
            value={forgotForm.identifier}
            onChange={onForgotChange}
            placeholder="Enter email or mobile"
            autoComplete="email"
          />
          <Button type="submit" disabled={forgotLoading} className="w-full">
            {forgotLoading ? "Submitting..." : "Reset Password"}
          </Button>
        </form>
      )}

      {status.message && (
        <p className={`mt-3 text-sm ${status.type === "success" ? "text-emerald-600" : "text-red-600"}`}>
          {status.message}
        </p>
      )}
    </Card>
  );
}
