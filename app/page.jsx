import Link from "next/link";

export default function Home() {
  return (
    <main className="app-shell">
      <nav className="topbar">
        <div className="brand">
          <span className="brand-mark">P</span>
          <span>PingTag</span>
        </div>
        <div className="top-actions">
          <Link className="nav-pill nav-subtle" href="/login?mode=login">Login</Link>
          <Link className="nav-pill nav-primary" href="/login">Sign up</Link>
          <a className="nav-pill" href="#workflow">How it works</a>
        </div>
      </nav>

      <section className="hero-band">
        <div className="hero-copy">
          <div className="hero-kicker"><span className="live-dot" /> Privacy-first car contact</div>
          <h1>Let your car<br /><em>answer back.</em></h1>
          <p className="lead">A discreet QR sticker for the moments your parked car needs you. Get the message without putting your phone number on the glass.</p>
          <div className="hero-actions"><Link className="btn hero-btn" href="/login">Sign up <span>↗</span></Link><a className="text-link" href="#workflow">See how it works <span>↓</span></a></div>
          <div className="hero-proof"><div className="proof-item"><span>01</span><p>Private by design<br /><strong>No number on display.</strong></p></div><div className="proof-item"><span>02</span><p>Made for parking<br /><strong>Society-ready details.</strong></p></div></div>
        </div>
        <div className="hero-object" aria-label="PingTag QR sticker preview">
          <div className="hero-glow" />
          <div className="sticker-card"><div className="sticker-top"><span className="brand-mini">P</span><span>PingTag</span><span className="sticker-live">● LIVE</span></div><div className="sticker-qr"><div className="qr-pattern"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div></div><strong>Scan to contact owner</strong><small>Without revealing their number</small></div>
          <div className="hero-caption"><span className="caption-line" /> <span>Windshield tag / 001</span></div>
        </div>
      </section>

      <section className="workflow-band" id="workflow">
        <div className="workflow-heading"><div><p className="eyebrow">How PingTag works</p><h2>Reach the right car.<br /><em>Keep your number.</em></h2></div><p className="workflow-summary">Three small steps turn an awkward parking moment into a private, useful exchange.</p></div>
        <div className="workflow-track">
          <div className="workflow-step"><div className="step-mark">01</div><div className="step-visual sticker-mini"><span className="brand-mini">P</span><div className="mini-qr"><i /><i /><i /><i /></div></div><strong>Make your tag</strong><p>Add your vehicle and optional society details.</p></div>
          <div className="track-line"><span>→</span></div>
          <div className="workflow-step"><div className="step-mark">02</div><div className="step-visual scan-mini"><span className="scan-corner tl" /><span className="scan-corner tr" /><span className="scan-corner bl" /><span className="scan-corner br" /><div className="scan-beam" /></div><strong>Someone scans</strong><p>They see only what helps identify the car.</p></div>
          <div className="track-line"><span>→</span></div>
          <div className="workflow-step"><div className="step-mark">03</div><div className="step-visual ping-mini"><span className="ping-dot" /><div><b>New Ping</b><small>Lights are still on</small></div><span className="ping-time">now</span></div><strong>You get the ping</strong><p>Reply to the moment without exposing your phone.</p></div>
        </div>
        <div className="workflow-footer"><span><i className="privacy-check">✓</i> No phone number printed</span><span><i className="privacy-check">✓</i> No login for scanners</span><Link className="btn" href="/login">Sign up <span>↗</span></Link></div>
      </section>
    </main>
  );
}
