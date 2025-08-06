import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorProvider } from "@/contexts/ErrorContext";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import PWAInstallPrompt from "@/components/pwa/PWAInstallPrompt";
import OfflineIndicator from "@/components/pwa/OfflineIndicator";
import ServiceWorkerRegistration from "@/components/pwa/ServiceWorkerRegistration";
import AchievementToast from "@/components/gamification/AchievementToast";
import GamificationTracker from "@/components/gamification/GamificationTracker";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Points Companion - Maximize Your Credit Card Rewards",
  description: "Smart credit card recommendations and points optimization",
  manifest: "/manifest.json",
  themeColor: "#0f172a",
  viewport: "minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Points Companion",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          strategy="afterInteractive"
          async
        />
      </head>
      <body>
        <ErrorBoundary>
          <ErrorProvider>
            <ReactQueryProvider>
              <AuthProvider>
                <ServiceWorkerRegistration />
                <PWAInstallPrompt />
                <OfflineIndicator />
                <AchievementToast />
                <GamificationTracker />
                {children}
              </AuthProvider>
            </ReactQueryProvider>
          </ErrorProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}