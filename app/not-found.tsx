import Link from 'next/link';
import type { Metadata } from 'next';
import GlobalFooter from '@/components/shared/GlobalFooter';
import { getGlobalFooterConfig } from '@/lib/footer-content';
import { getServerSettingMap } from '@/lib/server-site-settings';

export const metadata: Metadata = {
  title: { absolute: 'Page Not Found | Md. Minhajul Hoque' },
  description: 'The requested page could not be found on the portfolio of Md. Minhajul Hoque.',
  alternates: { canonical: './' },
};

export default async function NotFound() {
  const footer = getGlobalFooterConfig(await getServerSettingMap());

  return (
    <>
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
