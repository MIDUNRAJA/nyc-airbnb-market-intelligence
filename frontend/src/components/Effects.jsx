import React, { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Returns true when the user prefers reduced motion.
 */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener?.('change', update);
    return () => mq.removeEventListener?.('change', update);
  }, []);
  return reduced;
}

/* ------------------------------------------------------------------ *
 * Shared input bus: a single listener serves every subscribed element
 * so parallax/interactive components never add their own event spam.
 * ------------------------------------------------------------------ */
const pointerBus = { x: 0, y: 0, subs: new Set(), bound: false };
const scrollBus = { y: 0, subs: new Set(), bound: false, raf: 0 };

function ensurePointerBus() {
  if (pointerBus.bound || typeof window === 'undefined') return;
  pointerBus.bound = true;
  window.addEventListener(
    'pointermove',
    (e) => {
      pointerBus.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointerBus.y = (e.clientY / window.innerHeight) * 2 - 1;
      pointerBus.subs.forEach((fn) => fn(pointerBus.x, pointerBus.y));
    },
    { passive: true }
  );
}

function ensureScrollBus() {
  if (scrollBus.bound || typeof window === 'undefined') return;
  scrollBus.bound = true;
  const flush = () => {
    scrollBus.raf = 0;
    scrollBus.y = window.scrollY;
    scrollBus.subs.forEach((fn) => fn(scrollBus.y));
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!scrollBus.raf) scrollBus.raf = requestAnimationFrame(flush);
    },
    { passive: true }
  );
  flush();
}

function usePointerBus(handler) {
  useEffect(() => {
    ensurePointerBus();
    pointerBus.subs.add(handler);
    return () => pointerBus.subs.delete(handler);
  }, [handler]);
}

function useScrollBus(handler) {
  useEffect(() => {
    ensureScrollBus();
    scrollBus.subs.add(handler);
    return () => scrollBus.subs.delete(handler);
  }, [handler]);
}

/**
 * Ambient radial glow + trailing ring that follow the cursor and react to
 * interactive elements. Disabled entirely on touch devices.
 */
