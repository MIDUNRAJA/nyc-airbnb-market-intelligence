import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart3, ExternalLink, Loader2, Info, Rocket,
  Wallet, Layers, MapPin, LineChart, PieChart, CheckCircle2
} from 'lucide-react';
import { Reveal, SpotlightCard, TiltCard } from './Effects';
import { SectionHeading, Chip, IconTile, MagneticButton } from './ui';
import { TABLEAU_URL, TABLEAU_DASHBOARD_NAME, toEmbedUrl } from '../data/tableau';

/* The six worksheets specified in tableau/TABLEAU_DASHBOARD_GUIDE.md */
const SHEETS = [
  {
    name: 'KPI_Summary',
    title: 'Executive KPI Cards',
    icon: Wallet,
    gradient: 'from-airbnb-coral to-airbnb-orange',
    desc: 'Valid listings, median & average nightly rate, borough count.',
  },
  {
    name: 'Borough_Price_Comparison',
    title: 'Borough Price Comparison',
    icon: BarChart3,
    gradient: 'from-accent-violet to-accent-indigo',
    desc: 'Median nightly price ranked across the 5 NYC boroughs.',
  },
  {
    name: 'Room_Type_Pricing',
    title: 'Room Type Pricing',
    icon: Layers,
    gradient: 'from-accent-indigo to-accent-cyan',
    desc: 'Average price by room exclusivity tier.',
  },
  {
    name: 'Neighbourhood_Rankings',
    title: 'Top 10 Neighbourhoods',
    icon: MapPin,
    gradient: 'from-airbnb-teal to-accent-cyan',
    desc: 'Most expensive micro-markets (n ≥ 25 listings).',
  },
  {
    name: 'Availability_vs_Price',
    title: 'Availability vs. Price',
    icon: LineChart,
    gradient: 'from-accent-pink to-accent-violet',
    desc: 'Annual availability scatter with trend line.',
  },
  {
    name: 'Room_Type_Distribution',
    title: 'Room Type Composition',
    icon: PieChart,
    gradient: 'from-airbnb-orange to-accent-pink',
    desc: 'Inventory mix by borough (100% stacked bar).',
  },
];

