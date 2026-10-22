import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import {
  Building2, DollarSign, Bed, Calendar, ArrowUpRight, TrendingUp, ShieldCheck, Sparkles,
  Target, Layers, Gauge, MapPin
} from 'lucide-react';
import { CountUp, Marquee, MouseParallax, Reveal, RevealText, SpotlightCard, TiltCard } from './Effects';
import { MagneticButton } from './ui';

export default function Overview({ data, setActiveTab }) {
  const kpis = data?.project?.kpis || {
    total_listings: 48870,
    median_price: 106,
    mean_price: 152.76,
    capped_mean_price: 143.99,
    total_boroughs: 5,
    total_neighbourhoods: 221,
    most_common_room_type: 'Entire home/apt',
    most_common_room_type_pct: 52.0,
    avg_availability_days: 112.7
  };

  const boroughData = data?.questions?.[1]?.metrics?.borough_table || [
    { neighbourhood_group: 'Manhattan', count: 21654, mean: 182.96, median: 150.0 },
    { neighbourhood_group: 'Brooklyn', count: 20089, mean: 119.43, median: 90.0 },
    { neighbourhood_group: 'Queens', count: 5664, mean: 96.07, median: 75.0 },
    { neighbourhood_group: 'Staten Island', count: 373, mean: 101.8, median: 75.0 },
    { neighbourhood_group: 'Bronx', count: 1090, mean: 85.83, median: 65.0 },
  ];

  const roomData = data?.questions?.[2]?.metrics?.room_type_table || [
    { room_type: 'Entire home/apt', count: 25398, mean: 198.35, median: 160.0 },
    { room_type: 'Private room', count: 22315, mean: 86.03, median: 70.0 },
    { room_type: 'Shared room', count: 1157, mean: 68.61, median: 45.0 },
  ];

  // Price Distribution bins — sourced from the live analytics pipeline (Q1)
  const priceHistogram = data?.questions?.[0]?.chart_data?.price_histogram;
  const priceBins = priceHistogram && priceHistogram.length
    ? priceHistogram.map((b) => ({ range: b.bin_label, count: b.count }))
    : [
        { range: '$10-$59', count: 8591 },
        { range: '$59-$108', count: 15960 },
        { range: '$108-$157', count: 9723 },
        { range: '$157-$207', count: 6330 },
        { range: '$207-$256', count: 3131 },
        { range: '$256-$305', count: 1820 },
        { range: '$305-$355', count: 875 },
        { range: '$355-$404', count: 682 },
        { range: '$404-$453', count: 322 },
        { range: '$453-$503', count: 394 },
        { range: '$503-$552', count: 107 },
        { range: '$552-$601', count: 157 },
        { range: '$601-$651', count: 78 },
        { range: '$651-$700', count: 111 },
        { range: '$700-$749', count: 36 },
        { range: '$749-$799', count: 553 },
      ];

  const marqueeItems = [
    '48,870 Validated Listings', '18 Research Questions', '14 Registered Tests',
    '5 Boroughs · 221 Neighbourhoods', 'Random Forest R² = 0.633',
    "Welch's t-test · Cohen's d = 1.61", 'One-Way ANOVA · η² = 0.136',
    'Chi-Square χ² = 1557.95', 'Log-Linear Price Modelling', 'CLT Convergence Verified'
  ];

  const kpiCards = [
    {
      label: 'Valid Listings',
      icon: Building2,
      gradient: 'from-airbnb-coral to-accent-violet',
      tint: 'bg-rose-50 text-airbnb-coral',
      value: kpis.total_listings,
      footnote: (
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Cleaned from 48,895 raw records</span>
        </span>
      ),
    },
    {
      label: 'Median Nightly Price',
      icon: DollarSign,
      gradient: 'from-airbnb-teal to-accent-cyan',
      tint: 'bg-teal-50 text-airbnb-teal',
      value: kpis.median_price,
      prefix: '$',
      footnote: (
        <span className="flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5 text-airbnb-coral" />
          <span>Mean: ${kpis.capped_mean_price?.toFixed(0)} (Right-skewed)</span>
        </span>
      ),
    },
    {
      label: 'Dominant Room Type',
      icon: Bed,
      gradient: 'from-airbnb-orange to-accent-pink',
      tint: 'bg-amber-50 text-airbnb-orange',
      text: 'Entire home/apt',
      footnote: <span>{kpis.most_common_room_type_pct}% of total NYC inventory</span>,
    },
    {
      label: 'Market Coverage',
      icon: Calendar,
      gradient: 'from-accent-indigo to-accent-violet',
      tint: 'bg-purple-50 text-purple-600',
      value: 5,
      suffix: ' Boroughs',
      footnote: <span>{kpis.total_neighbourhoods} active micro-neighbourhoods</span>,
    },
  ];

  const takeaways = [
    {
      accent: 'text-airbnb-coral',
      bar: 'from-airbnb-coral to-airbnb-orange',
      title: '1. Geographic Premium Gradient',
      body: 'Manhattan listings command a median price of $150/night, representing a 66.7% premium over Brooklyn ($90) and 130.8% over Bronx ($65). One-way ANOVA and Kruskal-Wallis confirm this difference is statistically significant (p < 1e-300).',
    },
    {
      accent: 'text-airbnb-teal',
      bar: 'from-airbnb-teal to-accent-cyan',
      title: '2. Spatial Privacy Premium',
      body: "Entire homes/apartments command a 2.31x premium over private rooms ($198.35 vs $86.03 mean). Welch's t-test yields a massive Cohen's d effect size of 1.61, confirming room type as the strongest non-spatial price driver.",
    },
    {
      accent: 'text-airbnb-orange',
      bar: 'from-airbnb-orange to-accent-pink',
      title: '3. Regulatory Clustering',
      body: "9.2% of listings enforce minimum stays of 30+ nights, directly corresponding to NYC's Multiple Dwelling Law threshold to operate legally outside short-term restriction mandates.",
    },
    {
      accent: 'text-accent-violet',
      bar: 'from-accent-violet to-accent-indigo',
      title: '4. CLT & Normal Convergence',
      body: 'Despite raw prices possessing severe positive skewness (19.12), empirical sampling of sample size n=100 converges to theoretical Gaussian standard error (SE = $12.19), validating inferential normality.',
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner */}
      <Reveal>
        <div className="grain relative overflow-hidden rounded-[28px] bg-ink-900 text-white p-8 sm:p-12 shadow-soft border border-white/10">
          {/* Ambient layers — pointer-parallaxed for depth */}
          <MouseParallax className="absolute inset-0" strength={16} aria-hidden="true">
            <div className="absolute inset-0 bg-grid opacity-50" />
            <div className="absolute -top-28 -left-16 w-[26rem] h-[26rem] rounded-full bg-airbnb-coral/30 blur-[110px] animate-blob" />
            <div
              className="absolute -bottom-32 right-0 w-[26rem] h-[26rem] rounded-full bg-accent-violet/30 blur-[110px] animate-blob"
              style={{ animationDelay: '-8s' }}
            />
            <div className="absolute top-1/3 right-1/4 w-[18rem] h-[18rem] rounded-full bg-airbnb-teal/20 blur-[100px]" />
          </MouseParallax>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm text-[11px] font-semibold tracking-wide text-white/90">
                <Sparkles className="w-3.5 h-3.5 text-airbnb-coral animate-pulse-soft" />
                <span>Foundations of Data Science · Final Case Study</span>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] font-bold tracking-tight leading-[1.05]">
                <RevealText as="span" text="NYC Airbnb" className="block" />
                <Reveal as="span" delay={280} className="block">
                  <span className="text-gradient">Market Intelligence</span>
                </Reveal>
              </h1>

              <p className="text-white/65 text-sm sm:text-base leading-relaxed max-w-xl">
                A comprehensive statistical investigation of 48,870 verified rental listings across New York City.
                Covering exploratory distribution analysis, hypothesis testing, log-linear and ensemble price modelling,
                and interactive submarket discovery.
              </p>

              <div className="flex flex-wrap gap-3 pt-1">
                <MagneticButton
                  onClick={() => setActiveTab('explore')}
                  className="shimmer group inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-airbnb-coral to-airbnb-orange hover:shadow-glow text-white text-xs font-bold"
                >
                  <span>Explore Market Data</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </MagneticButton>
                <MagneticButton
                  strength={0.18}
                  onClick={() => setActiveTab('questions')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/15 hover:border-white/30 backdrop-blur-sm"
                >
                  <span>View 18 Research Questions</span>
                </MagneticButton>
                <MagneticButton
                  strength={0.18}
                  onClick={() => setActiveTab('evidence')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold border border-white/15 hover:border-white/30 backdrop-blur-sm"
                >
                  <span>Statistical Tests</span>
                </MagneticButton>
              </div>
            </div>

            {/* Floating hero stat stack — counter-parallax for depth */}
            <MouseParallax className="lg:col-span-5 relative" strength={-12}>
              <div className="space-y-3.5 animate-float-slow">
                {[
                  { icon: Building2, label: 'Listings Analysed', value: 48870, suffix: '', tint: 'text-airbnb-coral' },
                  { icon: Gauge, label: 'Random Forest R²', value: 0.633, decimals: 3, tint: 'text-airbnb-teal' },
                  { icon: MapPin, label: 'Micro-Neighbourhoods', value: 221, suffix: '', tint: 'text-accent-violet' },
                ].map((s, i) => (
                  <div
                    key={s.label}
                    className="glass-dark rounded-2xl border border-white/10 px-5 py-4 flex items-center justify-between shadow-lg"
                    style={{ transform: `translateX(${i * 12}px)` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
                        <s.icon className={`w-5 h-5 ${s.tint}`} />
                      </div>
                      <span className="text-xs font-semibold text-white/70">{s.label}</span>
                    </div>
                    <span className="font-display text-xl font-bold text-white">
                      <CountUp value={s.value} decimals={s.decimals || 0} suffix={s.suffix} />
                    </span>
                  </div>
                ))}
              </div>
              <div className="absolute -inset-6 -z-10 rounded-[2rem] border border-white/5" />
            </MouseParallax>
          </div>

          {/* Scroll cue */}
          <div className="relative z-10 mt-10 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
            <span className="w-5 h-8 rounded-full border border-white/20 flex justify-center pt-1.5">
              <span className="scroll-cue-dot w-1 h-1 rounded-full bg-airbnb-coral" />
            </span>
            <span>Scroll to explore the analysis</span>
          </div>
        </div>
      </Reveal>

      {/* Capability marquee strip */}
      <div className="relative rounded-2xl bg-white/60 border border-airbnb-border py-3.5">
        <Marquee duration={38}>
          {marqueeItems.map((item) => (
            <span key={item} className="flex items-center gap-3 text-xs font-semibold text-ink-500 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-airbnb-coral/70" />
              {item}
            </span>
          ))}
        </Marquee>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#f6f5f2] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#f6f5f2] to-transparent" />
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {kpiCards.map((card, i) => (
          <Reveal key={card.label} delay={i * 90} className="h-full">
            <TiltCard max={6} className="h-full">
              <SpotlightCard className="h-full bg-white rounded-2xl p-6 border border-airbnb-border shadow-card hover:shadow-soft transition-shadow duration-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-ink-400">{card.label}</span>
                  <div className={`p-2 rounded-xl ${card.tint} transition-transform duration-300 hover:scale-110`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="font-display text-2xl sm:text-3xl font-bold text-ink-900">
                  {card.text ? (
                    card.text
                  ) : (
                    <CountUp value={card.value} prefix={card.prefix || ''} suffix={card.suffix || ''} decimals={card.decimals || 0} />
                  )}
                </div>
                <div className="mt-2 text-xs text-ink-400">{card.footnote}</div>
                <div className={`mt-4 h-1 w-full rounded-full bg-gradient-to-r ${card.gradient} opacity-70`} />
              </SpotlightCard>
            </TiltCard>
          </Reveal>
        ))}
      </div>

      {/* Primary Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Price Distribution */}
        <Reveal className="h-full">
          <SpotlightCard className="h-full bg-white rounded-2xl p-6 border border-airbnb-border shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-airbnb-coral to-airbnb-orange flex items-center justify-center">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-display text-sm font-bold text-ink-900">Listing Price Distribution ($ USD)</h2>
                  <p className="text-[11px] text-ink-400">Severe positive skewness (19.12 raw, normalized via log1p)</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-gray-100 text-ink-500 uppercase tracking-wide">Q1</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priceBins} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="range" tick={{ fontSize: 10 }} interval={2} angle={-25} textAnchor="end" />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(val) => [`${val.toLocaleString()} listings`, 'Count']}
                    contentStyle={{ borderRadius: '10px', fontSize: '12px', border: '1px solid #EBEBEB', boxShadow: '0 12px 30px -12px rgba(16,24,40,0.25)' }}
                  />
                  <Bar dataKey="count" fill="#FF5A5F" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 p-3 rounded-xl bg-gray-50 text-xs text-ink-500 flex justify-between">
              <span><strong>Median:</strong> ${kpis.median_price}</span>
              <span><strong>Mean (Capped):</strong> ${kpis.capped_mean_price}</span>
              <span><strong>Cap:</strong> $799 (99th pct)</span>
            </div>
          </SpotlightCard>
        </Reveal>

        {/* Chart 2: Borough Price Comparison */}
        <Reveal delay={100} className="h-full">
          <SpotlightCard className="h-full bg-white rounded-2xl p-6 border border-airbnb-border shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-airbnb-teal to-accent-cyan flex items-center justify-center">
                  <Layers className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-display text-sm font-bold text-ink-900">Borough Price Comparison</h2>
                  <p className="text-[11px] text-ink-400">Median vs Average nightly rate across the 5 boroughs</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-gray-100 text-ink-500 uppercase tracking-wide">Q2</span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={boroughData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="neighbourhood_group" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(val, name) => [`$${val}`, name === 'median' ? 'Median Price' : 'Mean Price']}
                    contentStyle={{ borderRadius: '10px', fontSize: '12px', border: '1px solid #EBEBEB', boxShadow: '0 12px 30px -12px rgba(16,24,40,0.25)' }}
                  />
                  <Bar dataKey="median" name="Median Price" fill="#00A699" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="mean" name="Mean Price" fill="#FC642D" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 flex items-center justify-center gap-6 text-xs text-ink-500">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-airbnb-teal"></span>
                <span>Median (Robust)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-airbnb-orange"></span>
                <span>Mean (Affected by luxury outliers)</span>
              </div>
            </div>
          </SpotlightCard>
        </Reveal>
      </div>

      {/* Room Type Breakdown & Strategic Takeaways */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Room Types */}
        <Reveal className="h-full">
          <SpotlightCard className="h-full bg-white rounded-2xl p-6 border border-airbnb-border shadow-card space-y-4">
            <div>
              <h2 className="font-display text-sm font-bold text-ink-900">Room Exclusivity Tiers</h2>
              <p className="text-[11px] text-ink-400">Pricing and inventory distribution by accommodation format</p>
            </div>
            <div className="space-y-3">
              {roomData.map((room) => (
                <div
                  key={room.room_type}
                  className="group p-3.5 rounded-xl border border-gray-100 bg-gray-50/60 hover:border-airbnb-coral/30 hover:bg-white transition-colors"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-ink-900">
                    <span>{room.room_type}</span>
                    <span className="text-airbnb-coral font-bold">${room.median} median</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-ink-400 mt-1">
                    <span>{room.count?.toLocaleString()} listings ({((room.count / kpis.total_listings) * 100).toFixed(1)}%)</span>
                    <span>Mean: ${room.mean}</span>
                  </div>
                </div>
              ))}
            </div>
          </SpotlightCard>
        </Reveal>

        {/* Executive Findings */}
        <Reveal delay={100} className="lg:col-span-2 h-full">
          <div className="h-full bg-white rounded-2xl p-6 border border-airbnb-border shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-bold text-ink-900">Core Data Science & Statistical Takeaways</h2>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Verified Calculations
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {takeaways.map((t, i) => (
                <Reveal key={t.title} delay={i * 80} className="h-full">
                  <SpotlightCard className="h-full p-4 rounded-xl border border-gray-100 bg-white shadow-xs space-y-2 hover:border-gray-200 transition-colors">
                    <span className={`text-xs font-bold ${t.accent}`}>{t.title}</span>
                    <p className="text-xs text-ink-500 leading-relaxed">{t.body}</p>
                    <div className={`h-0.5 w-10 rounded-full bg-gradient-to-r ${t.bar}`} />
                  </SpotlightCard>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
