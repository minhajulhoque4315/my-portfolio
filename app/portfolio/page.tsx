import { createClient } from '@supabase/supabase-js';
import { connection } from 'next/server';
import PortfolioPageClient from '@/app/portfolio/PortfolioPageClient';
import { getGlobalFooterConfig } from '@/lib/footer-content';
import { getPortfolioPageBuilderConfig } from '@/lib/portfolio-page-content';
import {
  fetchPortfolioDataset,
  getPortfolioPageSettings,
  parsePortfolioItemMetaConfig,
  PORTFOLIO_ITEM_META_SETTING_KEY,
  toPortfolioPreviewItems,
} from '@/lib/portfolio-content';
import { getServerSettingMap } from '@/lib/server-site-settings';

export default async function PortfolioPage() {
  await connection();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const fallbackData = { videos: [], graphics: [], categories: [] };
  const datasetPromise = supabaseUrl && supabaseAnonKey
    ? fetchPortfolioDataset(
        createClient(supabaseUrl, supabaseAnonKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        })
      )
    : Promise.resolve(fallbackData);
  const [settings, dataset] = await Promise.all([
    getServerSettingMap(),
    datasetPromise,
  ]);
  const { videos, graphics, categories } = dataset;

  return (
    <PortfolioPageClient
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
