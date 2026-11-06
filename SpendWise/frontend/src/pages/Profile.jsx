import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/endpoints";
import { getError } from "../services/api";
import PageHeader from "../components/PageHeader";
import Field from "../components/Field";
import ErrorBanner from "../components/ErrorBanner";

const Ok = ({ message }) => message ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</div> : null;

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();

  const [info, setInfo] = useState({ full_name: user.full_name, email: user.email });
  const [infoErr, setInfoErr] = useState({});
  const [infoMsg, setInfoMsg] = useState({ ok: "", error: "" });
  const [pw, setPw] = useState({ current_password: "", new_password: "", confirm: "" });
  const [pwErr, setPwErr] = useState({});
  const [pwMsg, setPwMsg] = useState({ ok: "", error: "" });
  const [busy, setBusy] = useState("");

  const saveInfo = async (e) => {
    e.preventDefault();
    const errs = {};
    if (info.full_name.trim().length < 2) errs.full_name = "Name must be at least 2 characters";
    if (!/^\S+@\S+\.\S+$/.test(info.email)) errs.email = "Enter a valid email";
    setInfoErr(errs);
    if (Object.keys(errs).length) return;
    setBusy("info"); setInfoMsg({ ok: "", error: "" });
    try {
      setUser(await authService.updateProfile({ full_name: info.full_name.trim(), email: info.email.trim() }));
      setInfoMsg({ ok: "Profile updated.", error: "" });
    } catch (err) { setInfoMsg({ ok: "", error: getError(err) }); }
    finally { setBusy(""); }
  };

  const savePw = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!pw.current_password) errs.current_password = "Enter your current password";
    if (pw.new_password.length < 8) errs.new_password = "At least 8 characters";
    else if (pw.new_password.length > 72) errs.new_password = "At most 72 characters";
    if (pw.confirm !== pw.new_password) errs.confirm = "Passwords do not match";
    setPwErr(errs);
    if (Object.keys(errs).length) return;
    setBusy("pw"); setPwMsg({ ok: "", error: "" });
    try {
      await authService.changePassword({ current_password: pw.current_password, new_password: pw.new_password });
      setPw({ current_password: "", new_password: "", confirm: "" });
      setPwMsg({ ok: "Password changed.", error: "" });
    } catch (err) { setPwMsg({ ok: "", error: getError(err) }); }
    finally { setBusy(""); }
  };

  return (
    <>
      <PageHeader title="Profile" subtitle="Manage your account" />
      <div className="grid gap-4 lg:grid-cols-2">
        <form onSubmit={saveInfo} className="card space-y-4 p-5" noValidate>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-700">{user.full_name[0].toUpperCase()}</div>
            <div><p className="font-semibold">{user.full_name}</p><p className="text-sm text-slate-500">Member since {new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p></div>
          </div>
          <ErrorBanner message={infoMsg.error} /><Ok message={infoMsg.ok} />
          <Field label="Full name" error={infoErr.full_name}><input className="input" value={info.full_name} onChange={(e) => setInfo({ ...info, full_name: e.target.value })} /></Field>
          <Field label="Email" error={infoErr.email}><input type="email" className="input" value={info.email} onChange={(e) => setInfo({ ...info, email: e.target.value })} /></Field>
          <button className="btn-primary" disabled={busy === "info"}>{busy === "info" ? "Saving..." : "Update profile"}</button>
        </form>

        <form onSubmit={savePw} className="card space-y-4 p-5" noValidate>
          <h2 className="font-semibold">Change password</h2>
          <ErrorBanner message={pwMsg.error} /><Ok message={pwMsg.ok} />
          <Field label="Current password" error={pwErr.current_password}><input type="password" className="input" value={pw.current_password} onChange={(e) => setPw({ ...pw, current_password: e.target.value })} /></Field>
          <Field label="New password" error={pwErr.new_password}><input type="password" className="input" value={pw.new_password} onChange={(e) => setPw({ ...pw, new_password: e.target.value })} /></Field>
          <Field label="Confirm new password" error={pwErr.confirm}><input type="password" className="input" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></Field>
          <button className="btn-primary" disabled={busy === "pw"}>{busy === "pw" ? "Saving..." : "Change password"}</button>
        </form>
      </div>
      <div className="mt-4">
        <button className="btn-secondary" onClick={() => { logout(); navigate("/login"); }}><LogOut className="h-4 w-4" /> Logout</button>
      </div>
    </>
  );
}
