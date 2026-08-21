const WIDTH_MM = 90;
const HEIGHT_MM = 60;

const COLORS = {
  ink: [17, 26, 28],
  paper: [255, 253, 248],
  gold: [248, 197, 20],
  muted: [103, 111, 108],
  softInk: [196, 205, 201],
};

function safeFileName(value) {
  return String(value || "parkping-tag").replace(/[^a-z0-9_-]+/gi, "-").replace(/^-|-$/g, "");
}

export async function createTagPdf({ code, qrDataUrl, vehicleNumber, societyName, societyBrandName, flatNumber }) {
  if (!qrDataUrl) throw new Error("QR artwork is not ready yet.");
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: [HEIGHT_MM, WIDTH_MM], compress: true });
  const splitX = 36;
  const footerY = 53.5;

  pdf.setProperties({
    title: `${code} ParkPing tag`,
    subject: "90 x 60 mm print-ready ParkPing QR tag",
    creator: "ParkPing by GetPing",
  });

  pdf.setFillColor(...COLORS.ink);
  pdf.rect(0, 0, splitX, HEIGHT_MM, "F");
  pdf.setFillColor(...COLORS.paper);
  pdf.rect(splitX, 0, WIDTH_MM - splitX, HEIGHT_MM, "F");

  pdf.setFillColor(...COLORS.gold);
  pdf.roundedRect(4, 4, 7, 7, 1.6, 1.6, "F");
  pdf.setTextColor(...COLORS.ink);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(13);
  pdf.text("P", 7.5, 9.2, { align: "center" });
  pdf.setTextColor(...COLORS.paper);
  pdf.setFontSize(12);
  pdf.text("ParkPing", 13, 7.2);
  pdf.setTextColor(...COLORS.softInk);
  pdf.setFontSize(4.5);
  pdf.text("BY GETPING", 13, 9.8);

  pdf.setTextColor(...COLORS.gold);
  pdf.setFontSize(4.4);
  pdf.text("PRIVATE PARKING CONTACT", 4, 20);
  pdf.setTextColor(...COLORS.paper);
  pdf.setFontSize(13.5);
  pdf.setFont("helvetica", "bold");
  pdf.text("Blocked?", 4, 27);
  pdf.text("Let's solve it", 4, 33);
  pdf.setTextColor(...COLORS.gold);
  pdf.text("privately.", 4, 39);
  pdf.setTextColor(...COLORS.softInk);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(5.2);
  pdf.text("No calls. No number on display.", 4, 43.5);

  const stepLabels = [["01", "SCAN", 4], ["02", "MESSAGE", 14.6], ["03", "MOVE ON", 26]];
  stepLabels.forEach(([number, label, x]) => {
    pdf.setTextColor(...COLORS.gold);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(4.2);
    pdf.text(number, x, 48.1);
    pdf.setTextColor(...COLORS.paper);
    pdf.setFontSize(3.7);
    pdf.text(label, x, 51);
  });

  const societyLabel = String(societyBrandName || "").trim().slice(0, 34);
  if (societyLabel) {
    pdf.setTextColor(...COLORS.gold);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(3.8);
    pdf.text("RESIDENT EDITION", 63, 4.1, { align: "center" });
    pdf.setTextColor(...COLORS.ink);
    pdf.setFontSize(societyLabel.length > 24 ? 5 : 5.8);
    pdf.text(societyLabel, 63, 7, { align: "center" });
  } else {
    pdf.setTextColor(...COLORS.ink);
    pdf.setFont("times", "italic");
    pdf.setFontSize(6.4);
    pdf.text("A small ping can fix a big inconvenience.", 63, 6.2, { align: "center" });
  }

  pdf.setFillColor(...COLORS.ink);
  pdf.roundedRect(51.5, 8.5, 29, 29, 2.8, 2.8, "F");
  pdf.setFillColor(255, 255, 255);
  pdf.roundedRect(53, 10, 26, 26, 1.4, 1.4, "F");
  pdf.addImage(qrDataUrl, "PNG", 54, 11, 24, 24, undefined, "FAST");

  pdf.setFillColor(...COLORS.ink);
  pdf.roundedRect(50, 39, 32, 5.8, 2.9, 2.9, "F");
  pdf.setTextColor(...COLORS.paper);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(4.6);
  pdf.text("SCAN TO MESSAGE THE OWNER", 66, 42.6, { align: "center" });

  const location = [flatNumber, societyName && societyName !== societyBrandName ? societyName : ""].filter(Boolean).join(" · ");
  pdf.setTextColor(...COLORS.muted);
  pdf.setFontSize(3.7);
  pdf.text("TAG ID", 42, 47.5);
  pdf.setTextColor(...COLORS.ink);
  pdf.setFont("courier", "bold");
  pdf.setFontSize(6.2);
  pdf.text(String(code || "PARKPING"), 42, 50.7);
  pdf.setTextColor(...COLORS.muted);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(3.8);
  const identity = [vehicleNumber || "YOUR VEHICLE", location].filter(Boolean).join(" · ");
  pdf.text(identity.slice(0, 56), 88, 50.7, { align: "right" });

  pdf.setFillColor(...COLORS.gold);
  pdf.rect(0, footerY, WIDTH_MM, HEIGHT_MM - footerY, "F");
  pdf.setTextColor(...COLORS.ink);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(4.4);
  pdf.text("PRIVACY BY DEFAULT", 4, 57.6);
  pdf.setFontSize(3.9);
  pdf.text("NO PHONE NUMBER SHARED", 86, 57.6, { align: "right" });

  pdf.setDrawColor(...COLORS.gold);
  pdf.setLineWidth(1.2);
  pdf.roundedRect(0.6, 0.6, WIDTH_MM - 1.2, HEIGHT_MM - 1.2, 2.8, 2.8, "S");
  return pdf;
}

export async function downloadTagPdf(tag) {
  const pdf = await createTagPdf(tag);
  pdf.save(`${safeFileName(tag.code)}-parkping-90x60mm.pdf`);
}
