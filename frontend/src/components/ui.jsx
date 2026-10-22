import React, { useCallback, useRef } from 'react';
import { CountUp, Reveal, SpotlightCard, TiltCard, useReducedMotion } from './Effects';

/* ------------------------------------------------------------------ *
 * Shared presentation primitives. One visual language for every page.
 * ------------------------------------------------------------------ */

const CHIP_TONES = {
  coral: 'bg-rose-50 text-airbnb-coral border-rose-100',
  teal: 'bg-teal-50 text-airbnb-teal border-teal-100',
  violet: 'bg-purple-50 text-purple-700 border-purple-100',
  amber: 'bg-amber-50 text-amber-700 border-amber-100',
  neutral: 'bg-stone-100 text-stone-700 border-stone-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
};

export function Chip({ children, icon: Icon, tone = 'coral', className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold tracking-wide ${CHIP_TONES[tone] || CHIP_TONES.coral} ${className}`}
    >
      {Icon ? <Icon className="w-3.5 h-3.5 shrink-0" /> : null}
      <span>{children}</span>
    </span>
  );
}

const TILE_SIZES = {
  sm: 'w-8 h-8 rounded-lg',
  md: 'w-9 h-9 rounded-xl',
  lg: 'w-11 h-11 rounded-2xl',
};
const TILE_ICONS = { sm: 'w-4 h-4', md: 'w-4 h-4', lg: 'w-5 h-5' };

export function IconTile({ icon: Icon, gradient = 'from-airbnb-coral to-accent-violet', size = 'md', className = '' }) {
  return (
    <div
      className={`shrink-0 ${TILE_SIZES[size]} bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-sm ${className}`}
    >
      <Icon className={TILE_ICONS[size]} />
    </div>
  );
}

/**
 * Consistent page/section heading: eyebrow chip, display title with gradient
 * accent, gradient rule, optional subtitle copy and right-aligned actions.
 */
export function SectionHeading({ eyebrow, eyebrowIcon, title, accent, subtitle, right, className = '' }) {
  return (
    <Reveal className={className}>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          {eyebrow ? <Chip icon={eyebrowIcon}>{eyebrow}</Chip> : null}
          <h1 className="font-display text-2xl sm:text-3xl lg:text-[2.35rem] font-bold tracking-tight text-ink-900 leading-[1.12]">
            {title}
            {accent ? (
              <>
                {' '}
                <span className="text-gradient">{accent}</span>
              </>
            ) : null}
          </h1>
          <div className="h-1 w-16 rounded-full bg-gradient-to-r from-airbnb-coral via-airbnb-orange to-accent-violet" />
          {subtitle ? <p className="text-sm text-ink-500 leading-relaxed max-w-3xl">{subtitle}</p> : null}
        </div>
        {right ? <div className="shrink-0 w-full lg:w-auto">{right}</div> : null}
      </div>
    </Reveal>
  );
}

/**
 * Button that gently attracts toward the pointer while hovered.
 */
export function MagneticButton({
  children,
  className = '',
  strength = 0.28,
  as: Tag = 'button',
  onClick,
  disabled,
  type = 'button',
  ...rest
}) {
  const ref = useRef(null);
  const reduced = useReducedMotion();

  const onMove = useCallback(
    (e) => {
      const node = ref.current;
      if (!node || reduced || disabled) return;
      const rect = node.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      node.style.transform = `translate3d(${(dx * strength).toFixed(2)}px, ${(dy * strength).toFixed(2)}px, 0)`;
    },
    [strength, reduced, disabled]
  );

  const onLeave = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    node.style.transform = 'translate3d(0, 0, 0)';
  }, []);

  return (
    <Tag
      ref={ref}
      type={Tag === 'button' ? type : undefined}
      onClick={onClick}
      disabled={Tag === 'button' ? disabled : undefined}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`transition-transform duration-200 ease-out will-change-transform ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * Premium stat card: spotlight + tilt + count-up, used across KPI grids.
 */
export function StatTile({
  label,
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  text,
  hint,
  icon,
  gradient = 'from-airbnb-coral to-accent-violet',
  tint = 'bg-rose-50 text-airbnb-coral',
  className = '',
}) {
  return (
    <TiltCard max={6} className="h-full">
      <SpotlightCard
        className={`h-full bg-white rounded-2xl p-5 sm:p-6 border border-airbnb-border shadow-card hover:shadow-soft transition-shadow duration-300 ${className}`}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400">{label}</span>
          {icon ? (
            <div className={`p-2 rounded-xl ${tint} transition-transform duration-300 hover:scale-110`}>
              {React.createElement(icon, { className: 'w-4 h-4' })}
            </div>
          ) : null}
        </div>
        <div className="font-display text-2xl sm:text-3xl font-bold text-ink-900">
          {text ? text : <CountUp value={value} prefix={prefix} suffix={suffix} decimals={decimals} />}
        </div>
        {hint ? <div className="mt-2 text-xs text-ink-400 leading-relaxed">{hint}</div> : null}
        <div className={`mt-4 h-1 w-full rounded-full bg-gradient-to-r ${gradient} opacity-70`} />
      </SpotlightCard>
    </TiltCard>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded-xl ${className}`} />;
}

export function EmptyState({ icon: Icon, title, message, action, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl p-12 text-center border border-airbnb-border shadow-card space-y-3 ${className}`}>
      {Icon ? (
        <div className="w-12 h-12 mx-auto rounded-2xl bg-stone-100 flex items-center justify-center">
          <Icon className="w-6 h-6 text-ink-400" />
        </div>
      ) : null}
      <p className="text-base font-bold text-ink-700">{title}</p>
      {message ? <p className="text-xs text-ink-400 max-w-md mx-auto leading-relaxed">{message}</p> : null}
      {action ? <div className="pt-2">{action}</div> : null}
    </div>
  );
}

/**
 * Styled segmented control used for chart/table view switches.
 */
export function SegmentedControl({ options, value, onChange, className = '' }) {
  return (
    <div className={`inline-flex gap-1 p-1 bg-ink-100/70 rounded-xl text-[11px] font-bold ${className}`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 rounded-lg transition-all duration-200 ${
            value === opt.value ? 'bg-white text-ink-900 shadow-xs' : 'text-ink-500 hover:text-ink-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
