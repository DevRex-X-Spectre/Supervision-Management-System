import type { Metadata } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import { ProjectGuideChat } from "@/components/shared/project-guide-chat";
import { INSTITUTION } from "@/lib/constants";
import "./globals.css";

const sans = localFont({
  src: "./fonts/DMSans.woff2",
  variable: "--font-sans",
  display: "swap",
});

const display = localFont({
  src: "./fonts/Fraunces.woff2",
  variable: "--font-display",
  display: "swap",
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
        <ProjectGuideChat />
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}
