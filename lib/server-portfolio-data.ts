import 'server-only';

import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import { fetchPortfolioDataset } from '@/lib/portfolio-content';

const getCachedPortfolioDataset = unstable_cache(async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { videos: [], graphics: [], categories: [] };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return fetchPortfolioDataset(supabase);
}, ['public-portfolio-dataset'], { revalidate: 30 });

export const getServerPortfolioDataset = cache(getCachedPortfolioDataset);
