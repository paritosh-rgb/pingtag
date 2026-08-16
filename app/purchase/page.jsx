import Link from "next/link";

export const metadata = { title: "Order ParkPing | GetPing" };

export default function PurchasePage() {
  return (
    <main className="purchase-shell">
      <nav className="purchase-nav">
        <Link className="purchase-brand" href="/?product=parkping"><span>P</span><b>ParkPing</b><small>by GetPing</small></Link>
        <div><span className="purchase-secure">⌁ Private checkout</span><Link href="/?product=parkping">← Back to ParkPing</Link></div>
      </nav>

      <section className="purchase-layout">
        <div className="purchase-copy">
          <p className="purchase-eyebrow"><i /> PARKPING / PHYSICAL TAG</p>
          <h1>Make parking<br /><em>more human.</em></h1>
          <p className="purchase-lead">One weatherproof QR tag gives your car a private way to receive the message—without putting your phone number on display.</p>
          <div className="purchase-points"><span>✓ Waterproof, windshield-ready finish</span><span>✓ Private message flow, no number printed</span><span>✓ Activate in under two minutes</span></div>
          <p className="purchase-note">Your tag arrives inactive, so only you can connect it to your vehicle.</p>
        </div>

        <aside className="purchase-card">
          <div className="purchase-card-head"><span>YOUR ORDER</span><small>01 / 01</small></div>
          <div className="purchase-product">
            <div className="purchase-tag-art"><div><b>⌁</b><strong>ParkPing</strong><small>by GetPing</small><p>BLOCKED YOU<br />BY MISTAKE?</p></div><i /><em>SCAN TO MESSAGE<br />PRIVATELY</em></div>
            <div><h2>ParkPing physical tag</h2><p>One premium windshield QR tag</p><strong>₹299</strong></div>
          </div>
          <div className="purchase-line" />
          <div className="purchase-row"><span>Tag</span><b>₹299</b></div>
          <div className="purchase-row"><span>Standard shipping</span><b className="purchase-free">Free</b></div>
          <div className="purchase-total"><span>Total</span><strong>₹299 <small>incl. taxes</small></strong></div>
          <form className="purchase-form">
            <label>Delivery details</label>
            <div className="purchase-fields"><input aria-label="Full name" placeholder="Full name" /><input aria-label="Mobile number" inputMode="tel" placeholder="Mobile number" /><textarea aria-label="Shipping address" placeholder="Shipping address" rows="3" /></div>
            <button type="button" className="purchase-button">Continue to payment <span>↗</span></button>
          </form>
          <p className="purchase-payment-note">Secure UPI, card and net-banking checkout will appear in the next step.</p>
        </aside>
      </section>

      <footer className="purchase-footer"><span>PRIVATE BY DEFAULT</span><i /> <span>NO PHONE NUMBER ON DISPLAY</span><i /> <span>MADE FOR REAL PARKING</span></footer>
    </main>
  );
}
