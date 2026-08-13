"use client";

import { useEffect, useState } from "react";

export default function AuthForm({ admin = false }) {
  const [mode, setMode] = useState(admin ? "login" : "signup");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("mode") === "login") {
      setMode("login");
    }
  }, []);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      const response = await fetch("/api/auth/phone", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ mode, phoneNumber, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not authenticate.");
      window.location.href = admin ? "/admin" : "/dashboard";
    } catch (error) {
      setStatus({ kind: "warn", text: error.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-card panel">
      {!admin ? <div className="auth-tabs" role="tablist" aria-label="Account access">
        <button className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")} role="tab" type="button">Sign up</button>
        <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")} role="tab" type="button">Login</button>
      </div> : null}
      <h1>{admin ? "Admin console login" : mode === "signup" ? "Create your owner account" : "Welcome back"}</h1>
      <p className="muted">{admin ? "Restricted access for PingTag operations." : "Your phone number stays private. It is only used to authenticate you and receive vehicle alerts."}</p>
      <form className="form-grid" onSubmit={submit}>
        <div className="field"><label htmlFor="phoneNumber">Phone number</label><input id="phoneNumber" onChange={(event) => setPhoneNumber(event.target.value)} placeholder="+91 98765 43210" required value={phoneNumber} /></div>
        <div className="field"><label htmlFor="password">Password</label><input id="password" minLength={6} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" required type="password" value={password} /></div>
        <button className="btn" disabled={busy} type="submit">{busy ? "Please wait..." : admin || mode === "login" ? "Login" : "Sign up"}<span>↗</span></button>
      </form>
      {status ? <div className={`status ${status.kind}`}>{status.text}</div> : null}
      <p className="form-note">{admin ? "This account is separate from vehicle owner accounts." : "Your phone is the visible identity. PingTag uses a private internal login identity and never displays it."}</p>
    </section>
  );
}
