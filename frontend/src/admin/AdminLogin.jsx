import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
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
    <section className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-900 via-brand-700 to-blue-500 px-4 py-10">
      <Card
        as="form"
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl border border-white/20 bg-white p-8 shadow-2xl"
      >
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
          Admin Portal
        </p>
        <h1 className="mb-2 text-3xl font-semibold text-gray-900">Sign In</h1>
        <p className="mb-6 text-sm text-gray-600">Access content management tools.</p>

        <div className="space-y-4">
          <Input
            label="Username"
            name="username"
            value={form.username}
            onChange={onChange}
            required
            placeholder="Username"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            required
            placeholder="Password"
          />
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <Button type="submit" disabled={loading} className="mt-6 w-full py-3">
          {loading ? "Authenticating..." : "Login"}
        </Button>
      </Card>
    </section>
  );
}
