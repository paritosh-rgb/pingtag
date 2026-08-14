"use client";

import { useState } from "react";

const alerts = [
  { type: "Blocked in", text: "Could you move your car when you get a moment?", time: "now", tone: "coral" },
  { type: "Lights on", text: "Your headlights are still on.", time: "8 min ago", tone: "yellow" },
  { type: "Window open", text: "A quick heads up from your parking spot.", time: "Yesterday", tone: "teal" },
];

export default function OwnerPreview() {
  const [selected, setSelected] = useState(0);
  const [reply, setReply] = useState("");
  const [sent, setSent] = useState(false);
  const active = alerts[selected];

  function sendReply(event) {
    event.preventDefault();
    if (!reply.trim()) return;
    setSent(true);
    setReply("");
  }

  return (
    <section className="owner-preview" id="owner-preview">
      <div className="owner-preview-copy">
        <p className="eyebrow">The owner view</p>
        <h2>Your car called.<br /><em>You stay in control.</em></h2>
        <p>Every ping arrives with just enough context to help you act—without revealing the sender or putting your number on display.</p>
        <span className="owner-preview-badge"><i /> PRIVATE BY DEFAULT</span>
      </div>
      <div className="owner-dashboard-card">
        <div className="owner-dashboard-head"><div><span className="owner-dashboard-kicker">ParkPing / OWNER VIEW</span><h3>Good evening, driver.</h3></div><span className="owner-dashboard-avatar">P</span></div>
        <div className="owner-dashboard-grid">
          <div className="owner-alert-list"><div className="owner-list-head"><strong>Ping history</strong><span>{alerts.length} total</span></div>{alerts.map((item, index) => <button className={`owner-alert ${selected === index ? "selected" : ""}`} key={item.type} onClick={() => { setSelected(index); setSent(false); }} type="button"><span className={`owner-alert-dot ${item.tone}`} /><span><strong>{item.type}</strong><small>{item.text}</small></span><time>{item.time}</time></button>)}</div>
          <div className="owner-message-panel"><span className="owner-panel-label">SELECTED PING</span><div className="owner-message-icon">↗</div><h4>{active.type}</h4><p>{active.text}</p><span className="owner-message-meta">Anonymous sender · {active.time}</span><form onSubmit={sendReply}><label htmlFor="preview-reply">Private reply</label><div><input id="preview-reply" onChange={(event) => { setReply(event.target.value); setSent(false); }} placeholder="Thanks, I’m on my way." value={reply} /><button type="submit" aria-label="Send private reply">↗</button></div></form>{sent ? <small className="owner-sent">✓ Reply sent privately</small> : <small className="owner-form-note">Your number stays hidden.</small>}</div>
        </div>
      </div>
    </section>
  );
}
