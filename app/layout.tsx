import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Taskive Tech | Product & Engineering Studio",
  description:
    "A studio-led product and engineering team building websites, platforms, and scalable systems.",
  keywords: [
    "Canadian",
    "web development",
    "product design",
    "engineering",
    "SaaS",
    "e-commerce",
    "web applications",
  ],
  authors: [{ name: "Taskive Tech" }],
  openGraph: {
    title: "Taskive Tech | Product & Engineering Studio",
    description:
      "A studio-led product and engineering team building websites, platforms, and scalable systems.",
    type: "website",
  },
  icons: {
    icon: "/logooo.png", // Standard favicon
    shortcut: "/logooo.png",
    apple: "/logo.png", // Fallback to logo for apple touch icon if strict apple-touch-icon.png not found
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable}`}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
