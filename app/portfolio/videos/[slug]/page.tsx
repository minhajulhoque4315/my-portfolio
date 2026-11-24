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
  const data = await getPortfolioDetailData('videos', slug);

  if (!data) {
    return buildPageMetadata(settings, 'portfolio');
  }

  return buildPortfolioItemMetadata(settings, {
    item: data.item,
    meta: data.meta,
  });
}

export default async function VideoPortfolioDetailPage({ params }: PageProps) {
  await connection();
  const { slug } = await params;
  const data = await getPortfolioDetailData('videos', slug);

  if (!data) {
    notFound();
  }

  const path = getPortfolioItemDetailPath(data.item, data.meta);
  const description = data.meta.seoDescription || data.meta.previewDescription || data.item.description || '';
  const video = slug === 'documentary-edit-cinematic-b-roll-motion-graphics'
    ? {
        thumbnailUrl: 'https://i.ytimg.com/vi/gkOGlVR4xFY/hqdefault.jpg',
        uploadDate: '2026-11-21',
        embedUrl: 'https://www.youtube-nocookie.com/embed/gkOGlVR4xFY',
        contentUrl: 'https://www.youtube.com/watch?v=gkOGlVR4xFY',
      }
    : slug === 'short-form-reel-edit-kinetic-typography-motion-graphics'
      ? {
          thumbnailUrl: 'https://i.ytimg.com/vi/Xlfd2_DWa0U/hqdefault.jpg',
          uploadDate: '2026-11-21',
          embedUrl: 'https://www.youtube-nocookie.com/embed/Xlfd2_DWa0U',
          contentUrl: 'https://www.youtube.com/watch?v=Xlfd2_DWa0U',
        }
      : undefined;
  const structuredData = buildPortfolioDetailStructuredData({
    title: data.item.title,
    description: slug === 'documentary-edit-cinematic-b-roll-motion-graphics'
      ? 'A cinematic documentary edit for a Bengali creator: presenter-led storytelling supported by news and interview B-roll, motion-graphic callouts and a unified red-toned colour grade, with full sound design.'
      : description,
    categoryName: data.item.categoryName,
    path,
    sourceType: 'video',
    image: data.item.imageUrl,
    video,
  });
  return <><PortfolioDetailView {...data} />{structuredData.map((entry, index) => <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(entry).replace(/</g, '\\u003c') }} />)}</>;
}
