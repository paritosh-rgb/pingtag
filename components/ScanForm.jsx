"use client";

import { useState } from "react";

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

  async function sendAlert(event) {
    event.preventDefault();
    setBusy(true);
    setStatus(null);

    try {
      const response = await fetch("/api/notify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, tagId, token }),
      });
      const data = await response.json();

      if (!response.ok && !data.ok) {
        throw new Error(data.error || "Could not send alert.");
      }

      setForm((current) => ({ ...current, message: "" }));
      setStatus({
        kind: data.delivered ? "good" : "warn",
        text: data.delivered
          ? "Alert sent to the owner."
          : data.reason || "Message saved. The owner has not enabled push yet.",
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
    </form>
  );
}
