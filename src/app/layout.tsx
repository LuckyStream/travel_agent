import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wanderlust — Travel planner",
  description: "AI-assisted travel recommendations with an interactive map",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased bg-[#0a0e12] text-ink">{children}</body>
    </html>
  );
}
