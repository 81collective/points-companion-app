import type { Metadata, Viewport } from "next";
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
import PerformanceMonitor from "@/components/performance/PerformanceMonitor";
import { generateMetadata, seoConfigs, generateOrganizationSchema } from "@/lib/seo";
import Script from "next/script";
import { MinimalHeader } from "@/components/layout/MinimalHeader";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  ...generateMetadata(seoConfigs.home),
  manifest: "/manifest.json",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Points Companion",
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = generateOrganizationSchema();

  return (
    <html lang="en" className={inter.className}>
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://maps.googleapis.com" />
        
        {/* DNS prefetch for potential external resources */}
        <link rel="dns-prefetch" href="//api.stripe.com" />
        <link rel="dns-prefetch" href="//js.stripe.com" />
        
        {/* Resource hints */}
        <link rel="prefetch" href="/dashboard" />
        <link rel="prefetch" href="/cards" />
        
        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        
        {/* Performance optimization */}
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          strategy="afterInteractive"
          async
        />
      </head>
  <body>
        <PerformanceMonitor />
        <ErrorBoundary>
          <ErrorProvider>
            <ReactQueryProvider>
              <AuthProvider>
        <MinimalHeader />
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