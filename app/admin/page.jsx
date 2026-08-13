import Link from "next/link";
import AdminConsole from "@/components/AdminConsole";

export default function AdminPage() {
  return <main className="app-shell"><nav className="topbar"><Link className="brand" href="/"><span className="brand-mark">P</span><span className="brand-stack"><strong>ParkPing</strong><small>by PING</small></span></Link><div className="top-actions"><Link className="nav-pill" href="/dashboard">Dashboard</Link><Link className="nav-pill" href="/">Home</Link></div></nav><AdminConsole /></main>;
}
