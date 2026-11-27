import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import { getGlobalSettingsConfig } from '@/lib/global-settings';
import { toSettingMap, type SettingMap } from '@/lib/hero-settings';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const getCachedServerSettingMap = unstable_cache(async (): Promise<SettingMap> => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return {};
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await supabase.from('site_settings').select('key, value');
    return toSettingMap(data || []);
  } catch {
    return {};
  }
}, ['public-site-settings'], { revalidate: 30 });

export const getServerSettingMap = cache(getCachedServerSettingMap);

export const getServerGlobalSettings = cache(async () => {
  const map = await getServerSettingMap();
  return getGlobalSettingsConfig(map);
});
