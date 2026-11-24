import type { Metadata, MetadataRoute } from 'next';
import type { GlobalSettingsConfig } from '@/lib/global-settings';
import {
  buildCanonicalUrl,
  getCombinedKeywords,
  getEffectiveSeoPage,
  SEO_PAGE_OPTIONS,
  type SeoPageId,
} from '@/lib/site-seo';
import {
  getPortfolioItemDetailPath,
  type PortfolioItemMetaConfig,
  type PortfolioPreviewItem,
  type PortfolioSourceType,
} from '@/lib/portfolio-content';
import { absoluteAssetUrl, absoluteSiteUrl, getCanonicalUrl, SITE_CONFIG } from '@/lib/site-config';

function asUrl(value: string) {
  try {
    return new URL(value);
  } catch {
    return undefined;
  }
}

export function buildPageMetadata(
  settings: GlobalSettingsConfig,
  pageId: SeoPageId
): Metadata {
  const canonicalBase = settings.seo.canonicalUrl || SITE_CONFIG.url;
  const metadataBase = asUrl(canonicalBase);
  const effective = getEffectiveSeoPage(
    settings.seo,
    pageId,
    SITE_CONFIG.siteName
  );
  const canonical = buildCanonicalUrl(canonicalBase, effective.canonicalPath);
  const keywords = getCombinedKeywords(settings.seo, pageId);
  const image = effective.ogImage || settings.seo.defaultOgImage || SITE_CONFIG.ogImage;
  const imageUrl = absoluteAssetUrl(image);
  const imageAlt =
    effective.ogImageAlt ||
    settings.seo.defaultOgImageAlt ||
    `${SITE_CONFIG.siteName} social preview`;

  return {
    metadataBase,
    title:
      pageId === 'home'
        ? {
            default: effective.seoTitle,
            template: `%s | ${SITE_CONFIG.siteName}`,
          }
        : {
            absolute: effective.seoTitle,
          },
    description: effective.seoDescription,
    keywords,
    applicationName: SITE_CONFIG.siteName,
    authors: [{ name: SITE_CONFIG.siteName, url: SITE_CONFIG.url }],
    creator: SITE_CONFIG.siteName,
    publisher: SITE_CONFIG.siteName,
    category: 'portfolio',
    alternates: canonical ? { canonical } : undefined,
    icons: settings.siteIdentity.faviconUrl
      ? {
          icon: settings.siteIdentity.faviconUrl,
          shortcut: settings.siteIdentity.faviconUrl,
          apple: '/apple-touch-icon.png',
        }
      : {
          icon: '/favicon.ico',
          shortcut: '/favicon.ico',
          apple: '/apple-touch-icon.png',
          other: [
            { rel: 'icon', url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            { rel: 'icon', url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          ],
        },
    robots: {
      index: true,
      follow: true,
      noarchive: settings.seo.robotsNoarchive || undefined,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    openGraph: {
      title: effective.ogTitle,
      description: effective.ogDescription,
      url: canonical || undefined,
      siteName: SITE_CONFIG.siteName,
      type: 'website',
      locale: 'en_US',
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: imageAlt,
            },
          ]
        : undefined,
    },
    twitter: {
      card: effective.twitterCard,
      title: effective.ogTitle,
      description: pageId === 'home' ? SITE_CONFIG.shortDescription : effective.ogDescription,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

function readableSlug(value: string) {
  return value
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function buildPortfolioCategoryMetadata(
  settings: GlobalSettingsConfig,
  params: {
    categoryTitle?: string;
    categoryDescription?: string;
    seoTitle?: string;
    seoDescription?: string;
    canonicalUrl?: string;
    ogImage?: string;
    slug: string;
    sourceType: PortfolioSourceType;
  }
): Metadata {
  const categoryTitle = params.categoryTitle || readableSlug(params.slug) || 'Portfolio Category';
  const typeLabel = params.sourceType === 'video' ? 'Video Editing' : 'Graphics Design';
  const base = buildPageMetadata(settings, 'portfolio');
  const routeType = params.sourceType === 'graphic' ? 'graphics' : params.sourceType;
  const path = `/portfolio/category/${routeType}/${params.slug}`;
  const canonical = params.canonicalUrl ? getCanonicalUrl(params.canonicalUrl) : getCanonicalUrl(path);
  const title = params.seoTitle || `${categoryTitle} | ${SITE_CONFIG.siteName}`;
  const description =
    params.seoDescription ||
    params.categoryDescription ||
    `Browse ${categoryTitle} ${typeLabel.toLowerCase()} portfolio work, previews, and selected project details.`;
  const imageUrl = params.ogImage ? absoluteAssetUrl(params.ogImage) : undefined;

  return {
    ...base,
    title: { absolute: title },
    description,
    alternates: canonical ? { canonical } : base.alternates,
    openGraph: {
      ...base.openGraph,
      title,
      description,
      url: canonical || undefined,
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: `${categoryTitle} category social preview`,
            },
          ]
        : base.openGraph?.images,
    },
    twitter: {
      ...base.twitter,
      title,
      description,
      images: imageUrl ? [imageUrl] : base.twitter?.images,
    },
  };
}

export function buildPortfolioItemMetadata(
  settings: GlobalSettingsConfig,
  params: {
    item: PortfolioPreviewItem;
    meta: PortfolioItemMetaConfig;
  }
): Metadata {
  const base = buildPageMetadata(settings, 'portfolio');
  const title =
    params.meta.seoTitle ||
    params.meta.previewTitle ||
    `${params.item.title} | ${SITE_CONFIG.siteName}`;
  const description =
    params.meta.seoDescription ||
    params.meta.previewDescription ||
    params.item.description ||
    `View ${params.item.title}, a selected ${params.item.sourceType === 'video' ? 'video editing' : 'graphics design'} portfolio work by ${SITE_CONFIG.siteName}.`;
  const canonical = params.meta.canonicalUrl
    ? getCanonicalUrl(params.meta.canonicalUrl)
    : getCanonicalUrl(getPortfolioItemDetailPath(params.item, params.meta));
  const image =
    params.meta.ogImage ||
    params.meta.socialImage ||
    params.meta.coverImage ||
    params.item.imageUrl;
  const imageUrl = image ? absoluteAssetUrl(image) : undefined;
  const shouldIndex =
    params.item.visible &&
    params.meta.status !== 'draft' &&
    params.meta.status !== 'hidden' &&
    params.meta.robots !== 'noindex-nofollow';

  return {
    ...base,
    title: { absolute: title },
    description,
    alternates: canonical ? { canonical } : base.alternates,
    robots: {
      index: shouldIndex,
      follow: shouldIndex,
      googleBot: {
        index: shouldIndex,
        follow: shouldIndex,
      },
    },
    openGraph: {
      ...base.openGraph,
      title,
      description,
      url: canonical || undefined,
      type: 'article',
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: params.meta.altText || `${params.item.title} social preview`,
            },
          ]
        : base.openGraph?.images,
    },
    twitter: {
      ...base.twitter,
      title,
      description,
      images: imageUrl ? [imageUrl] : base.twitter?.images,
    },
  };
}

export function buildStructuredData(settings: GlobalSettingsConfig) {
  const personId = `${SITE_CONFIG.url}/#person`;

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Md. Minhajul Hoque',
    alternateName: ['Md Minhajul Hoque', 'Minhajul Hoque', 'Muhammad Minhajul Hoque'],
    url: SITE_CONFIG.url,
  };
  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': personId,
    name: 'Md. Minhajul Hoque',
    alternateName: SITE_CONFIG.alternatePersonNames,
    jobTitle: 'Video Editor & Motion Designer',
    description: 'Video editor and motion designer based in Dhaka, Bangladesh, specialising in documentary editing, talking-head videos, short-form content, motion graphics and brand design for remote clients worldwide.',
    url: SITE_CONFIG.url,
    image: absoluteAssetUrl(settings.siteIdentity.faviconUrl || SITE_CONFIG.ogImage),
    email: 'mailto:minhajulhoque6914@gmail.com',
    telephone: '+8801603144248',
    address: { '@type': 'PostalAddress', addressLocality: 'Dhaka', addressCountry: 'BD' },
    nationality: { '@type': 'Country', name: 'Bangladesh' },
    knowsAbout: SITE_CONFIG.knowsAbout,
    sameAs: [
      'https://www.linkedin.com/in/md-minhajul-hoque-367852420',
      'https://www.facebook.com/MuhammadMinhajulHoque',
      'https://www.instagram.com/muhammadminhajulhoque',
      'https://www.youtube.com/@MdMinhajulHoque-s7t',
      'https://www.behance.net/mdminhajulhoque',
    ],
    hasOccupation: [
      { '@type': 'OrganizationRole', roleName: 'Video Editor & Motion Designer', startDate: '2025-08', endDate: '2026-10', memberOf: { '@type': 'Organization', name: 'HCSB' } },
      { '@type': 'OrganizationRole', roleName: 'Video Editor & Motion Designer', startDate: '2025-07', endDate: '2025-08', memberOf: { '@type': 'Organization', name: 'Mohasagor.com' } },
    ],
  };
  return [website, person];
}

