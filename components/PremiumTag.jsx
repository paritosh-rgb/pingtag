export default function PremiumTag({
  code,
  qrDataUrl,
  vehicleNumber,
  societyName,
  societyBrandName,
  flatNumber,
  className = "",
}) {
  const location = [flatNumber].filter(Boolean).join(" · ");

  return (
    <div className={`premium-tag ${className}`.trim()} data-print-size="90 × 60 mm">
      <section className="premium-tag-ink">
        <div className="premium-tag-brand">
          <span className="premium-tag-symbol">P</span>
          <span><strong>ParkPing</strong><small>BY GETPING</small></span>
        </div>
        <div className="premium-tag-message">
          <small>PRIVATE PARKING CONTACT</small>
          <h3>Blocked?<br />Let&apos;s solve it<br /><em>privately.</em></h3>
          <p>No calls. No number on display.</p>
        </div>
        <div className="premium-tag-steps" aria-label="Scan, message, move on">
          <span><b>01</b>SCAN</span><i /><span><b>02</b>MESSAGE</span><i /><span><b>03</b>MOVE ON</span>
        </div>
      </section>

      <section className="premium-tag-paper">
        {societyBrandName ? <div className="premium-tag-society-brand"><small>RESIDENT EDITION</small><strong>{societyBrandName}</strong></div> : <p className="premium-tag-kindness">A small ping can fix a big inconvenience.</p>}
        <div className="premium-tag-qr-frame">
          <img alt={`ParkPing QR code for ${code}`} src={qrDataUrl} />
        </div>
        <strong className="premium-tag-cta">SCAN TO MESSAGE THE OWNER</strong>
        <div className="premium-tag-details">
          <span>TAG ID</span>
          <b>{code}</b>
          <small>{vehicleNumber || "YOUR VEHICLE"}{location ? ` · ${location}` : ""}{societyName && societyName !== societyBrandName ? ` · ${societyName}` : ""}</small>
        </div>
      </section>

      <footer className="premium-tag-footer">
        <strong>PRIVACY BY DEFAULT</strong>
        <span>NO PHONE NUMBER SHARED</span>
      </footer>
    </div>
  );
}
