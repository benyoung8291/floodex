import { lazy, Suspense, useEffect, useState } from 'react';

/**
 * Thin /jobs/:id entry. Lovable preview prerenders matched dynamic routes on
 * document load (hard-reload / new tab). The full JobDetail graph (recharts,
 * 10+ data hooks, dialogs) must not evaluate during that pass — a throw there
 * becomes a host-level plain-text "Internal Server Error" with no React shell.
 *
 * PR #7 already lazy-loaded fabric (PhotoGallery / FloorPlanGallery). That was
 * not enough: the host still evaluated this module. Keep this file free of
 * router hooks, auth, and browser-only libs. Hydrate a skeleton, then load
 * the real page on the client only.
 */
export const ssr = false;

const JobDetailContent = lazy(() => import('./JobDetailContent'));

function JobDetailSkeleton() {
  return (
    <div className="p-4 space-y-6" aria-busy="true" aria-label="Loading job">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-md bg-muted animate-pulse" />
        <div className="h-8 w-48 rounded-md bg-muted animate-pulse" />
      </div>
      <div className="h-48 w-full rounded-xl bg-muted/70 animate-pulse" />
      <div className="h-32 w-full rounded-xl bg-muted/60 animate-pulse" />
    </div>
  );
}

export default function JobDetail() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <JobDetailSkeleton />;
  }

  return (
    <Suspense fallback={<JobDetailSkeleton />}>
      <JobDetailContent />
    </Suspense>
  );
}
