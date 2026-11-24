import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import PortfolioDetailView from '@/components/portfolio/PortfolioDetailView';
import { getPortfolioDetailData } from '@/lib/portfolio-detail';
import { getServerGlobalSettings } from '@/lib/server-site-settings';
import { buildPageMetadata, buildPortfolioDetailStructuredData, buildPortfolioItemMetadata } from '@/lib/site-metadata';
import { getPortfolioItemDetailPath } from '@/lib/portfolio-content';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  const settings = await getServerGlobalSettings();
  const data = await getPortfolioDetailData('graphics', slug);

  if (!data) {
    return buildPageMetadata(settings, 'portfolio');
  }

  return buildPortfolioItemMetadata(settings, {
    item: data.item,
    meta: data.meta,
  });
}

export default async function GraphicPortfolioDetailPage({ params }: PageProps) {
  await connection();
  const { slug } = await params;
  const data = await getPortfolioDetailData('graphics', slug);

  if (!data) {
    notFound();
  }

  const structuredData = buildPortfolioDetailStructuredData({
    title: data.item.title,
    description: data.meta.seoDescription || data.meta.previewDescription || data.item.description || '',
    categoryName: data.item.categoryName,
    path: getPortfolioItemDetailPath(data.item, data.meta),
    sourceType: 'graphic',
    image: data.item.imageUrl,
  });
  return <><PortfolioDetailView {...data} />{structuredData.map((entry, index) => <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(entry).replace(/</g, '\\u003c') }} />)}</>;
}
