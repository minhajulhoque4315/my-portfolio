import Link from 'next/link';
import GlobalFooter from '@/components/shared/GlobalFooter';
import { getGlobalFooterConfig } from '@/lib/footer-content';
import { getServerSettingMap } from '@/lib/server-site-settings';

export default async function NotFound() {
  const footer = getGlobalFooterConfig(await getServerSettingMap());

  return (
    <>
      <title>Page Not Found | Md Minhajul Hoque</title>
      <main className="mx-auto flex min-h-[60vh] max-w-4xl flex-col items-start justify-center gap-5 px-6 py-24">
        <p className="text-sm font-semibold">404</p>
        <h1 className="text-4xl font-bold">Page not found</h1>
        <p>The page you requested could not be found.</p>
        <div className="flex flex-wrap gap-4">
          <Link className="rounded-md bg-blue-600 px-4 py-2 text-white" href="/">Go to Homepage</Link>
          <Link className="rounded-md border px-4 py-2" href="/portfolio">View Portfolio</Link>
        </div>
      </main>
      <GlobalFooter config={footer} />
    </>
  );
}
