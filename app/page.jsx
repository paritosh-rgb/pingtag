import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import ScanDemo from "@/components/ScanDemo";
import NeighborhoodPulse from "@/components/NeighborhoodPulse";
import OwnerPreview from "@/components/OwnerPreview";

const fallbackDemoTag = {
  code: "PARKPING-DEMO",
  vehicleNumber: "MH 12 AB 1234",
  societyName: "Demo Heights",
  flatNumber: "A-1204",
  scanUrl: "https://pingtag.vercel.app/tag/PARKPING-DEMO",
  qrDataUrl: "",
};

async function getDemoTag() {
  const supabase = getSupabaseAdmin();
  if (!supabase) return fallbackDemoTag;
  const { data } = await supabase
    .from("vehicles")
    .select("vehicle_number,society_name,flat_number,qr_token,scan_url,qr_data_url")
    .eq("qr_token", "PARKPING-DEMO")
    .single();
  if (!data) return fallbackDemoTag;
  return {
    code: data.qr_token,
    vehicleNumber: data.vehicle_number,
    societyName: data.society_name || "Demo Heights",
    flatNumber: data.flat_number || "A-1204",
    scanUrl: data.scan_url,
    qrDataUrl: data.qr_data_url,
  };
}

function ParentLanding() {
  return (
    <main className="parent-shell">
      <nav className="parent-nav">
        <Link className="parent-brand" href="/"><span className="parent-mark">G</span><span><strong>GetPing</strong><small>EVERYDAY OBJECTS, MORE HUMAN</small></span></Link>
        <div className="parent-nav-links"><Link className="active" href="/?product=parkping">ParkPing</Link><Link href="/?product=petping">PetPing</Link><Link href="/?product=bagping">BagPing</Link><a href="#mission">Our mission</a></div>
        <Link className="parent-nav-cta" href="/?product=parkping">Try ParkPing <span>↗</span></Link>
      </nav>

      <section className="parent-hero">
        <div className="parent-orbit orbit-a" /><div className="parent-orbit orbit-b" />
        <div className="parent-hero-copy"><p className="parent-eyebrow"><span /> GETPING / PRODUCT STUDIO</p><h1>Small tags.<br /><em>Better moments.</em></h1><p className="parent-lead">We make everyday objects a little more thoughtful. A private way to reach the right person, exactly when it matters.</p><div className="parent-hero-actions"><a className="parent-button" href="#products">Explore products <span>↓</span></a><a className="parent-text-link" href="#mission">Why GetPing exists ↗</a></div></div>
        <div className="parent-hero-object" aria-label="A PING product pass"><div className="parent-pass"><div className="parent-pass-ink"><div className="parent-pass-word"><span>⌁</span><strong>PING</strong></div><small>ONE TAP. THE RIGHT PERSON.</small><p>THE SMALL<br />MOMENTS<br /><em>MATTER.</em></p><div className="parent-pass-steps"><span><b>01</b> FIND</span><span><b>02</b> PING</span><span><b>03</b> SOLVE</span></div></div><div className="parent-pass-paper"><p>Useful things deserve<br /><em>a kinder connection.</em></p><Link className="parent-pass-qr" href="/?product=parkping" aria-label="Explore ParkPing"><i /><i /><i /><i /><i /><i /><i /><i /><i /></Link><span className="parent-pass-scan">SCAN TO EXPLORE <b>PING</b></span><div className="parent-pass-id"><span>PRODUCT FAMILY</span><strong>PING / 001</strong></div></div><div className="parent-pass-footer"><span>✦ Designed for real life.</span><small>Private by default.</small></div></div><div className="parent-float-note"><span>↗</span><div><small>ONE SIMPLE PING</small><strong>Connection, without the noise.</strong></div></div></div>
      </section>

      <div className="parent-proof-strip"><span>PRIVATE BY DEFAULT</span><i /> <span>ONE TAP, RIGHT PERSON</span><i /> <span>BUILT FOR REAL LIFE</span><p>Small things, thoughtfully connected.</p></div>

      <section className="parent-intro" id="mission"><p className="parent-eyebrow">01 / OUR POINT OF VIEW</p><div><h2>Technology should<br /><em>lower the temperature.</em></h2><p>Not every moment needs a phone call, a public announcement, or another app shouting for attention. GetPing builds quiet interfaces between people and the things they share.</p></div></section>

      <section className="parent-products" id="products"><div className="parent-section-head"><div><p className="parent-eyebrow">02 / THE PING FAMILY</p><h2>One idea.<br /><em>Many places.</em></h2></div><p>Three products for the small moments where a little context can make a big difference.</p></div><div className="product-grid"><Link className="product-card product-card-park" href="/?product=parkping"><div className="product-card-top"><span>01 / LIVE</span><b>↗</b></div><div className="product-art park-art"><span className="art-bolt">⌁</span><strong>PING</strong><div className="art-qr" /><i>SCAN. PING. MOVE ON.</i></div><div className="product-card-copy"><h3>ParkPing</h3><p>A discreet way to reach a parked car owner without sharing a phone number.</p><span>Explore ParkPing ↗</span></div></Link><article className="product-card product-card-pet"><div className="product-card-top"><span>02 / SOON</span><b>✦</b></div><div className="product-art pet-art"><span className="pet-orbit" /><strong>pet<br /><em>ping</em></strong><span className="pet-tag">A gentle tap<br />for every wag.</span></div><div className="product-card-copy"><h3>PetPing <small>Coming soon</small></h3><p>A tiny, thoughtful way to help a wandering pet find their way home.</p><span>Join the early list ↗</span></div></article><article className="product-card product-card-bag"><div className="product-card-top"><span>03 / SOON</span><b>✦</b></div><div className="product-art bag-art"><div className="bag-loop" /><strong>bag<span>ping</span></strong><span className="bag-copy">Find it.<br />Return it.</span></div><div className="product-card-copy"><h3>BagPing <small>Coming soon</small></h3><p>A private return path for the bags, keys, and things you carry every day.</p><span>Join the early list ↗</span></div></article></div></section>

      <section className="parent-footer"><p className="parent-eyebrow">GETPING / MADE WITH CARE</p><h2>Make the ordinary<br /><em>feel considered.</em></h2><p>ParkPing is live today. PetPing and BagPing are on their way.</p><Link className="parent-button" href="/?product=parkping">Visit ParkPing <span>↗</span></Link><small>© 2026 GetPing. Quietly useful by design.</small></section>
    </main>
  );
}

