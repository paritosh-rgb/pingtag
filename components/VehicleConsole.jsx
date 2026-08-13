"use client";

import { useEffect, useMemo, useState } from "react";

function urlBase64ToUint8Array(value) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const raw = window.atob((value + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((character) => character.charCodeAt(0)));
}

export default function VehicleConsole() {
  const [vehicles, setVehicles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [form, setForm] = useState({ tagCode: "", vehicleNumber: "", phoneNumber: "", address: "", societyName: "", flatNumber: "" });
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const canPush = useMemo(() => typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator && "PushManager" in window, []);

  useEffect(() => {
    const isIos = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isStandalone = navigator.standalone === true || window.matchMedia("(display-mode: standalone)").matches;
    setShowInstallPrompt(isIos && !isStandalone);
    fetch("/api/vehicles").then(async (response) => { if (response.status === 401) { window.location.href = "/login"; return; } const loaded = (await response.json()).vehicles || []; setVehicles(loaded); if (loaded[0]) selectVehicle(loaded[0]); });
  }, []);
  function update(event) { setForm((current) => ({ ...current, [event.target.name]: event.target.value })); }
  async function loadAlerts(vehicle) {
    const response = await fetch(`/api/alerts?vehicleId=${encodeURIComponent(vehicle.id)}`);
    if (response.ok) setAlerts((await response.json()).alerts || []);
  }
  async function selectVehicle(vehicle) {
    setSelected(vehicle);
    await loadAlerts(vehicle);
  }
  useEffect(() => { if (!selected) return undefined; const timer = setInterval(() => loadAlerts(selected), 15000); return () => clearInterval(timer); }, [selected]);

  async function addVehicle(event) {
    event.preventDefault(); setBusy(true); setStatus(null);
    try {
      const response = await fetch("/api/vehicles", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Could not register vehicle.");
      setVehicles((current) => [data.vehicle, ...current]); setSelected(data.vehicle); setAlerts([]); setForm({ tagCode: "", vehicleNumber: "", phoneNumber: "", address: "", societyName: "", flatNumber: "" });
      setStatus({ kind: "good", text: "Tag activated. Enable notifications and place the delivered sticker on your windshield." });
    } catch (error) { setStatus({ kind: "warn", text: error.message }); } finally { setBusy(false); }
  }

  async function createTrial() {
    if (!form.vehicleNumber || !form.phoneNumber) { setStatus({ kind: "warn", text: "Enter the vehicle number and phone number first." }); return; }
    setBusy(true); setStatus(null);
    try {
      const response = await fetch("/api/trial", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
      const raw = await response.text(); let data = {}; try { data = raw ? JSON.parse(raw) : {}; } catch {}
      if (!response.ok) throw new Error(data.error || `Could not create trial tag (${response.status}).`);
      const vehicle = data.vehicle;
      setVehicles((current) => current.some((item) => item.id === vehicle.id) ? current : [vehicle, ...current]); setSelected(vehicle); setAlerts([]);
      setStatus({ kind: "good", text: data.existing ? "Your free trial tag is ready." : "Free digital trial created. Print it and try PingTag for 14 days." });
    } catch (error) { setStatus({ kind: "warn", text: error.message }); } finally { setBusy(false); }
  }

  async function enablePush() {
    if (!selected) return; setBusy(true); setStatus(null);
    try {
      const isIos = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      const isStandalone = navigator.standalone === true || window.matchMedia("(display-mode: standalone)").matches;
      if (isIos && !isStandalone) throw new Error("On iPhone, first use Safari's Share button → Add to Home Screen. Then open PingTag from the new Home Screen icon and enable notifications there.");
      if (!canPush) throw new Error("This browser does not support Web Push notifications. Use Chrome or Edge on Android, or open PingTag from its iPhone Home Screen icon.");
      const key = await (await fetch("/api/subscribe")).json(); if (!key.publicKey) throw new Error("Add VAPID keys before enabling notifications.");
      if (await Notification.requestPermission() !== "granted") throw new Error("Notification permission was not granted.");
      await navigator.serviceWorker.register("/sw.js");
      const registration = await navigator.serviceWorker.ready;
      let subscription;
      try {
        subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(key.publicKey) });
      } catch (error) {
        if (/push service|service worker|not supported/i.test(error.message || "")) {
          throw new Error("This browser cannot connect to a push service. Try Chrome or Edge over localhost or HTTPS.");
        }
        throw error;
      }
      const response = await fetch("/api/subscribe", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ tagId: selected.id, ownerKey: selected.ownerKey, subscription }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || "Could not enable notifications.");
      await testPush();
    } catch (error) { setStatus({ kind: "warn", text: error.message }); } finally { setBusy(false); }
  }

  async function testPush() {
    if (!selected) return;
    setBusy(true); setStatus(null);
    try {
      if (showInstallPrompt) throw new Error("Add PingTag to your Home Screen, open it from the new icon, then test notifications again.");
      const response = await fetch("/api/notify/test", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ tagId: selected.id }) });
      const data = await response.json();
      if (!response.ok || !data.delivered) throw new Error(data.error || data.reason || "The browser accepted the subscription but did not confirm delivery.");
      setStatus({ kind: "good", text: "Test notification sent. Check your macOS Notification Center." });
    } catch (error) { setStatus({ kind: "warn", text: error.message }); } finally { setBusy(false); }
  }

  function downloadTagImage() {
    if (!selected) return;
    const canvas = document.createElement("canvas");
    canvas.width = 1200; canvas.height = 720;
    const context = canvas.getContext("2d");
    context.fillStyle = "#17211d"; context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#b7e4d5"; context.font = "700 42px Arial"; context.fillText("P", 64, 78);
    context.fillStyle = "#fffef9"; context.font = "700 38px Arial"; context.fillText("PingTag", 120, 78);
    context.fillStyle = "#9eb8ae"; context.font = "700 18px Arial"; context.fillText("PRIVACY-FIRST PARKING", 760, 76);
    context.fillStyle = "#a9dfcf"; context.font = "700 22px Arial"; context.fillText("SCAN TO REACH THE OWNER", 64, 190);
    context.fillStyle = "#fffef9"; context.font = "700 52px Arial"; context.fillText(selected.vehicleNumber || "Your vehicle", 64, 260);
    context.fillStyle = "#b9c9c1"; context.font = "24px Arial"; context.fillText("Send an anonymous alert without exposing your phone number.", 64, 310);
    context.fillStyle = "#b7e4d5"; context.font = "700 22px Arial"; context.fillText("Scan. Send. Stay private.", 64, 640);
    context.fillStyle = "#9eb8ae"; context.font = "18px monospace"; context.fillText(selected.tagCode || selected.qrToken, 890, 640);
    const qr = new Image();
    qr.onload = () => { context.fillStyle = "#fffef9"; context.fillRect(790, 145, 320, 320); context.drawImage(qr, 815, 170, 270, 270); const link = document.createElement("a"); link.download = `${selected.tagCode || selected.qrToken}-pingtag.png`; link.href = canvas.toDataURL("image/png"); link.click(); };
    qr.src = selected.qrDataUrl;
  }

  useEffect(() => {
    const button = [...document.querySelectorAll("button")].find((item) => item.textContent?.trim() === "Print tag");
    if (button) button.textContent = "Download image";
    const handleTagDownload = (event) => {
      if (event.target.closest("button")?.textContent?.trim() === "Download image") {
        event.preventDefault(); event.stopPropagation(); downloadTagImage();
      }
    };
    document.addEventListener("click", handleTagDownload, true);
    return () => document.removeEventListener("click", handleTagDownload, true);
  }, [selected]);

 return <>{showInstallPrompt ? <div className="install-backdrop" role="dialog" aria-modal="true" aria-labelledby="install-title"><div className="install-modal"><span className="section-kicker">Required for phone alerts</span><h2 id="install-title">Add PingTag to your Home Screen</h2><p>iPhone notifications only work when PingTag is opened as a Home Screen app.</p><ol><li>Tap Safari's <strong>Share</strong> button.</li><li>Choose <strong>Add to Home Screen</strong>.</li><li>Open PingTag from the new icon.</li><li>Enable notifications there.</li></ol><div className="install-note">After adding it, close this Safari tab and open PingTag from the new icon.</div></div></div> : null}<div className="workspace"><section className="panel"><div className="section-kicker">Owner dashboard</div><h1>Activate your tag</h1><p className="muted">Enter the unique ID printed on your delivered PingTag. Once activated, attach your vehicle details to that physical sticker.</p><div className="activation-hint"><span>01</span><div><strong>Have a physical tag?</strong><small>Enter the unique ID printed below its QR code.</small></div></div><form className="form-grid" onSubmit={addVehicle}><div className="field field-wide"><label htmlFor="tagCode">Tag ID</label><input autoCapitalize="characters" id="tagCode" name="tagCode" onChange={update} placeholder="PING-4A8C2F" required value={form.tagCode} /></div><div className="field"><label htmlFor="vehicleNumber">Vehicle number</label><input id="vehicleNumber" name="vehicleNumber" onChange={update} placeholder="MH 12 AB 1234" required value={form.vehicleNumber} /></div><div className="field"><label htmlFor="phoneNumber">Private phone number</label><input id="phoneNumber" name="phoneNumber" onChange={update} placeholder="+91 98765 43210" value={form.phoneNumber} /></div><div className="field"><label htmlFor="societyName">Society / building name <span>Optional</span></label><input id="societyName" name="societyName" onChange={update} placeholder="Greenview Residency" value={form.societyName} /></div><div className="field"><label htmlFor="flatNumber">Flat number <span>Optional</span></label><input id="flatNumber" name="flatNumber" onChange={update} placeholder="B-1204" value={form.flatNumber} /></div><div className="field field-wide"><label htmlFor="address">Address <span>Optional</span></label><textarea id="address" name="address" onChange={update} placeholder="Private address for your records" rows="3" value={form.address} /></div><div className="button-row"><button className="btn" disabled={busy} type="submit">{busy ? "Activating..." : "Activate physical tag"}<span>↗</span></button><button className="btn secondary" disabled={busy} onClick={createTrial} type="button">{busy ? "Creating..." : "Try free digital tag"}</button></div></form>{status ? <div className={`status ${status.kind}`}>{status.text}</div> : null}</section><aside className="panel"><div className="section-kicker">Your active tags</div><h2>Ready when your sticker arrives</h2>{vehicles.length === 0 ? <div className="empty-state"><strong>No active tags yet.</strong><span>Activate a delivered tag or create a free digital trial.</span></div> : <div className="vehicle-list">{vehicles.map((vehicle) => <button className={`vehicle-item ${selected?.id === vehicle.id ? "selected" : ""}`} key={vehicle.id} onClick={() => selectVehicle(vehicle)} type="button"><strong>{vehicle.vehicleNumber}</strong><span>{vehicle.isTrial ? "Free trial" : vehicle.tagCode || vehicle.qrToken} · {[vehicle.societyName, vehicle.flatNumber].filter(Boolean).join(" · ") || "Personal vehicle"}</span></button>)}</div>}{selected ? <div className="tag-preview"><div className="active-tag-label"><span className="live-dot" /> {selected.isTrial ? "Free digital trial" : "Active physical tag"}</div>{selected.isTrial ? <div className="trial-banner">Try it free until {new Date(selected.trialExpiresAt).toLocaleDateString()} · Upgrade to a weatherproof physical tag when ready.</div> : null}<div className="print-tag dashboard-print-tag"><div className="print-tag-brand"><span className="brand-mark">P</span><strong>PingTag</strong><span>PRIVACY-FIRST PARKING</span></div><div className="print-tag-copy"><span className="print-tag-kicker">Scan to reach the owner</span><h2>{selected.vehicleNumber || "Your vehicle"}</h2><p>Send an anonymous alert without exposing your phone number.</p></div><img className="admin-qr" alt={`QR code for ${selected.vehicleNumber}`} src={selected.qrDataUrl} /><div className="print-tag-footer"><strong>Scan. Send. Stay private.</strong><span>{selected.tagCode || selected.qrToken}</span></div></div><span className="mono">{selected.scanUrl}</span><div className="button-row"><button className="btn secondary" disabled={busy} onClick={() => window.print()} type="button">Print tag</button><button className="btn secondary" disabled={busy} onClick={enablePush} type="button">Enable notifications</button><button className="btn secondary" disabled={busy} onClick={testPush} type="button">Test notification</button><a className="btn secondary" href={selected.scanUrl} target="_blank" rel="noreferrer">Open scan page</a></div></div> : null}<div className="ping-log"><div className="log-heading"><div><div className="section-kicker">Private activity</div><h3>Ping history</h3></div><div className="log-actions"><span>{alerts.length} total</span><button className="log-refresh" onClick={() => selected && loadAlerts(selected)} type="button" title="Refresh ping history">↻</button></div></div>{!selected ? <p className="log-empty">Activate or select a tag to see its ping history.</p> : alerts.length === 0 ? <p className="log-empty">No pings yet. Your first anonymous alert will appear here.</p> : <div className="log-list">{alerts.map((alert) => <article className="log-item" key={alert.id}><div className="log-icon">↗</div><div className="log-content"><div className="log-meta"><strong>{alert.category || "Heads up"}</strong><time>{new Date(alert.createdAt).toLocaleString()}</time></div><p>{alert.message}</p><span className={alert.delivered ? "delivery delivered" : "delivery"}>{alert.delivered ? "Push enabled" : "Saved · notifications off"}</span></div></article>)}</div>}</div></aside></div></>;
}
