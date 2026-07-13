import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { Toaster } from "sonner";
import { INSTITUTION } from "@/lib/constants";
import "./globals.css";

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: {
    default: INSTITUTION.fullTitle,
    template: `%s | ${INSTITUTION.systemName}`,
  },
  description:
    "Web-based interactive research supervision system for Nigerian Army University Biu. Connect students, supervisors, and project coordinators in one secure platform.",
  icons: {
    icon: "/naub-logo.png",
    apple: "/naub-logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable} h-full`}>
      <body className="min-h-full font-sans antialiased">
        {children}
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}