export function CursorGlow() {
  const glowRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return undefined;

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const glow = { x: target.x, y: target.y };
    const ring = { x: target.x, y: target.y };
    let rafId = 0;
    let visible = false;

    const onMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visible) {
        visible = true;
        if (glowRef.current) glowRef.current.style.opacity = '1';
        if (ringRef.current) ringRef.current.style.opacity = '1';
      }
    };
    const onOver = (e) => {
      const el =
        e.target instanceof Element
          ? e.target.closest('a, button, input, select, textarea, [data-cursor]')
          : null;
      ringRef.current?.classList.toggle('is-hover', Boolean(el));
    };
    const onDown = () => ringRef.current?.classList.add('is-down');
    const onUp = () => ringRef.current?.classList.remove('is-down');
    const onLeave = () => {
      visible = false;
      if (glowRef.current) glowRef.current.style.opacity = '0';
      if (ringRef.current) ringRef.current.style.opacity = '0';
    };

    const loop = () => {
      glow.x += (target.x - glow.x) * 0.12;
      glow.y += (target.y - glow.y) * 0.12;
      ring.x += (target.x - ring.x) * 0.3;
      ring.y += (target.y - ring.y) * 0.3;
      if (glowRef.current)
        glowRef.current.style.transform = `translate3d(${glow.x}px, ${glow.y}px, 0) translate(-50%, -50%)`;
      if (ringRef.current)
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%)`;
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerover', onOver, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    document.addEventListener('mouseleave', onLeave);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerover', onOver);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <>
      <div ref={glowRef} className="cursor-glow" style={{ opacity: 0 }} aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" style={{ opacity: 0 }} aria-hidden="true" />
    </>
  );
}

/**
 * Thin gradient progress bar pinned to the top of the viewport.
 */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const handler = useCallback(() => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    setProgress(scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0);
  }, []);
  useScrollBus(handler);

  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] z-[70] pointer-events-none">
      <div
        className="h-full rounded-r-full transition-[width] duration-150 ease-out"
        style={{
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #FF5A5F, #FC642D, #8B5CF6, #06B6D4)',
          boxShadow: '0 0 14px rgba(255,90,95,0.6)',
        }}
      />
    </div>
  );
}

/**
 * Fixed ambient aurora blobs + dot grid rendered behind all content.
 */
export function AuroraBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      <div className="absolute inset-0 bg-dots opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/60" />
      <div className="absolute -top-40 -left-32 w-[42rem] h-[42rem] rounded-full bg-airbnb-coral/20 blur-[130px] animate-blob" />
      <div
        className="absolute top-1/4 -right-40 w-[38rem] h-[38rem] rounded-full bg-accent-violet/20 blur-[130px] animate-blob"
        style={{ animationDelay: '-6s' }}
      />
      <div
        className="absolute bottom-0 left-1/3 w-[34rem] h-[34rem] rounded-full bg-airbnb-teal/15 blur-[130px] animate-blob"
        style={{ animationDelay: '-11s' }}
      />
      <div
        className="absolute top-2/3 left-10 w-[28rem] h-[28rem] rounded-full bg-accent-pink/10 blur-[120px] animate-blob"
        style={{ animationDelay: '-3s' }}
      />
    </div>
  );
}

/**
 * Fade + rise on scroll into view, with optional stagger delay (ms).
 */
export function Reveal({ children, className = '', delay = 0, as: Tag = 'div', style, ...rest }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * Word-by-word staggered text reveal, triggered when scrolled into view.
 */
export function RevealText({ text, className = '', delay = 0, stagger = 55, as: Tag = 'span' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const words = String(text || '').split(' ');

  return (
    <Tag ref={ref} className={`reveal-text ${visible ? 'is-visible' : ''} ${className}`}>
      {words.map((word, i) => (
        <React.Fragment key={`${word}-${i}`}>
          <span className="word" style={{ transitionDelay: `${delay + i * stagger}ms` }}>
            {word}
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </React.Fragment>
      ))}
    </Tag>
  );
}

/**
 * Animated count-up numbers that trigger when scrolled into view.
 */
export function CountUp({ value = 0, duration = 1400, decimals = 0, prefix = '', suffix = '', className = '' }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const numeric = Number(value) || 0;

    const run = () => {
      if (reduced) {
        setDisplay(numeric);
        return;
      }
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        setDisplay(numeric * eased);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if (typeof IntersectionObserver === 'undefined') {
      run();
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            run();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [value, duration, reduced]);

  const formatted =
    decimals > 0 ? display.toFixed(decimals) : Math.round(display).toLocaleString('en-US');

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

/**
 * Card whose surface highlights under the cursor.
 */
export function SpotlightCard({ children, className = '', style, ...rest }) {
  const ref = useRef(null);

  const onMove = useCallback((e) => {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    node.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    node.style.setProperty('--my', `${e.clientY - rect.top}px`);
  }, []);

  return (
    <div ref={ref} onMouseMove={onMove} className={`spotlight-card ${className}`} style={style} {...rest}>
      {children}
    </div>
  );
}

/**
 * Subtle 3D tilt on hover, great for hero/stat cards.
 */
export function TiltCard({ children, className = '', max = 7, scale = 1.02, style, ...rest }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  const onMove = useCallback(
    (e) => {
      const node = ref.current;
      if (!node || reduced) return;
      const rect = node.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      node.style.transform = `perspective(900px) rotateX(${-py * max}deg) rotateY(${px * max}deg) scale(${scale})`;
    },
    [max, scale, reduced]
  );

  const onLeave = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    node.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)';
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`tilt ${className}`}
      style={style}
      {...rest}
    >
      {children}
    </div>
  );
}

/**
 * Translates its children based on pointer position for layered depth.
 * Uses the shared pointer bus (single global listener).
 */
export function MouseParallax({ children, strength = 14, className = '', style, ...rest }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  const handler = useCallback(
    (nx, ny) => {
      const node = ref.current;
      if (!node || reduced) return;
      node.style.transform = `translate3d(${(nx * strength).toFixed(2)}px, ${(ny * strength).toFixed(2)}px, 0)`;
    },
    [strength, reduced]
  );
  usePointerBus(handler);

  return (
    <div ref={ref} className={className} style={{ willChange: 'transform', ...style }} {...rest}>
      {children}
    </div>
  );
}

/**
 * Scroll-linked parallax. Measures a non-transformed outer wrapper so the
 * transform never feeds back into its own measurement.
 */
export function Parallax({ children, speed = 0.12, className = '', style, ...rest }) {
  const outerRef = useRef(null);
  const innerRef = useRef(null);
  const reduced = useReducedMotion();

  const handler = useCallback(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner || reduced) return;
    const rect = outer.getBoundingClientRect();
    const distanceFromCenter = rect.top + rect.height / 2 - window.innerHeight / 2;
    inner.style.transform = `translate3d(0, ${(-distanceFromCenter * speed).toFixed(2)}px, 0)`;
  }, [speed, reduced]);

  useScrollBus(handler);

  useEffect(() => {
    handler();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [handler]);

  return (
    <div ref={outerRef} className={className} style={style} {...rest}>
      <div ref={innerRef} style={{ willChange: 'transform' }}>
        {children}
      </div>
    </div>
  );
}

/**
 * Seamless infinite marquee. Children are rendered twice so the -50%
 * keyframe loop is perfectly continuous.
 */
export function Marquee({ children, duration = 34, className = '' }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="marquee-track" style={{ animationDuration: `${duration}s` }}>
        <div className="flex items-center gap-10 pr-10 shrink-0">{children}</div>
        <div className="flex items-center gap-10 pr-10 shrink-0" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
