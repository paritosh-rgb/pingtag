import Link from "next/link";
import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return <main className="app-shell auth-shell"><nav className="topbar"><Link className="brand" href="/"><span className="brand-mark">P</span><span>PingTag</span></Link><Link className="nav-pill" href="/">Back to home</Link></nav><div className="auth-layout"><div className="auth-intro"><div className="hero-kicker"><span className="live-dot" /> Owner access</div><h1>Your car,<br /><em>your privacy.</em></h1><p>Sign up once, place the tag, and stay reachable without printing your phone number for everyone to see.</p><div className="auth-note"><span>↗</span><div><strong>Built for real parking moments</strong><small>Blocked driveway, lights left on, window open.</small></div></div></div><AuthForm /></div></main>;
}
