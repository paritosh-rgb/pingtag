"use client";

import { useEffect, useState } from "react";

const moments = [
  ["Lights still on", "2 min ago"],
  ["Blocked driveway", "now"],
  ["Window left open", "4 min ago"],
  ["Parking sorted", "now"],
];

export default function NeighborhoodPulse() {
  const [resolved, setResolved] = useState(3);
  const [momentIndex, setMomentIndex] = useState(1);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setResolved((value) => value + 1);
      setMomentIndex((value) => (value + 1) % moments.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="neighborhood-pulse" id="pulse">
      <div className="pulse-copy">
        <p className="eyebrow">The neighborhood pulse</p>
        <h2>Good parking<br /><em>travels fast.</em></h2>
        <p>ParkPing turns small parking moments into quick, private fixes. No names. No numbers. Just a calmer neighborhood.</p>
        <div className="pulse-stat"><strong>{resolved}</strong><span>anonymous pings<br />resolved nearby</span></div>
        <small className="pulse-disclaimer">Illustrative live demo · signals are anonymized by design</small>
      </div>
      <div className="pulse-map" aria-label="Illustrative anonymous neighborhood activity map">
        <div className="map-grid" />
        <div className="map-road road-a" /><div className="map-road road-b" /><div className="map-road road-c" />
        <span className="pulse-dot dot-a" /><span className="pulse-dot dot-b" /><span className="pulse-dot dot-c" /><span className="pulse-dot dot-d" /><span className="pulse-dot dot-e" />
        <div className="pulse-toast"><span className="pulse-toast-icon">✓</span><div><small>ParkPing pulse · {moments[momentIndex][1]}</small><strong>{moments[momentIndex][0]}</strong></div></div>
        <span className="pulse-map-label label-top">NO ADDRESSES</span><span className="pulse-map-label label-bottom">JUST BETTER NEIGHBORS</span>
      </div>
    </section>
  );
}
