import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pastebin by Suvi",
  description: "Share text quickly with Pastebin by Suvi.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
