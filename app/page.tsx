import { connection } from 'next/server';
import HomePageClient from '@/components/home/HomePageClient';
import { getAboutSystemConfig } from '@/lib/about-content';
import { getGlobalFooterConfig } from '@/lib/footer-content';
import { getHomepageBuilderConfig } from '@/lib/homepage-content';
import { type SettingMap } from '@/lib/hero-settings';
import {
  DEFAULT_HOMEPAGE_PORTFOLIO_SETTINGS,
  DEFAULT_PORTFOLIO_PAGE_SETTINGS,
  getHomepagePortfolioSettings,
  getPortfolioPageSettings,
  parsePortfolioItemMetaConfig,
  PORTFOLIO_ITEM_META_SETTING_KEY,
} from '@/lib/portfolio-content';
import { getServerSettingMap } from '@/lib/server-site-settings';
import { getServerPortfolioDataset } from '@/lib/server-portfolio-data';

type HomepageInitialData = {
  settings: SettingMap;
  videos: Awaited<ReturnType<typeof getServerPortfolioDataset>>['videos'];
  graphics: Awaited<ReturnType<typeof getServerPortfolioDataset>>['graphics'];
  categories: Awaited<ReturnType<typeof getServerPortfolioDataset>>['categories'];
};

async function getHomepageInitialData(): Promise<HomepageInitialData> {
  await connection();

  try {
    const [settings, dataset] = await Promise.all([
      getServerSettingMap(),
      getServerPortfolioDataset(),
    ]);

    return {
      settings,
      videos: dataset.videos,
      graphics: dataset.graphics,
      categories: dataset.categories,
    };
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[homepage-initial-data]', error);
    }

    return {
      settings: {},
      videos: [],
      graphics: [],
      categories: [],
    };
  }
}

export default async function HomePage() {
  const { settings: map, videos, graphics, categories } = await getHomepageInitialData();
  const projectCount = videos.length + graphics.length;
  const runtimeStats = {
    projectCount,
    clientCount: parseInt(map.stat_clients || '50', 10) || 50,
    yearsCount: parseInt(map.stat_years || '3', 10) || 3,
  };
  const homepageBuilder = getHomepageBuilderConfig(map, runtimeStats);
  const homepageBuilderWithFooter = {
    ...homepageBuilder,
    footer: getGlobalFooterConfig(map, runtimeStats),
  };

  return (
    <HomePageClient
      aboutSystem={getAboutSystemConfig(map, {
        projectsValue:
          homepageBuilder.stats.items.find(item => item.id === 'stats-projects')?.value ||
          `${projectCount}+`,
        projectsLabel:
          homepageBuilder.stats.items.find(item => item.id === 'stats-projects')?.label ||
          'Projects',
        clientsValue:
          homepageBuilder.stats.items.find(item => item.id === 'stats-clients')?.value || '50+',
        clientsLabel:
          homepageBuilder.stats.items.find(item => item.id === 'stats-clients')?.label ||
          'Clients',
        yearsValue:
          homepageBuilder.stats.items.find(item => item.id === 'stats-years')?.value || '3+',
        yearsLabel:
          homepageBuilder.stats.items.find(item => item.id === 'stats-years')?.label ||
          'Years Crafting',
      })}
      homepageBuilder={homepageBuilderWithFooter}
      portfolioVideos={videos}
      portfolioGraphics={graphics}
      portfolioCategories={categories}
      homepagePortfolioSettings={
        Object.keys(map).length > 0 ? getHomepagePortfolioSettings(map) : DEFAULT_HOMEPAGE_PORTFOLIO_SETTINGS
      }
      portfolioPageSettings={
        Object.keys(map).length > 0 ? getPortfolioPageSettings(map) : DEFAULT_PORTFOLIO_PAGE_SETTINGS
      }
      portfolioItemMetaConfig={parsePortfolioItemMetaConfig(
        map[PORTFOLIO_ITEM_META_SETTING_KEY]
      )}
    />
  );
}
