import 'server-only';

import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';
import { fetchPortfolioDataset } from '@/lib/portfolio-content';

export const getServerPortfolioDataset = cache(async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { videos: [], graphics: [], categories: [] };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return fetchPortfolioDataset(supabase);
});
