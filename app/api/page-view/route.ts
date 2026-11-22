import { getSupabaseAdminClient } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  if (request.headers.get('sec-fetch-site') !== 'same-origin') {
    return new Response(null, { status: 403 });
  }

  const page = await request.text();
  if (page.length > 512 || !/^\/(?:$|(?:about|contact|graphics|portfolio|tutorial)(?:\/[\w%-]+)*\/?)$/.test(page)) {
    return new Response(null, { status: 400 });
  }

  try {
    const { error } = await getSupabaseAdminClient().from('page_views').insert({ page });
    if (error) throw error;
    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 503 });
  }
}
