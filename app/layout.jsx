import "./globals.css";

export const metadata = {
  title: "ParkPing by PING",
  description: "Privacy-first parking communication by PING.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "ParkPing",
    statusBarStyle: "default",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