export default function TableauDashboard() {
  const [src, setSrc] = useState(TABLEAU_URL || '');
  const [phase, setPhase] = useState(TABLEAU_URL ? 'loading' : 'unconfigured');

  /* Runtime override: allow a drop-in `frontend/public/tableau.config.json` */
  useEffect(() => {
    if (TABLEAU_URL) return undefined;
    let alive = true;
    fetch('/tableau.config.json', { cache: 'no-store' })
      .then((r) => {
        const ct = r.headers.get('content-type') || '';
        return r.ok && ct.includes('json') ? r.json() : null;
      })
      .then((cfg) => {
        if (alive && cfg && cfg.url) {
          setSrc(toEmbedUrl(cfg.url));
          setPhase('loading');
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const statusChip = {
    ready: { tone: 'emerald', icon: CheckCircle2, label: 'Live Tableau Embed' },
    loading: { tone: 'amber', icon: Loader2, label: 'Loading Workbook…' },
    unconfigured: { tone: 'neutral', icon: Info, label: 'Awaiting Public URL' },
  }[phase];

  return (
    <div className="space-y-8 pb-14 max-w-7xl mx-auto">
      <SectionHeading
        eyebrow="Rubric Requirement: Tableau / Power BI Visual Analytics"
        eyebrowIcon={BarChart3}
        title="Interactive"
        accent="Tableau Dashboard"
        subtitle="The published Tableau Public workbook, embedded live: executive KPIs, borough and neighbourhood price rankings, room exclusivity pricing, availability scatter and inventory composition."
        right={
          <Chip tone={statusChip.tone} icon={statusChip.icon}>
            {statusChip.label}
          </Chip>
        }
      />

      {/* Embed surface -------------------------------------------------- */}
      {src && (
        <Reveal>
          <div className="bg-white rounded-3xl border border-airbnb-border shadow-card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 p-5 sm:p-6 border-b border-ink-100">
              <div className="flex items-center gap-3">
                <IconTile icon={BarChart3} gradient="from-accent-violet to-airbnb-coral" />
                <div>
                  <h2 className="font-display text-sm font-bold text-ink-900">{TABLEAU_DASHBOARD_NAME}</h2>
                  <p className="text-[11px] text-ink-400">Published to Tableau Public · live interactive workbook</p>
                </div>
              </div>
              <MagneticButton
                as="a"
                strength={0.2}
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-airbnb-coral to-accent-violet text-white text-xs font-bold shadow-md shadow-red-500/20 hover:shadow-lg transition-shadow"
              >
                Open in Tableau Public
                <ExternalLink className="w-3.5 h-3.5" />
              </MagneticButton>
            </div>
            <div className="relative w-full bg-white" style={{ height: 'min(80vh, 920px)' }}>
              {phase !== 'ready' && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white">
                  <Loader2 className="w-5 h-5 text-amber-600 animate-spin" />
                  <p className="text-xs font-semibold text-ink-500">Loading Tableau workbook…</p>
                </div>
              )}
              {/* Plain iframe: the /views/ embed URL is the only Tableau Public
                  path served without X-Frame-Options, so it renders inline. */}
              <iframe
                title={TABLEAU_DASHBOARD_NAME}
                src={src}
                onLoad={() => setPhase('ready')}
                allowFullScreen
                loading="eager"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </Reveal>
      )}

      {phase === 'unconfigured' && (
        <Reveal>
          <SpotlightCard className="bg-white rounded-3xl border border-airbnb-border shadow-card p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-3">
              <IconTile icon={Rocket} gradient="from-airbnb-coral to-accent-violet" />
              <div>
                <h2 className="font-display text-sm font-bold text-ink-900">Awaiting your Tableau Public URL</h2>
                <p className="text-[11px] text-ink-400">The embed is fully wired and activates the moment a published workbook is linked.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-ink-50/70 border border-ink-100">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-400 mb-1">Step 1</span>
                <p className="text-ink-600 leading-relaxed">
                  Publish the workbook from Tableau Desktop / Public via{' '}
                  <span className="font-semibold text-ink-900">File → Save to Tableau Public As…</span>
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-ink-50/70 border border-ink-100">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-400 mb-1">Step 2</span>
                <p className="text-ink-600 leading-relaxed">
                  Copy the public share link ending in the dashboard name.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-ink-50/70 border border-ink-100">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-ink-400 mb-1">Step 3</span>
                <p className="text-ink-600 leading-relaxed">
                  Paste it into{' '}
                  <span className="font-mono text-[11px] font-semibold text-ink-900">frontend/src/data/tableau.js</span>{' '}
                  or{' '}
                  <span className="font-mono text-[11px] font-semibold text-ink-900">frontend/public/tableau.config.json</span>.
                </p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-ink-900 text-white/90 font-mono text-[11px] overflow-x-auto">
              <span className="text-white/40">// frontend/src/data/tableau.js</span>
              <br />
              <span className="text-airbnb-coral">export const</span> TABLEAU_URL ={' '}
              <span className="text-emerald-300">'https://public.tableau.com/views/YOUR_WORKBOOK/YOUR_DASHBOARD'</span>;
            </div>
          </SpotlightCard>
        </Reveal>
      )}

      {/* Dashboard specification ---------------------------------------- */}
      <Reveal>
        <SpotlightCard className="bg-white rounded-3xl border border-airbnb-border shadow-card p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-ink-100">
            <IconTile icon={Layers} gradient="from-accent-indigo to-accent-cyan" />
            <div>
              <h2 className="font-display text-sm font-bold text-ink-900">Dashboard Specification — Six Worksheets</h2>
              <p className="text-[11px] text-ink-400">
                Source: <span className="font-mono">tableau/NYC_Airbnb_Market_Insights_2019.twb</span> · data:{' '}
                <span className="font-mono">NYC_Airbnb_Tableau_Data.csv</span> (48,870 rows)
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SHEETS.map((sheet, i) => (
              <Reveal key={sheet.name} delay={i * 60} className="h-full">
                <TiltCard max={6} className="h-full">
                  <div className="group h-full p-5 rounded-2xl border border-ink-100 bg-white hover:border-transparent hover:shadow-soft transition-all duration-300 overflow-hidden relative">
                    <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${sheet.gradient} opacity-70 group-hover:opacity-100 transition-opacity`} />
                    <IconTile icon={sheet.icon} gradient={sheet.gradient} size="sm" className="mb-3" />
                    <h3 className="text-xs font-bold text-ink-900">{sheet.title}</h3>
                    <p className="font-mono text-[10px] text-ink-400 mt-0.5">{sheet.name}</p>
                    <p className="text-[11px] text-ink-500 leading-relaxed pt-2">{sheet.desc}</p>
                  </div>
                </TiltCard>
              </Reveal>
            ))}
          </div>
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              A Tableau dashboard is optimised for desktop viewing. On small screens the embedded workbook can be
              panned horizontally — the same insights are fully available as native charts on the Overview, Research
              Q&amp;A and Statistical Tests tabs.
            </p>
          </div>
        </SpotlightCard>
      </Reveal>
    </div>
  );
}
