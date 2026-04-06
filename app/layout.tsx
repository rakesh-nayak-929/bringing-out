import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Components
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bringing Out",
  description: "Creator Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Sidebar />
        <Topbar />

        {/* Main Content Area */}
        <div
          style={{
            marginLeft: "220px",
            marginTop: "60px",
            padding: "20px",
          }}
        >
          {children}
        </div>
      </body>
    </html>
  );
}