export function buildPortfolioCollectionStructuredData(settings: GlobalSettingsConfig) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${SITE_CONFIG.siteName} Portfolio`,
    url: absoluteSiteUrl('/portfolio'),
    description: settings.seo.metaDescription || SITE_CONFIG.description,
    about: SITE_CONFIG.knowsAbout,
  };
}

export function buildAboutProfileStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: { '@id': `${SITE_CONFIG.url}/#person` },
  };
}

export function buildPortfolioDetailStructuredData(params: {
  title: string;
  description: string;
  categoryName?: string;
  path: string;
  sourceType: PortfolioSourceType;
  image?: string;
  video?: {
    thumbnailUrl: string;
    uploadDate: string;
    embedUrl: string;
    contentUrl: string;
  };
}) {
  const typeLabel = params.sourceType === 'video' ? 'Video Editing' : 'Graphic Design';
  const categoryName = params.categoryName || typeLabel;
  const itemUrl = absoluteSiteUrl(params.path);
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_CONFIG.url },
      { '@type': 'ListItem', position: 2, name: 'Portfolio', item: absoluteSiteUrl('/portfolio') },
      { '@type': 'ListItem', position: 3, name: categoryName, item: absoluteSiteUrl('/portfolio') },
      { '@type': 'ListItem', position: 4, name: params.title, item: itemUrl },
    ],
  };
  const work = {
    '@context': 'https://schema.org',
    '@type': params.video ? 'VideoObject' : 'CreativeWork',
    name: params.title,
    description: params.description,
    url: itemUrl,
    image: params.video?.thumbnailUrl || (params.image ? absoluteAssetUrl(params.image) : undefined),
    ...(params.video
      ? {
          thumbnailUrl: params.video.thumbnailUrl,
          uploadDate: params.video.uploadDate,
          embedUrl: params.video.embedUrl,
          contentUrl: params.video.contentUrl,
          creator: { '@id': `${SITE_CONFIG.url}/#person` },
        }
      : { creator: { '@id': `${SITE_CONFIG.url}/#person` } }),
  };
  return [breadcrumb, work];
}

