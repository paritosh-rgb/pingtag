import Link from "next/link";
import AuthForm from "@/components/AuthForm";

export default function AdminLoginPage() {
  return <main className="app-shell auth-shell"><nav className="topbar"><Link className="brand" href="/"><span className="brand-mark">P</span><span className="brand-stack"><strong>ParkPing</strong><small>by PING</small></span></Link><Link className="nav-pill" href="/login">Owner login</Link></nav><div className="auth-layout"><div className="auth-intro"><div className="hero-kicker"><span className="live-dot" /> ParkPing by PING</div><h1>Run ParkPing<br /><em>with control.</em></h1><p>Manage printed tags, activations, and vehicle associations from one private workspace.</p><div className="auth-note"><span>↗</span><div><strong>Restricted workspace</strong><small>Only the dedicated admin account can enter.</small></div></div></div><AuthForm admin /></div></main>;
}
