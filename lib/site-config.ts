export const DEFAULT_SITE_URL = 'https://www.mdminhajulhoque.com';

export function getSiteUrl() {
  const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;

  try {
    return new URL(rawUrl.trim()).origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export function getCanonicalUrl(path = '/') {
  const siteUrl = getSiteUrl();
  const trimmedPath = String(path || '/').trim();

  if (/^https?:\/\//i.test(trimmedPath)) {
    try {
      const parsed = new URL(trimmedPath);
      const normalizedPath = parsed.pathname.replace(/\/{2,}/g, '/').replace(/\/+$/, '');
      const search = parsed.search || '';
      return `${parsed.origin}${normalizedPath || '/'}${search}`;
    } catch {
      return siteUrl;
    }
  }

  const normalizedPath = `/${trimmedPath}`
    .replace(/\/{2,}/g, '/')
    .replace(/\/+$/, '');
  const finalPath = normalizedPath === '' ? '/' : normalizedPath;

  return finalPath === '/' ? siteUrl : `${siteUrl}${finalPath}`;
}

export const SITE_CONFIG = {
  siteName: 'Md Minhajul Hoque',
  ownerName: 'Md. Minhajul Hoque',
  profession: 'Video Editor & Motion Designer',
  url: getSiteUrl(),
  title: 'Md. Minhajul Hoque | Video Editor & Motion Designer',
  description:
    'Official portfolio of Md. Minhajul Hoque, Video Editor & Motion Designer specializing in documentary editing, short-form content, motion graphics, and brand design.',
  shortDescription: 'Official portfolio of Md. Minhajul Hoque, Video Editor & Motion Designer.',
  keywords: [
    'Graphic Design',
    'Video Editing',
    'Motion Graphics',
    'Digital Marketing',
    'Portfolio',
    'Visual Designer',
    'Video Editor',
    'Bangladesh',
  ],
  ogImage: '/og-image.jpg',
  linkedIn: 'https://www.linkedin.com/in/md-minhajul-hoque-367852420',
  alternateSiteNames: [
    'Md. Minhajul Hoque',
    'Minhajul Hoque',
    'Md Minhaj',
    'Muhammad Minhajul Hoque',
  ],
  alternatePersonNames: ['Md Minhajul Hoque', 'Minhajul Hoque', 'Muhammad Minhajul Hoque'],
  knowsAbout: [
    'Talking-Head Video Editing', 'Documentary Video Editing', 'Social Media Video Editing',
    'Short-Form Video Editing', 'Motion Graphics', 'Promotional Video Production',
    'Brand Identity Design', 'Social Media Graphic Design', 'Thumbnail Design',
  ],
} as const;

export function absoluteSiteUrl(path = '/') {
  return getCanonicalUrl(path);
}

export function absoluteAssetUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return getCanonicalUrl(path);
}
