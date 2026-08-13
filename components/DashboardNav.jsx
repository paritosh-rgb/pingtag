"use client";

import Link from "next/link";

export default function DashboardNav() {
  async function logout() {
    await fetch("/api/auth/session", { method: "DELETE" });
    await fetch("/api/auth/local", { method: "DELETE" });
    window.location.href = "/";
  }

  return <nav className="topbar"><Link className="brand" href="/"><span className="brand-mark">P</span><span>PingTag</span></Link><div className="top-actions"><Link className="nav-pill" href="/">Home</Link><button className="nav-pill" onClick={logout} type="button">Log out</button></div></nav>;
}
