import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Analytics from "@/components/Analytics";
import FacebookPixel from "@/components/FacebookPixel";
import PWARegister from "@/components/PWARegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  themeColor: "#3B82F6",
};

export const metadata = {
  metadataBase: new URL("https://strideandsteelrunning.com"),
  title: "Stride & Steel Running | Run Smarter. Get Faster.",
  description:
    "A personalized running program that builds speed, endurance, and consistency - whether you're chasing a PR or just getting started.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "Stride & Steel Running",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icon-192x192.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Analytics />
          <FacebookPixel />
          <PWARegister />
          {children}
        </Providers>
      </body>
    </html>
  );
}
