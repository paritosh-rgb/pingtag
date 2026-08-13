import Link from "next/link";
import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return <main className="app-shell auth-shell"><nav className="topbar"><Link className="brand" href="/"><span className="brand-mark">P</span><span className="brand-stack"><strong>ParkPing</strong><small>by PING</small></span></Link><Link className="nav-pill" href="/">Back to home</Link></nav><div className="auth-layout"><div className="auth-intro"><div className="hero-kicker"><span className="live-dot" /> ParkPing by PING</div><h1>Your car,<br /><em>your privacy.</em></h1><p>Sign up once, enter your vehicle number, and get a free digital ParkPing tag ready to try.</p><div className="auth-note"><span>↗</span><div><strong>14-day free trial</strong><small>Share the tag without putting your phone number on the glass.</small></div></div></div><AuthForm /></div></main>;
}
