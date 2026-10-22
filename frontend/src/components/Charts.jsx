import React from 'react';
import { SpotlightCard } from './Effects';
import { IconTile } from './ui';

/* ------------------------------------------------------------------ *
 * Unified chart theme. One source of truth for grid, axis and tooltip
 * styling across every Recharts visualisation in the application.
 * ------------------------------------------------------------------ */

export const CHART = {
  coral: '#FF5A5F',
  coralSoft: '#FFA5A5',
  orange: '#FC642D',
  teal: '#00A699',
  tealSoft: '#A7F3D0',
  violet: '#8B5CF6',
  indigo: '#6366F1',
  cyan: '#06B6D4',
  pink: '#EC4899',
  blue: '#3B82F6',
  amber: '#F59E0B',
  grid: '#EDEFF3',
  axis: '#6B7280',
  axisStrong: '#374151',
};

export const gridStroke = CHART.grid;

export const axisTick = { fontSize: 11, fill: CHART.axis };
export const axisTickStrong = { fontSize: 11, fill: CHART.axisStrong, fontWeight: 600 };

/** Shared tooltip surface so every chart popup looks identical. */
export const tooltipStyle = {
  backgroundColor: 'rgba(255,255,255,0.97)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderRadius: 14,
  border: '1px solid #EBEBEB',
  boxShadow: '0 18px 44px -20px rgba(16,24,40,0.4)',
  fontSize: 12,
  padding: '10px 12px',
};
export const tooltipLabelStyle = { color: '#14161a', fontWeight: 700, marginBottom: 4 };
export const tooltipItemStyle = { color: '#5f6470', fontSize: 11 };

export const legendStyle = { fontSize: 11, paddingTop: 8 };

/**
 * Themed card wrapper for every chart: icon chip, title, subtitle,
 * optional badge and trailing controls, with the shared spotlight surface.
 */
export function ChartCard({
  icon,
  gradient = 'from-airbnb-coral to-accent-violet',
  title,
  subtitle,
  badge,
  right,
  children,
  className = '',
  bodyClassName = '',
}) {
  return (
    <SpotlightCard className={`h-full bg-white rounded-2xl p-5 sm:p-6 border border-airbnb-border shadow-card ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          {icon ? <IconTile icon={icon} gradient={gradient} /> : null}
          <div className="min-w-0">
            <h2 className="font-display text-sm font-bold text-ink-900 truncate">{title}</h2>
            {subtitle ? <p className="text-[11px] text-ink-400 leading-snug">{subtitle}</p> : null}
          </div>
        </div>
        {right || badge ? (
          <div className="shrink-0 flex items-center gap-2">
            {badge ? (
              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-ink-100 text-ink-500 uppercase tracking-wide">
                {badge}
              </span>
            ) : null}
            {right}
          </div>
        ) : null}
      </div>
      <div className={bodyClassName}>{children}</div>
    </SpotlightCard>
  );
}

/** Inline legend row used beneath charts where Recharts legend is hidden. */
export function ChartLegend({ items }) {
  return (
    <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-ink-500">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded"
            style={{ backgroundColor: item.color, opacity: item.soft ? 0.5 : 1 }}
          />
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
