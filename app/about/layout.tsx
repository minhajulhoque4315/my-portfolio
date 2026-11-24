import type { Metadata } from 'next';
import { connection } from 'next/server';
import { getServerGlobalSettings } from '@/lib/server-site-settings';
import { buildAboutProfileStructuredData, buildPageMetadata } from '@/lib/site-metadata';
import { CrawlableAboutContent } from '@/components/seo/CrawlablePageContent';

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  const settings = await getServerGlobalSettings();
  return buildPageMetadata(settings, 'about');
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}<CrawlableAboutContent /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildAboutProfileStructuredData()) }} /></>;
}
