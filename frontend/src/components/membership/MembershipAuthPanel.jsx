import { useState } from "react";
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
      <aside id="auth-panel" className="section-card rounded-2xl p-5 md:p-6">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600">Member Access</p>
        <h3 className="mt-2 text-xl font-black text-brand-900">Welcome Back</h3>
        <p className="mt-1 text-sm text-slate-600">You are signed in to the membership portal.</p>

        <dl className="mt-4 space-y-2 rounded-lg border border-brand-100 bg-brand-50/70 p-4 text-sm">
          <div className="flex items-center justify-between gap-2">
            <dt className="font-semibold text-slate-600">Name</dt>
            <dd className="font-semibold text-brand-800">{member?.name || "Member"}</dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="font-semibold text-slate-600">Category</dt>
            <dd className="font-semibold text-brand-800">{member?.membership_type || "N/A"}</dd>
          </div>
          <div className="flex items-center justify-between gap-2">
            <dt className="font-semibold text-slate-600">Membership No</dt>
            <dd className="font-semibold text-brand-800">{member?.membership_id || "Pending"}</dd>
          </div>
        </dl>

        <button
          type="button"
          onClick={() => {
            logout();
            setStatus({ type: "success", message: "Signed out successfully." });
          }}
          className="focus-ring mt-4 w-full rounded-lg border border-brand-200 px-4 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
        >
          Sign Out
        </button>

        {status.message && (
          <p
            className={`mt-3 text-sm ${
              status.type === "success" ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {status.message}
          </p>
        )}
      </aside>
    );
  }

  return (
    <aside id="auth-panel" className="section-card rounded-2xl p-5 md:p-6">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-brand-600">Member Access</p>
      <h3 className="mt-2 text-xl font-black text-brand-900">Portal Sign In</h3>
      <p className="mt-1 text-sm text-slate-600">
        Access your membership profile, application updates, and institutional services.
      </p>

      <div className="mt-4 grid grid-cols-2 rounded-lg border border-brand-200 bg-brand-50 p-1">
        <button
          type="button"
          onClick={() => {
            setActiveTab("login");
            clearStatus();
          }}
          className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
            activeTab === "login" ? "bg-white text-brand-800 shadow-sm" : "text-brand-600 hover:bg-brand-100"
          }`}
        >
          Login
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab("forgot");
            clearStatus();
          }}
          className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
            activeTab === "forgot" ? "bg-white text-brand-800 shadow-sm" : "text-brand-600 hover:bg-brand-100"
          }`}
        >
          Forgot Password
        </button>
      </div>

      {activeTab === "login" ? (
        <form onSubmit={onLoginSubmit} className="mt-4 space-y-3">
          <label className="block space-y-1 text-sm font-semibold text-slate-700">
            Membership No / Email / Mobile
            <input
              name="identifier"
              value={loginForm.identifier}
              onChange={onLoginChange}
              placeholder="Enter membership no, email, or mobile"
              className="focus-ring w-full rounded-lg border border-brand-200 px-3 py-2.5"
              autoComplete="username"
            />
          </label>
          <label className="block space-y-1 text-sm font-semibold text-slate-700">
            Password
            <input
              type="password"
              name="password"
              value={loginForm.password}
              onChange={onLoginChange}
              placeholder="Enter password"
              className="focus-ring w-full rounded-lg border border-brand-200 px-3 py-2.5"
              autoComplete="current-password"
            />
          </label>
          <button
            type="submit"
            disabled={loginLoading}
            className="focus-ring w-full rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:opacity-70"
          >
            {loginLoading ? "Signing In..." : "Login"}
          </button>
        </form>
      ) : (
        <form onSubmit={onForgotSubmit} className="mt-4 space-y-3">
          <label className="block space-y-1 text-sm font-semibold text-slate-700">
            Email / Mobile
            <input
              name="identifier"
              value={forgotForm.identifier}
              onChange={onForgotChange}
              placeholder="Enter email or mobile"
              className="focus-ring w-full rounded-lg border border-brand-200 px-3 py-2.5"
              autoComplete="email"
            />
          </label>
          <button
            type="submit"
            disabled={forgotLoading}
            className="focus-ring w-full rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800 disabled:opacity-70"
          >
            {forgotLoading ? "Submitting..." : "Reset Password"}
          </button>
        </form>
      )}

      {status.message && (
        <p className={`mt-3 text-sm ${status.type === "success" ? "text-emerald-600" : "text-red-600"}`}>
          {status.message}
        </p>
      )}
    </aside>
  );
}
