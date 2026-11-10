import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getError } from "../services/api";
import AuthShell from "./AuthShell";
import Field from "../components/Field";
import ErrorBanner from "../components/ErrorBanner";

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (form.full_name.trim().length < 2) errs.full_name = "Enter your name (min 2 characters)";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Enter a valid email";
    if (form.password.length < 8) errs.password = "Password must be at least 8 characters";
    else if (form.password.length > 72) errs.password = "Password must be at most 72 characters";
    if (form.confirm !== form.password) errs.confirm = "Passwords do not match";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    setApiError("");
    try {
      await register(form.full_name.trim(), form.email.trim(), form.password);
      navigate("/dashboard");
    } catch (err) {
      setApiError(getError(err));
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start tracking your finances in minutes"
      footer={<>Already have an account? <Link className="font-medium text-emerald-600" to="/login">Sign in</Link></>}
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <ErrorBanner message={apiError} />
        <Field label="Full name" error={errors.full_name}>
          <input className={`input ${errors.full_name ? "input-error" : ""}`} value={form.full_name} onChange={set("full_name")} placeholder="Jane Doe" />
        </Field>
        <Field label="Email" error={errors.email}>
          <input type="email" className={`input ${errors.email ? "input-error" : ""}`} value={form.email} onChange={set("email")} placeholder="you@example.com" />
        </Field>
        <Field label="Password" error={errors.password}>
          <input type="password" className={`input ${errors.password ? "input-error" : ""}`} value={form.password} onChange={set("password")} placeholder="At least 8 characters" />
        </Field>
        <Field label="Confirm password" error={errors.confirm}>
          <input type="password" className={`input ${errors.confirm ? "input-error" : ""}`} value={form.confirm} onChange={set("confirm")} />
        </Field>
        <button className="btn-primary w-full" disabled={loading}>{loading ? "Creating account..." : "Create account"}</button>
      </form>
    </AuthShell>
  );
}
