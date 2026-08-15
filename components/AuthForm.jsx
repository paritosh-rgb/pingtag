"use client";

import { useEffect, useState } from "react";

export default function AuthForm({ admin = false }) {
  const [mode, setMode] = useState(admin ? "login" : "signup");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [trialMode, setTrialMode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setMode(admin ? "login" : params.get("mode") === "login" ? "login" : "signup");
      setTrialMode(params.get("trial") === "1");
    }
  }, []);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setStatus(null);
    try {
      if (trialMode && mode === "signup" && !vehicleNumber.trim()) throw new Error("Enter your vehicle number to create the free trial tag.");
      const response = await fetch("/api/auth/phone", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ mode, phoneNumber, password }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not authenticate.");
      if (trialMode && mode === "signup") {
        const trialResponse = await fetch("/api/trial", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ vehicleNumber: vehicleNumber.trim(), phoneNumber }) });
        const trialData = await trialResponse.json();
        if (!trialResponse.ok) throw new Error(trialData.error || "Your account was created, but the trial tag could not be generated.");
      }
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
      <h1>{admin ? "Admin console login" : trialMode ? "Create your free trial tag" : mode === "signup" ? "Create your owner account" : "Welcome back"}</h1>
      <p className="muted">{admin ? "Restricted access for ParkPing operations." : trialMode ? "Enter your details and vehicle number. Your digital ParkPing tag will be ready immediately after signup." : "Your phone number stays private. It is only used to authenticate you and receive vehicle alerts."}</p>
      <form className="form-grid" onSubmit={submit}>
        <div className="field"><label htmlFor="phoneNumber">Phone number</label><input id="phoneNumber" onChange={(event) => setPhoneNumber(event.target.value)} placeholder="+91 98765 43210" required value={phoneNumber} /></div>
        <div className="field"><label htmlFor="password">Password</label><input id="password" minLength={6} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" required type="password" value={password} /></div>
        {trialMode && mode === "signup" ? <div className="field"><label htmlFor="trialVehicleNumber">Vehicle number</label><input id="trialVehicleNumber" onChange={(event) => setVehicleNumber(event.target.value)} placeholder="MH 12 AB 1234" required value={vehicleNumber} /></div> : null}
        <button className="btn" disabled={busy} type="submit">{busy ? "Please wait..." : trialMode && mode === "signup" ? "Create free trial tag" : admin || mode === "login" ? "Login" : "Sign up"}<span>↗</span></button>
      </form>
      {status ? <div className={`status ${status.kind}`}>{status.text}</div> : null}
      <p className="form-note">{admin ? "This account is separate from vehicle owner accounts." : "Your phone is the visible identity. ParkPing by GetPing uses a private internal login identity and never displays it."}</p>
    </section>
  );
}
