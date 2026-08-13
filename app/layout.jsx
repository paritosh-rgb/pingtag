import "./globals.css";

export const metadata = {
  title: "PingTag",
  description: "Anonymous QR alerts for parked cars.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