export function buildRobots(settings: GlobalSettingsConfig): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: 'Googlebot', allow: '/' },
      { userAgent: 'Bingbot', allow: '/' },
      { userAgent: 'Applebot', allow: '/' },
      { userAgent: 'OAI-SearchBot', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: '*', allow: '/' },
    ],
    sitemap: absoluteSiteUrl('/sitemap.xml'),
  };
}

export function buildSitemap(
  settings: GlobalSettingsConfig,
  extraEntries: MetadataRoute.Sitemap = []
): MetadataRoute.Sitemap {
  if (!settings.seo.sitemapEnabled) {
    return [];
  }

  const pageEntries = SEO_PAGE_OPTIONS.map(page => {
    const effective = getEffectiveSeoPage(
      settings.seo,
      page.id,
      SITE_CONFIG.siteName
    );

    return {
      url: buildCanonicalUrl(SITE_CONFIG.url, effective.canonicalPath),
      lastModified: new Date(),
      changeFrequency: page.id === 'home' ? ('weekly' as const) : ('monthly' as const),
      priority:
        page.id === 'home'
          ? 1
          : page.id === 'portfolio'
            ? 0.9
            : page.id === 'about' || page.id === 'contact'
              ? 0.8
              : 0.65,
      images:
        settings.seo.sitemapIncludeImages && effective.ogImage
          ? [absoluteAssetUrl(effective.ogImage)]
          : undefined,
    };
  });

  return [...pageEntries, ...extraEntries];
}
