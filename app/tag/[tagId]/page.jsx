import { notFound } from "next/navigation";
import ScanForm from "@/components/ScanForm";
import { findPrintedTag, findVehicleByToken } from "@/lib/vehicles";

export default async function TagPage({ params }) {
  const { tagId } = await params;
  const vehicle = await findVehicleByToken(tagId);

  if (vehicle?.trialExpired) {
    return <main className="scan-shell"><a className="brand" href="/"><span className="brand-mark">P</span><span>PingTag</span></a><section className="scan-card"><span className="badge">Trial expired</span><div className="vehicle"><h1 style={{ fontSize: "2.2rem", lineHeight: 1.05 }}>This trial tag has ended</h1><p>The owner’s free PingTag trial has expired. A premium physical tag can keep this vehicle reachable.</p><span className="mono">{vehicle.vehicleNumber}</span></div><a className="btn" href="/">Learn about PingTag <span>↗</span></a></section></main>;
  }

  if (!vehicle) {
    const printedTag = await findPrintedTag(tagId);
    if (!printedTag) notFound();
    return <main className="scan-shell"><a className="brand" href="/"><span className="brand-mark">P</span><span>PingTag</span></a><section className="scan-card"><span className="badge">Tag not activated</span><div className="vehicle"><h1 style={{ fontSize: "2.2rem", lineHeight: 1.05 }}>This tag is waiting for its owner</h1><p>This PingTag sticker has not been activated yet. If this is your vehicle, sign in to activate the tag using the ID printed below the QR code.</p><span className="mono">{printedTag.code}</span></div><a className="btn" href="/login">Owner login <span>↗</span></a></section></main>;
  }

  return (
    <main className="scan-shell">
      <a className="brand" href="/">
        <span className="brand-mark">P</span>
        <span>PingTag</span>
      </a>

      <section className="scan-card">
        <span className="badge">Anonymous car alert</span>
        <div className="vehicle">
          <h1 style={{ fontSize: "2.2rem", lineHeight: 1.05 }}>Contact the owner</h1>
          <p>
            This message goes to the owner without revealing their phone number.
            Only send urgent or useful information about the parked car.
          </p>
          <span className="mono">{vehicle.vehicleNumber}{[vehicle.societyName, vehicle.flatNumber].filter(Boolean).length ? ` · ${[vehicle.societyName, vehicle.flatNumber].filter(Boolean).join(" · ")}` : ""}</span>
        </div>

        <ScanForm tagId={vehicle.id} token={vehicle.qrToken} />
      </section>
    </main>
  );
}
