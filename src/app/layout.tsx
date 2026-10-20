import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Braosei Studios | Studio Session Booking",
  description:
    "An editorial luxury creative photography studio in Takoradi, Ghana. Book portrait, editorial, and commercial photography sessions.",
  keywords: [
    "Braosei Studios",
    "Creative Studio Ghana",
    "Studio Booking Takoradi",
    "Photography Studio Takoradi",
    "Editorial Production",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#F4F0EB] text-[#1A1716] min-h-screen antialiased selection:bg-[#C2A878] selection:text-white">
        {children}
      </body>
    </html>
  );
}
