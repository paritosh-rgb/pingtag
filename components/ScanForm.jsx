"use client";

import { useState } from "react";
import ChatPanel from "@/components/ChatPanel";

const quickMessages = {
  "Blocked access": "Your car is blocking access. Could you please move it?",
  "Lights left on": "Your car lights appear to be on.",
  "Window open": "One of your car windows appears to be open.",
  "Minor damage": "I noticed possible minor damage on your car.",
  "Move request": "Could you please move your car when you get a moment?",
};

export default function ScanForm({ tagId, token }) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState("");
  const [chat, setChat] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [form, setForm] = useState({
    category: "Blocked access",
    message: "",
  });

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function chooseQuickMessage(category) {
    setForm({ category, message: quickMessages[category] });
  }

  function toggleLocation(event) {
    if (!event.target.checked) { setLocation(null); setLocationStatus(""); return; }
    if (!navigator.geolocation) { setLocationStatus("Location is not available in this browser."); return; }
    setLocationStatus("Requesting approximate location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ latitude: Number(position.coords.latitude.toFixed(3)), longitude: Number(position.coords.longitude.toFixed(3)), accuracy: Math.round(position.coords.accuracy || 0) });
        setLocationStatus("Approximate location attached.");
      },
      () => { event.target.checked = false; setLocationStatus("Location permission was not granted."); },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 120000 },
    );
  }

  async function sendAlert(event) {
    event.preventDefault();
    setBusy(true);
    setStatus(null);
    setReceipt(null);

    try {
      const response = await fetch("/api/notify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, tagId, token, location }),
      });
      const data = await response.json();

      if (!response.ok && !data.ok) {
        throw new Error(data.error || "Could not send alert.");
      }

      setForm((current) => ({ ...current, message: "" }));
      setChat(data.chat || null);
      setReceipt(data.receipt || {
        state: data.delivered ? "notified" : "saved",
        confirmedAt: new Date().toISOString(),
        detail: data.delivered ? "The notification service accepted this alert for the owner's device." : data.reason || "The alert is saved for the owner.",
      });
    } catch (error) {
      setStatus({ kind: "warn", text: error.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={sendAlert}>
      <div className="field">
        <label htmlFor="category">Reason</label>
        <div className="quick-choices" role="group" aria-label="Quick message reasons">
          {Object.keys(quickMessages).map((category) => <button className={form.category === category ? "quick-choice active" : "quick-choice"} key={category} onClick={() => chooseQuickMessage(category)} type="button">{category}</button>)}
        </div>
        <select className="visually-hidden" id="category" name="category" onChange={updateField} value={form.category}>
          {Object.keys(quickMessages).map((category) => <option key={category}>{category}</option>)}
        </select>
      </div>

      <label className="location-consent"><input type="checkbox" onChange={toggleLocation} /><span><strong>Share approximate location</strong><small>Helpful for finding the car. Your exact location is rounded before saving.</small></span></label>
      {locationStatus ? <div className="location-status">{locationStatus}</div> : null}

      <div className="field">
        <label htmlFor="message">Anonymous message</label>
        <textarea
          id="message"
          maxLength={240}
          name="message"
          onChange={updateField}
          placeholder="Your car is blocking my driveway. Could you please move it?"
          required
          value={form.message}
        />
        <div className="field-meta"><span>Keep it brief and useful.</span><span>{form.message.length}/240</span></div>
      </div>

      <button className="btn warning" disabled={busy} type="submit">
        {busy ? "Sending..." : "Send alert"}
      </button>

      {status ? <div className={`status ${status.kind}`}>{status.text}</div> : null}
      {receipt ? <section className={`delivery-receipt ${receipt.state}`} aria-live="polite"><span className="delivery-receipt-icon">{receipt.state === "notified" ? "✓" : "↗"}</span><div><small>DELIVERY CONFIRMATION</small><h3>{receipt.state === "notified" ? "Owner notified" : "Alert saved for the owner"}</h3><p>{receipt.detail}</p><span>{receipt.alertId ? `Reference ${String(receipt.alertId).slice(0, 8)} · ` : ""}{new Date(receipt.confirmedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></div></section> : null}
      {chat ? <ChatPanel token={chat.token} role="scanner" /> : null}
    </form>
  );
}
