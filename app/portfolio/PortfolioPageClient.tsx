'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTheme } from '@/components/ThemeProvider';
import GlobalFooter from '@/components/shared/GlobalFooter';
import PortfolioShowcase from '@/components/portfolio/PortfolioShowcase';
import type { HomepageFooterSection } from '@/lib/homepage-content';
import type { PortfolioPageBuilderConfig } from '@/lib/portfolio-page-content';
import type {
  PortfolioCategory,
  PortfolioItemMetaConfigMap,
  PortfolioPageSettings,
  PortfolioPreviewItem,
  PortfolioTabKey,
} from '@/lib/portfolio-content';

type PortfolioPageClientProps = {
  initialItems: PortfolioPreviewItem[];
  initialCategories: PortfolioCategory[];
  initialPageSettings: PortfolioPageSettings;
  initialPageBuilder: PortfolioPageBuilderConfig;
  initialItemMetaConfig: PortfolioItemMetaConfigMap;
  initialFooterConfig: HomepageFooterSection;
};

export default function PortfolioPageClient(props: PortfolioPageClientProps) {
  return (
    <Suspense fallback={<p role="status" style={{ padding: '120px 24px' }}>Loading portfolio...</p>}>
      <PortfolioPageContent {...props} />
    </Suspense>
  );
}

function PortfolioPageContent({
  initialItems,
  initialCategories,
  initialPageSettings,
  initialPageBuilder,
  initialItemMetaConfig,
  initialFooterConfig,
}: PortfolioPageClientProps) {
  const searchParams = useSearchParams();
  const requestedType = searchParams.get('type');
  const activeTab: PortfolioTabKey = requestedType === 'graphics'
    ? 'graphic'
    : requestedType === 'videos' ? 'video' : 'all';

  function changeTab(tab: PortfolioTabKey) {
    const url = new URL(window.location.href);
    if (tab === 'all') {
      url.searchParams.delete('type');
    } else {
      url.searchParams.set('type', tab === 'graphic' ? 'graphics' : 'videos');
    }
    if (url.href !== window.location.href) {
      window.history.pushState(null, '', `${url.pathname}${url.search}${url.hash}`);
    }
  }

  const { theme } = useTheme();
  const dark = theme === 'dark';
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const syncMobile = () => setIsMobile(window.innerWidth < 768);
    syncMobile();
    window.addEventListener('resize', syncMobile);
    return () => window.removeEventListener('resize', syncMobile);
  }, []);

  if (!initialPageBuilder.pageEnabled) {
    return (
      <main
        style={{
          minHeight: '100vh',
          background: dark ? '#080808' : '#f8fbff',
          color: dark ? '#f8fafc' : '#0f172a',
          fontFamily: "'Inter', system-ui, sans-serif",
          display: 'grid',
          placeItems: 'center',
          padding: '120px 24px',
        }}
      >
        <div
          style={{
            maxWidth: 620,
            textAlign: 'center',
            borderRadius: 28,
            padding: '38px 28px',
            border: `1px solid ${dark ? 'rgba(148,163,184,0.16)' : 'rgba(15,23,42,0.08)'}`,
            background: dark
              ? 'linear-gradient(180deg, rgba(15,23,42,0.74), rgba(2,6,23,0.88))'
              : 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(239,246,255,0.88))',
          }}
        >
          <div style={{ color: '#38bdf8', fontSize: 12, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 14 }}>
            Portfolio Hidden
          </div>
          <h1 style={{ margin: '0 0 12px', fontSize: 34, fontWeight: 800, letterSpacing: '-0.05em' }}>
            Portfolio page is currently disabled.
          </h1>
          <p style={{ margin: 0, color: dark ? '#94a3b8' : '#475569', lineHeight: 1.75 }}>
            The portfolio is currently unavailable.
          </p>
        </div>
      </main>
    );
  }

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
      <PortfolioShowcase
        variant="page"
        activeTab={activeTab}
        onTabChange={changeTab}
        items={initialItems}
        categories={initialCategories}
        pageSettings={initialPageSettings}
        pageBuilder={initialPageBuilder}
        itemMetaConfig={initialItemMetaConfig}
      />
      <GlobalFooter config={initialFooterConfig} isMobile={isMobile} />
    </main>
  );
}
