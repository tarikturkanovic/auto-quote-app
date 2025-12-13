import "./globals.css";

export const metadata = {
  title: "Auto Shop Quote Builder",
  description: "Create quotes, track customers, and schedule follow-ups.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
