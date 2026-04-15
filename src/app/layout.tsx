import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ULSAN CAMPUS+ | Next-Gen Campus Platform",
  description: "AI-powered intelligent notes, dynamic schedules, and unified communication for Ulsan University students.",
  keywords: ["ulsan", "campus", "student", "AI", "notes", "schedule"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-black text-white">
        {children}
      </body>
    </html>
  );
}
