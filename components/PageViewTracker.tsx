'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function PageViewTracker() {
  const pathname = usePathname();
  const previous = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || previous.current === pathname) return;
    previous.current = pathname;
    if (!/^\/(?:$|(?:about|contact|graphics|portfolio|tutorial)(?:\/|$))/.test(pathname)) return;
    void fetch('/api/page-view', {
      method: 'POST',
      body: pathname,
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
