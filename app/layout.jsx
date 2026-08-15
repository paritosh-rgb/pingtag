import "./globals.css";

export const metadata = {
  title: "ParkPing by GetPing",
  description: "Privacy-first parking communication by GetPing.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "ParkPing by GetPing",
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