function ComingSoon({ product }) {
  return <main className="coming-shell"><nav className="parent-nav"><Link className="parent-brand" href="/"><span className="parent-mark">P</span><span><strong>PING</strong><small>EVERYDAY OBJECTS, MORE HUMAN</small></span></Link><div className="parent-nav-links"><Link href="/?product=parkping">ParkPing</Link><Link href="/?product=petping">PetPing</Link><Link href="/?product=bagping">BagPing</Link></div><Link className="parent-nav-cta" href="/">Back to PING <span>↗</span></Link></nav><section className="coming-content"><p className="parent-eyebrow"><span /> PING / PRODUCT STUDIO</p><div className={`coming-icon ${product.toLowerCase()}`}>{product === "PetPing" ? "✦" : "⌁"}</div><h1>{product}<br /><em>is on its way.</em></h1><p>We’re making this one thoughtful too. Leave your email with the PING team and we’ll let you know when it’s ready.</p><a className="parent-button" href={`mailto:hello@pingtag.in?subject=Early access for ${product}`}>Join the early list <span>↗</span></a><Link className="coming-back" href="/">← Explore the PING family</Link></section></main>;
}

export default async function Home({ searchParams }) {
  const params = await searchParams;
  if (params?.product === "petping") return <ComingSoon product="PetPing" />;
  if (params?.product === "bagping") return <ComingSoon product="BagPing" />;
  if (params?.product !== "parkping") return <ParentLanding />;
  const demoTag = await getDemoTag();
  return (
    <main className="app-shell">
      <nav className="topbar">
        <Link className="brand" href="/"><span className="brand-mark">P</span><span className="brand-stack"><strong>ParkPing</strong><small>by PING</small></span></Link>
        <div className="top-actions">
          <Link className="nav-pill nav-subtle" href="/login?mode=login">Login</Link>
          <Link className="nav-pill nav-primary" href="/login">Sign up</Link>
          <Link className="nav-pill" href="/">PING products</Link>
          <a className="nav-pill" href="#workflow">How it works</a>
        </div>
      </nav>

      <section className="hero-band">
        <div className="hero-copy">
          <div className="hero-kicker"><span className="live-dot" /> Privacy-first car contact</div>
          <h1>Let your car<br /><em>answer back.</em></h1>
          <p className="lead">A discreet QR sticker for the moments your parked car needs you. Get the message without putting your phone number on the glass.</p>
          <div className="hero-actions"><Link className="btn hero-btn" href="/login?trial=1">Get your free trial tag <span>↗</span></Link><a className="text-link" href="#workflow">See how it works <span>↓</span></a></div>
          <div className="hero-proof"><div className="proof-item"><span>01</span><p>Private by design<br /><strong>No number on display.</strong></p></div><div className="proof-item"><span>02</span><p>Made for parking<br /><strong>Society-ready details.</strong></p></div></div>
        </div>
        <div className="hero-object" aria-label="Sample ParkPing windshield tag preview">
          <div className="hero-glow" />
          <div className="sticker-card sample-tag tag-art">
            <div className="tag-art-dark">
              <div className="tag-art-brand"><span className="tag-art-signal">⌁</span><strong>ParkPing</strong></div>
              <div className="tag-art-subbrand">by GetPing</div>
              <p className="tag-art-headline">BLOCKED YOU<br />BY MISTAKE?</p>
              <p className="tag-art-solution">LET’S SOLVE IT<br /><em>PRIVATELY.</em></p>
              <div className="tag-art-rule" />
              <div className="tag-art-steps"><span><b>01</b> SCAN</span><span><b>02</b> CONNECT</span><span><b>03</b> MOVE ON</span></div>
            </div>
            <div className="tag-art-light">
              <div className="tag-art-note">We all make mistakes.<br /><em>Kindness fixes it.</em> <span>♡</span></div>
              <div className="sticker-qr sample-real-qr">{demoTag.qrDataUrl ? <img src={demoTag.qrDataUrl} alt={`QR code for ${demoTag.vehicleNumber}`} /> : <div className="qr-pattern"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>}</div>
              <a className="tag-art-scan" href={demoTag.scanUrl} target="_blank" rel="noreferrer"><span>⌁</span> SCAN TO <b>GETPING</b></a>
              <div className="tag-art-meta"><span>TAG ID</span><strong>{demoTag.code}</strong><small>{demoTag.vehicleNumber} · {demoTag.flatNumber}</small></div>
            </div>
            <div className="tag-art-footer"><span>🔒 No phone number shared.</span><small>Privacy by default.</small></div>
          </div>
          <div className="hero-caption"><span className="caption-line" /> <span>Sample windshield tag / 001</span></div>
          <div className="hero-ping-card"><span className="ping-card-icon">↗</span><div><small>ParkPing alert</small><strong>Hi, your car is blocking mine.</strong></div><time>now</time></div>
        </div>
      </section>

      <section className="signal-strip" aria-label="ParkPing benefits">
        <p>Built for real parking moments</p>
        <span>NO PHONE NUMBER ON DISPLAY</span><i />
        <span>SCAN. PING. MOVE ON.</span><i />
        <span>PRIVATE BY DEFAULT</span>
      </section>

      <ScanDemo vehicleNumber={demoTag.vehicleNumber} societyName={demoTag.societyName} qrDataUrl={demoTag.qrDataUrl} code={demoTag.code} />

      <NeighborhoodPulse />

      <OwnerPreview />

      <section className="workflow-band" id="workflow">
        <div className="workflow-heading"><div><p className="eyebrow">How PingTag works</p><h2>Reach the right car.<br /><em>Keep your number.</em></h2></div><p className="workflow-summary">Three small steps turn an awkward parking moment into a private, useful exchange.</p></div>
        <div className="workflow-track">
          <div className="workflow-step"><div className="step-mark">01</div><div className="step-visual sticker-mini"><span className="brand-mini">P</span><div className="mini-qr"><i /><i /><i /><i /></div></div><strong>Make your tag</strong><p>Add your vehicle and optional society details.</p></div>
          <div className="track-line"><span>→</span></div>
          <div className="workflow-step"><div className="step-mark">02</div><div className="step-visual scan-mini"><span className="scan-corner tl" /><span className="scan-corner tr" /><span className="scan-corner bl" /><span className="scan-corner br" /><div className="scan-beam" /></div><strong>Someone scans</strong><p>They see only what helps identify the car.</p></div>
          <div className="track-line"><span>→</span></div>
          <div className="workflow-step"><div className="step-mark">03</div><div className="step-visual ping-mini"><span className="ping-dot" /><div><b>New Ping</b><small>Lights are still on</small></div><span className="ping-time">now</span></div><strong>You get the ping</strong><p>Reply to the moment without exposing your phone.</p></div>
        </div>
        <div className="workflow-footer"><span><i className="privacy-check">✓</i> No phone number printed</span><span><i className="privacy-check">✓</i> No login for scanners</span><Link className="btn" href="/login?trial=1">Get free trial <span>↗</span></Link></div>
      </section>

      <section className="moments-band">
        <div className="moments-heading">
          <p className="eyebrow">Small tag. Big relief.</p>
          <h2>Because “whose car is this?”<br />shouldn’t become a <em>parking crisis.</em></h2>
        </div>
        <div className="moments-grid">
          <article className="moment-card moment-card--coral"><span className="moment-number">01 / ACCESS</span><div className="moment-icon">⌁</div><h3>Blocked in?</h3><p>A quick scan gives you a private way to reach the owner—no shouting across the parking lot.</p><span className="moment-tag">“Could you move your car?”</span></article>
          <article className="moment-card moment-card--paper"><span className="moment-number">02 / CARE</span><div className="moment-icon">☼</div><h3>Lights still on?</h3><p>Let a thoughtful passer-by help before a small oversight becomes a dead battery.</p><span className="moment-tag">“Your headlights are on.”</span></article>
          <article className="moment-card moment-card--teal"><span className="moment-number">03 / PEACE</span><div className="moment-icon">✓</div><h3>Parking, handled.</h3><p>Your mobile number stays yours. The person who needs you gets a simple way to ping you.</p><span className="moment-tag">Private contact, always.</span></article>
        </div>
      </section>

      <section className="closing-band">
        <div className="closing-orbit orbit-one" /><div className="closing-orbit orbit-two" />
        <p className="eyebrow">Your car has a voice now</p>
        <h2>Park with less<br /><em>to worry about.</em></h2>
        <p>Set up your ParkPing tag in minutes. Your phone number never has to leave your pocket.</p>
        <div className="closing-actions"><Link className="btn hero-btn" href="/login?trial=1">Start with a free tag <span>↗</span></Link><Link href="/login?mode=login">I already have a tag</Link></div>
      </section>
    </main>
  );
}
