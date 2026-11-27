'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import GlobalFooter from '@/components/shared/GlobalFooter';
import PortfolioShowcase from '@/components/portfolio/PortfolioShowcase';
import type { HomepageFooterSection } from '@/lib/homepage-content';
import {
  type PortfolioPageBuilderConfig,
} from '@/lib/portfolio-page-content';
import {
  getPortfolioCategoryName,
  type PortfolioCategory,
  type PortfolioItemMetaConfigMap,
  type PortfolioPageSettings,
  type PortfolioPreviewItem,
  type PortfolioSourceType,
} from '@/lib/portfolio-content';

type PortfolioCategoryPageClientProps = {
  initialItems: PortfolioPreviewItem[];
  initialCategories: PortfolioCategory[];
  initialPageSettings: PortfolioPageSettings;
  initialPageBuilder: PortfolioPageBuilderConfig;
  initialItemMetaConfig: PortfolioItemMetaConfigMap;
  initialFooterConfig: HomepageFooterSection;
};

function normalizeParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || '' : value || '';
}

function normalizeSourceType(value: string): PortfolioSourceType | null {
  if (value === 'video') {
    return 'video';
  }

  if (value === 'graphic' || value === 'graphics') {
    return 'graphic';
  }

  return null;
}

export default function PortfolioCategoryPage({
  initialItems,
  initialCategories,
  initialPageSettings,
  initialPageBuilder,
  initialItemMetaConfig,
  initialFooterConfig,
}: PortfolioCategoryPageClientProps) {
  const params = useParams();
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const typeParam = normalizeParam(params.type);
  const slugParam = decodeURIComponent(normalizeParam(params.slug));
  const sourceType = normalizeSourceType(typeParam);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const syncMobile = () => setIsMobile(window.innerWidth < 768);
    syncMobile();
    window.addEventListener('resize', syncMobile);
    return () => window.removeEventListener('resize', syncMobile);
  }, []);

  const categoryItems = useMemo(
    () =>
      sourceType
        ? initialItems.filter(
            item =>
              item.visible &&
              item.categoryActive &&
              item.categoryShowOnPortfolio &&
              item.sourceType === sourceType &&
              item.categorySlug === slugParam
          )
        : [],
    [initialItems, slugParam, sourceType]
  );

  const categoryTitle =
    categoryItems[0]?.categoryName || getPortfolioCategoryName(initialCategories, slugParam);
  const typeLabel = sourceType === 'video' ? 'Video Editing' : 'Graphics Design';
  const scopedPageSettings: PortfolioPageSettings = {
    ...initialPageSettings,
    title: categoryTitle,
    subtitle: `Explore ${categoryItems.length} selected works in ${typeLabel}.`,
    tabs: {
      all: {
        ...initialPageSettings.tabs.all,
        enabled: false,
      },
      video: {
        ...initialPageSettings.tabs.video,
        enabled: sourceType === 'video',
        label: typeLabel,
      },
      graphic: {
        ...initialPageSettings.tabs.graphic,
        enabled: sourceType === 'graphic',
        label: typeLabel,
      },
    },
    allTab: {
        ...initialPageSettings.allTab,
      showVideos: sourceType === 'video',
      showGraphics: sourceType === 'graphic',
    },
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        overflowX: 'hidden',
        paddingBottom: 'calc(110px + env(safe-area-inset-bottom))',
        background: dark ? '#080808' : '#f8fbff',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {sourceType ? (
        <PortfolioShowcase
          variant="page"
          items={categoryItems}
          categories={initialCategories.filter(category => category.slug === slugParam)}
          pageSettings={scopedPageSettings}
          pageBuilder={{
            ...initialPageBuilder,
            hero: {
              ...initialPageBuilder.hero,
              title: categoryTitle,
              subtitle: scopedPageSettings.subtitle,
              badge: typeLabel,
              showButton: true,
              buttonText: 'All Portfolio',
              buttonLink: '/portfolio',
            },
          }}
          itemMetaConfig={initialItemMetaConfig}
        />
      ) : (
        <section
          style={{
            minHeight: '70vh',
            display: 'grid',
            placeItems: 'center',
            color: dark ? '#f8fafc' : '#0f172a',
            padding: isMobile ? '96px 16px' : '120px 24px',
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
            overflowX: 'hidden',
          }}
        >
          <div style={{ textAlign: 'center', width: '100%', maxWidth: 560, minWidth: 0 }}>
            <h1 style={{ margin: '0 0 12px', fontSize: 34 }}>Category not found</h1>
            <p style={{ margin: 0, color: dark ? '#94a3b8' : '#475569' }}>
              This portfolio category route needs a valid video or graphic type.
            </p>
            <a
              href="/portfolio"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginTop: 22,
                padding: '12px 18px',
                borderRadius: 14,
                background: 'linear-gradient(135deg, #2563eb, #0ea5e9)',
                color: '#fff',
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              All Portfolio <span aria-hidden="true">→</span>
            </a>
          </div>
        </section>
      )}
      <GlobalFooter config={initialFooterConfig} isMobile={isMobile} />
    </main>
  );
}
