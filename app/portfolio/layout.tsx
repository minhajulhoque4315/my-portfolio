import type { Metadata } from 'next';
import { connection } from 'next/server';
import { getServerGlobalSettings } from '@/lib/server-site-settings';
import { buildPageMetadata, buildPortfolioCollectionStructuredData } from '@/lib/site-metadata';
import { CrawlablePortfolioContent } from '@/components/seo/CrawlablePageContent';

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const settings = await getServerGlobalSettings();
  return buildPageMetadata(settings, 'portfolio');
}

export default async function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getServerGlobalSettings();
  const structuredData = buildPortfolioCollectionStructuredData(settings);
  return <>{children}<CrawlablePortfolioContent /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} /></>;
}
