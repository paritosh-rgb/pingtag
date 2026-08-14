"use client";

import { useState } from "react";

const messages = ["You’re blocking me", "Your lights are still on", "Your window is open"];

export default function ScanDemo({ vehicleNumber, societyName, qrDataUrl, code }) {
  const [stage, setStage] = useState("idle");
  const [message, setMessage] = useState("");

  function reset() {
    setStage("idle");
    setMessage("");
  }

  return (
    <section className="scan-demo" id="try-a-scan">
      <div className="scan-demo-intro">
        <p className="eyebrow">Try a scan</p>
        <h2>See what a passer-by sees.<br /><em>Nothing more.</em></h2>
        <p>Tap the sample tag to test the anonymous contact flow. This is a safe demo—no message is actually sent.</p>
        <span className="scan-demo-id">LIVE DEMO · {code}</span>
      </div>
      <div className={`scan-demo-card stage-${stage}`}>
        {stage === "idle" ? (
          <button className="scan-demo-qr-button" onClick={() => setStage("scanned")} type="button" aria-label="Scan the sample ParkPing QR code">
            <span className="scan-demo-corners" />
            <img src={qrDataUrl} alt="Sample ParkPing QR code" />
            <strong>Tap to scan</strong>
          </button>
        ) : null}
        {stage === "scanned" ? (
          <div className="scan-demo-screen">
            <div className="scan-demo-screen-top"><span className="brand-mini">P</span><span>ParkPing</span><span>● PRIVATE</span></div>
            <p className="scan-demo-kicker">Anonymous car alert</p>
            <h3>Contact the owner</h3>
            <p className="scan-demo-vehicle">{vehicleNumber} · {societyName}</p>
            <p className="scan-demo-prompt">What would you like to let them know?</p>
            <div className="scan-demo-options">{messages.map((item) => <button key={item} onClick={() => { setMessage(item); setStage("sent"); }} type="button">{item}<span>↗</span></button>)}</div>
            <button className="scan-demo-back" onClick={reset} type="button">← Back to tag</button>
          </div>
        ) : null}
        {stage === "sent" ? (
          <div className="scan-demo-success">
            <span className="scan-demo-success-icon">✓</span>
            <p className="scan-demo-kicker">Message sent privately</p>
            <h3>That’s it. No number shared.</h3>
            <p>Your note <strong>“{message}”</strong> would reach the owner as a ParkPing alert.</p>
            <div className="scan-demo-notification"><span>↗</span><div><small>ParkPing alert · now</small><strong>{message}</strong></div></div>
            <a className="scan-demo-signup" href="/login?trial=1">Create your own ParkPing tag <span>↗</span></a>
            <button className="scan-demo-reset" onClick={reset} type="button">Try it again</button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
