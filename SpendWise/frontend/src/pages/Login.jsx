import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getError } from "../services/api";
import AuthShell from "./AuthShell";
import Field from "../components/Field";
import ErrorBanner from "../components/ErrorBanner";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Enter a valid email";
    if (!form.password) errs.password = "Password is required";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    setApiError("");
    try {
      await login(form.email.trim(), form.password);
      navigate("/dashboard");
    } catch (err) {
      setApiError(getError(err));
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your SpendWise account"
      footer={<>Don't have an account? <Link className="font-medium text-indigo-600" to="/register">Sign up</Link></>}
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <ErrorBanner message={apiError} />
        <Field label="Email" error={errors.email}>
          <input type="email" className={`input ${errors.email ? "input-error" : ""}`} placeholder="you@example.com"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
        </Field>
        <Field label="Password" error={errors.password}>
          <input type="password" className={`input ${errors.password ? "input-error" : ""}`} placeholder="••••••••"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password" />
        </Field>
        <button className="btn-primary w-full" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</button>
      </form>
    </AuthShell>
  );
}
