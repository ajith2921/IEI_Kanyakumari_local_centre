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

const initialReset = {
  token: "",
  password: "",
  confirm_password: "",
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
  const [resetForm, setResetForm] = useState(initialReset);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
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

  const onResetChange = (event) => {
    const { name, value } = event.target;
    clearStatus();
    setResetForm((prev) => ({ ...prev, [name]: value }));
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
      const resetToken = String(response.data?.reset_token || "");

      if (resetToken) {
        setResetForm((prev) => ({
          ...prev,
          token: resetToken,
        }));
      }

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

  const onResetSubmit = async (event) => {
    event.preventDefault();

    const token = resetForm.token.trim();
    if (!token) {
      setStatus({ type: "error", message: "Reset token is required." });
      return;
    }

    if (!resetForm.password || !resetForm.confirm_password) {
      setStatus({ type: "error", message: "Both password fields are required." });
      return;
    }

    setResetLoading(true);
    setStatus({ type: "", message: "" });

    try {
      const response = await publicApi.membershipResetPassword({
        token,
        password: resetForm.password,
        confirm_password: resetForm.confirm_password,
      });

      setStatus({
        type: "success",
        message: response.data?.message || "Password reset successful. Please sign in.",
      });
      setResetForm(initialReset);
      setActiveTab("login");
    } catch (error) {
      setStatus({ type: "error", message: parseApiError(error) });
    } finally {
      setResetLoading(false);
    }
  };

  if (isAuthenticated) {
    return (
      <Card as="aside" id="auth-panel" className="p-5 md:p-6" padded={false}>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-gray-500">Member Access</p>
        <h3 className="mt-2 text-xl font-medium text-gray-900">Welcome Back</h3>
        <p className="mt-1 text-sm text-gray-600">You are signed in to the membership portal.</p>

        <dl className="mt-4 space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="font-semibold text-gray-600">Name</dt>
            <dd className="font-semibold text-gray-900">{member?.name || "Member"}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="font-semibold text-gray-600">Category</dt>
            <dd className="font-semibold text-gray-900">{member?.membership_type || "N/A"}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="font-semibold text-gray-600">Membership No</dt>
            <dd className="font-semibold text-gray-900">{member?.membership_id || "Pending"}</dd>
          </div>
        </dl>

        <Button
          onClick={async () => {
            await logout();
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
              status.type === "success" ? "text-[#3B82F6]" : "text-gray-500"
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
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-gray-500">Member Access</p>
      <h3 className="mt-2 text-xl font-medium text-gray-900">Portal Sign In</h3>
      <p className="mt-1 text-sm text-gray-600">
        Access your membership profile and services after your application is approved.
      </p>

      <div className="mt-4 grid grid-cols-2 rounded-xl border border-gray-200 bg-gray-50 p-1">
        <Button
          type="button"
          onClick={() => {
            setActiveTab("login");
            clearStatus();
          }}
          variant="ghost"
          className={`w-full rounded-md px-3 py-2 text-sm font-medium ${
            activeTab === "login" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:bg-white hover:text-gray-900"
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
          className={`w-full rounded-md px-3 py-2 text-sm font-medium ${
            activeTab === "forgot" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:bg-white hover:text-gray-900"
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
        <div className="mt-4 space-y-4">
          <form onSubmit={onForgotSubmit} className="space-y-3">
            <Input
              label="Email / Mobile"
              name="identifier"
              value={forgotForm.identifier}
              onChange={onForgotChange}
              placeholder="Enter email or mobile"
              autoComplete="email"
            />
            <Button type="submit" disabled={forgotLoading} className="w-full">
              {forgotLoading ? "Submitting..." : "Request Reset Token"}
            </Button>
          </form>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">
              Reset With Token
            </p>
            <form onSubmit={onResetSubmit} className="space-y-3">
              <Input
                label="Reset Token"
                name="token"
                value={resetForm.token}
                onChange={onResetChange}
                placeholder="Paste reset token"
              />
              <Input
                label="New Password"
                type="password"
                name="password"
                value={resetForm.password}
                onChange={onResetChange}
                placeholder="Enter new password"
                autoComplete="new-password"
              />
              <Input
                label="Confirm Password"
                type="password"
                name="confirm_password"
                value={resetForm.confirm_password}
                onChange={onResetChange}
                placeholder="Re-enter new password"
                autoComplete="new-password"
              />
              <Button type="submit" disabled={resetLoading} className="w-full">
                {resetLoading ? "Updating Password..." : "Set New Password"}
              </Button>
            </form>
          </div>
        </div>
      )}

      {status.message && (
        <p className={`mt-3 text-sm ${status.type === "success" ? "text-[#3B82F6]" : "text-gray-500"}`}>
          {status.message}
        </p>
      )}
    </Card>
  );
}
