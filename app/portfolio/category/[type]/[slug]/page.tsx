import { connection } from 'next/server';
import PortfolioCategoryPageClient from '@/app/portfolio/category/[type]/[slug]/PortfolioCategoryPageClient';
import { getGlobalFooterConfig } from '@/lib/footer-content';
import { getPortfolioPageBuilderConfig } from '@/lib/portfolio-page-content';
import {
  getPortfolioPageSettings,
  parsePortfolioItemMetaConfig,
  PORTFOLIO_ITEM_META_SETTING_KEY,
  toPortfolioPreviewItems,
} from '@/lib/portfolio-content';
import { getServerPortfolioDataset } from '@/lib/server-portfolio-data';
import { getServerSettingMap } from '@/lib/server-site-settings';

export default async function PortfolioCategoryPage() {
  await connection();

  const [settings, dataset] = await Promise.all([
    getServerSettingMap(),
    getServerPortfolioDataset(),
  ]);
  const { videos, graphics, categories } = dataset;

  return (
    <PortfolioCategoryPageClient
      initialItems={toPortfolioPreviewItems(videos, graphics, categories)}
      initialCategories={categories}
      initialPageSettings={getPortfolioPageSettings(settings)}
      initialPageBuilder={getPortfolioPageBuilderConfig(settings)}
      initialItemMetaConfig={parsePortfolioItemMetaConfig(settings[PORTFOLIO_ITEM_META_SETTING_KEY])}
      initialFooterConfig={getGlobalFooterConfig(settings, {
        projectCount: videos.length + graphics.length,
      })}
    />
  );
}
