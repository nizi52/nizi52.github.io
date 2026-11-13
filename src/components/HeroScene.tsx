import { lazy, Suspense, useEffect, useRef, useState } from 'react';

const Scene = lazy(() => import('./Scene'));

type Mode = 'off' | 'live' | 'still';

function pickMode(): Mode {
  try {
    if (!document.createElement('canvas').getContext('webgl2')) return 'off';
  } catch {
    return 'off';
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'still';
  if ((navigator.hardwareConcurrency ?? 4) < 4) return 'still';
  return 'live';
}

export default function HeroScene({ loading }: { loading: string }) {
  const [mode, setMode] = useState<Mode>('off');
  const [ready, setReady] = useState(false);
  const [count, setCount] = useState(0);
  const [gone, setGone] = useState(false);
  const [light, setLight] = useState(() => document.documentElement.dataset.theme === 'light');
  const done = ready && count >= 100;

  useEffect(() => {
    const root = document.documentElement;
    const read = () => setLight(root.dataset.theme === 'light');
    read();
    const watch = new MutationObserver(read);
    watch.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
    return () => watch.disconnect();
  }, []);
  // 0 at the top of the page, 1 once the first screen has scrolled away: the painting steps back
  const depth = useRef(0);

  useEffect(() => {
    setMode(pickMode());
  }, []);

  useEffect(() => {
    if (mode === 'off') return;
    const onScroll = () => {
      depth.current = Math.min(1, Math.max(0, window.scrollY / window.innerHeight));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [mode]);

  useEffect(() => {
    if (mode !== 'live') return;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 1100);
      setCount(Math.round((ready ? p : Math.min(p, 0.9)) * 100));
      if (p < 1 || !ready) raf = requestAnimationFrame(tick);
      else setTimeout(() => setGone(true), 800);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode, ready]);

  if (mode === 'off') return null;

  return (
    <>
      <div className="fixed inset-0 -z-10" aria-hidden="true">
        <Suspense fallback={null}>
          <Scene
            scroll={depth}
            go={mode === 'still' || (ready && count >= 100)}
            still={mode === 'still'}
            light={light}
            onReady={() => setReady(true)}
          />
        </Suspense>
      </div>
      {mode === 'live' && !gone && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-24 bg-bg p-6"
          style={{
            transform: done ? 'translateY(-100%)' : 'none',
            transition: 'transform 0.7s cubic-bezier(0.76, 0, 0.24, 1)',
            pointerEvents: 'none',
          }}
        >
          <div className="bh">
            <div className="bh-hole">
              <div className="bh-circle" />
              <div className="bh-disc" />
            </div>
            <div className="bh-curve">
              <svg viewBox="0 0 500 500">
                <path id="loading-curve" d="M73.2,148.6c4-6.1,65.5-96.8,178.6-95.6c111.3,1.2,170.8,90.3,175.1,97" />
                <text width={500}>
                  <textPath href="#loading-curve">{loading}</textPath>
                </text>
              </svg>
            </div>
          </div>
          <span className="display text-5xl tabular-nums text-muted">{String(count).padStart(3, '0')}</span>
        </div>
      )}
    </>
  );
}
