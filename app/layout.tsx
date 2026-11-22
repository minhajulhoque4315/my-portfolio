import type { Metadata } from 'next';
import { GoogleAnalytics } from "@next/third-parties/google";
import { connection } from 'next/server';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import Navbar from '@/components/Navbar';
import PageViewTracker from '@/components/PageViewTracker';
import { getServerGlobalSettings } from '@/lib/server-site-settings';
import { buildPageMetadata, buildStructuredData } from '@/lib/site-metadata';

function toJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const settings = await getServerGlobalSettings();
  return buildPageMetadata(settings, 'home');
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const settings = await getServerGlobalSettings();
  const structuredData = buildStructuredData(settings);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <Navbar />
          <PageViewTracker />
          {children}
        </ThemeProvider>
        {structuredData.map((entry, index) => (
          <script
            key={index}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: toJsonLd(entry) }}
          />
        ))}
        {process.env.NEXT_PUBLIC_GA_ID ? (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        ) : null}
      </body>
    </html>
  );
}
