"use client";

import { useEffect, useMemo, useState } from "react";

export default function AdminConsole() {
  const [tags, setTags] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [society, setSociety] = useState("all");
  const [selected, setSelected] = useState(null);
  const [societyName, setSocietyName] = useState("");
  const [saving, setSaving] = useState(false);
  const [setupRequired, setSetupRequired] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { fetch("/api/admin/tags").then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error || "Admin access required."); setTags(data.tags || []); setSelected(data.tags?.[0] || null); setSocietyName(data.tags?.[0]?.societyName || ""); setSetupRequired(Boolean(data.setupRequired)); }).catch((reason) => setError(reason.message)); }, []);
  const societies = useMemo(() => [...new Set(tags.map((tag) => tag.societyName).filter(Boolean))].sort(), [tags]);
  const filtered = useMemo(() => tags.filter((tag) => (status === "all" || tag.status === status) && (society === "all" || tag.societyName === society) && `${tag.code} ${tag.societyName || ""} ${tag.vehicle?.number || ""} ${tag.vehicle?.ownerPhone || ""}`.toLowerCase().includes(query.toLowerCase())), [tags, query, status, society]);
  const counts = useMemo(() => ({ total: tags.length, available: tags.filter((tag) => tag.status === "available").length, activated: tags.filter((tag) => tag.status === "activated").length }), [tags]);

  const selectTag = (tag) => { setSelected(tag); setSocietyName(tag.societyName || ""); };
  const saveSociety = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const response = await fetch("/api/admin/tags", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ tagId: selected.id, societyName }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update society.");
      setTags((current) => current.map((tag) => tag.id === selected.id ? { ...tag, societyName: data.tag.societyName } : tag));
      setSelected((current) => current ? { ...current, societyName: data.tag.societyName } : current);
    } catch (reason) { setError(reason.message); } finally { setSaving(false); }
  };

  if (error) return <main className="admin-wrap"><section className="admin-error"><span className="section-kicker">Restricted workspace</span><h1>Admin access required</h1><p>{error}</p><a className="btn" href="/login">Go to login</a></section></main>;
  return <main className="admin-wrap"><header className="admin-header"><div><span className="section-kicker">Operations</span><h1>Tag inventory</h1><p>Track every printed QR tag from stock to an activated vehicle.</p></div><span className="admin-badge">Admin console</span></header>{setupRequired ? <div className="status warn">Run <code>supabase/society-inventory.sql</code> in Supabase before assigning society inventory.</div> : null}<section className="admin-stats"><div><span>Total tags</span><strong>{counts.total}</strong></div><div><span>Available to ship</span><strong>{counts.available}</strong></div><div><span>Activated</span><strong>{counts.activated}</strong></div></section><section className="admin-layout"><div className="admin-table-panel"><div className="admin-toolbar"><input aria-label="Search tag inventory" onChange={(event) => setQuery(event.target.value)} placeholder="Search ID, society, vehicle, or owner" value={query} /><div className="admin-filters">{["all", "available", "activated", "disabled"].map((item) => <button className={status === item ? "active" : ""} key={item} onClick={() => setStatus(item)} type="button">{item}</button>)}</div><select aria-label="Filter by society" onChange={(event) => setSociety(event.target.value)} value={society}><option value="all">All societies</option>{societies.map((item) => <option key={item} value={item}>{item}</option>)}</select></div><div className="admin-table"><div className="admin-table-head"><span>Tag ID</span><span>Society</span><span>Status</span><span>Vehicle</span></div>{filtered.map((tag) => <button className={`admin-row ${selected?.id === tag.id ? "selected" : ""}`} key={tag.id} onClick={() => selectTag(tag)} type="button"><strong>{tag.code}</strong><span>{tag.societyName || "Unassigned"}</span><span className={`tag-status ${tag.status}`}>{tag.status}</span><span>{tag.vehicle?.number || "Unassigned"}</span></button>)}{filtered.length === 0 ? <p className="admin-empty">No tags match this view.</p> : null}</div></div>{selected ? <aside className="admin-detail"><div className="detail-top"><span className={`tag-status ${selected.status}`}>{selected.status}</span><span className="section-kicker">Tag details</span></div><label className="field"><span>Society inventory</span><input onChange={(event) => setSocietyName(event.target.value)} placeholder="Greenview Residency" value={societyName} /><small>Assign this printed tag to a society batch.</small></label><button className="btn" disabled={saving || setupRequired} onClick={saveSociety} type="button">{saving ? "Saving..." : "Save society"}</button><div className="print-tag"><div className="print-tag-brand"><span className="brand-mark">P</span><strong>PingTag</strong><span>PRIVACY-FIRST PARKING</span></div>{selected.societyName ? <div className="print-tag-society">For residents of {selected.societyName}</div> : null}<div className="print-tag-copy"><span className="print-tag-kicker">Scan to reach the owner</span><h2>{selected.vehicle?.number || "Your vehicle"}</h2><p>Send an anonymous alert without exposing their phone number.</p></div><img className="admin-qr" alt={`QR code for ${selected.code}`} src={selected.qrDataUrl} /><div className="print-tag-footer"><strong>Scan. Send. Stay private.</strong><span>{selected.code}</span></div></div><div className="admin-detail-actions"><button className="btn secondary" onClick={() => window.print()} type="button">Print premium tag</button><a className="admin-scan-link" href={selected.scanUrl} target="_blank" rel="noreferrer">Open scanner ↗</a></div>{selected.vehicle ? <dl><div><dt>Vehicle</dt><dd>{selected.vehicle.number}</dd></div><div><dt>Owner account</dt><dd>{selected.vehicle.ownerPhone || "Not available"}</dd></div><div><dt>Private phone</dt><dd>{selected.vehicle.phoneNumber}</dd></div><div><dt>Location</dt><dd>{[selected.vehicle.societyName || selected.societyName, selected.vehicle.flatNumber].filter(Boolean).join(" · ") || "Not provided"}</dd></div></dl> : <div className="detail-empty"><strong>Ready for dispatch</strong><span>{selected.societyName ? `${selected.societyName} inventory` : "This tag has not been assigned to a society."}</span></div>}</aside> : null}</section></main>;
}
