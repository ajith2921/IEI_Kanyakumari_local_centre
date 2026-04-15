import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login, loading, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    const result = await login(form.username, form.password);
    if (result.success) {
      navigate("/admin", { replace: true });
      return;
    }
    setError(result.message || "Login failed");
  };

  return (
    <section className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-900 via-brand-700 to-brand-500 px-4 py-10">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
      >
        <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-brand-600">
          Admin Portal
        </p>
        <h1 className="mb-2 text-3xl font-black text-brand-800">Sign In</h1>
        <p className="mb-6 text-sm text-slate-600">Access content management tools.</p>

        <div className="space-y-4">
          <input
            name="username"
            value={form.username}
            onChange={onChange}
            required
            placeholder="Username"
            className="focus-ring w-full rounded-lg border border-brand-200 px-3 py-3"
          />
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            required
            placeholder="Password"
            className="focus-ring w-full rounded-lg border border-brand-200 px-3 py-3"
          />
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="focus-ring mt-6 w-full rounded-lg bg-brand-700 py-3 font-semibold text-white hover:bg-brand-800 disabled:opacity-70"
        >
          {loading ? "Authenticating..." : "Login"}
        </button>
      </form>
    </section>
  );
}
