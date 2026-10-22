import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Database, Cpu, Layers } from 'lucide-react';
import Navbar from './components/Navbar';
import Overview from './components/Overview';
import ExploreMarket from './components/ExploreMarket';
import ResearchQuestions from './components/ResearchQuestions';
import StatisticalEvidence from './components/StatisticalEvidence';
import PricePrediction from './components/PricePrediction';
import MarketExplorer from './components/MarketExplorer';
import TableauDashboard from './components/TableauDashboard';
import AboutStudy from './components/AboutStudy';
import { AuroraBackground, CursorGlow, ScrollProgress } from './components/Effects';
import defaultData from './data/analysis_results.json';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [apiOnline, setApiOnline] = useState(false);
  const [data, setData] = useState(defaultData);

  useEffect(() => {
    // Check if backend API is running
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) throw new Error('API offline');
        return res.json();
      })
      .then(() => {
        setApiOnline(true);
        // Also fetch live master summary
        fetch('/api/summary')
          .then((r) => r.json())
          .then((summary) => {
            setData((prev) => ({ ...prev, project: summary }));
          })
          .catch(() => {});
      })
      .catch(() => {
        setApiOnline(false);
      });
  }, []);

  // Scroll to top whenever the active section changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  return (
    <div className="relative min-h-screen flex flex-col text-[#222222]">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>

      {/* Ambient + cursor-reactive layers */}
      <AuroraBackground />
      <CursorGlow />
      <ScrollProgress />

      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} apiOnline={apiOnline} />

      {/* Main Content Container */}
      <main
        id="main"
        tabIndex={-1}
        className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 focus:outline-none"
      >
        <div key={activeTab} className="page-enter">
          {activeTab === 'overview' && <Overview data={data} setActiveTab={setActiveTab} />}
          {activeTab === 'explore' && <ExploreMarket apiOnline={apiOnline} />}
          {activeTab === 'questions' && <ResearchQuestions data={data} />}
          {activeTab === 'evidence' && <StatisticalEvidence data={data} />}
          {activeTab === 'predict' && <PricePrediction data={data} apiOnline={apiOnline} />}
          {activeTab === 'compare' && <MarketExplorer data={data} />}
          {activeTab === 'tableau' && <TableauDashboard />}
          {activeTab === 'about' && <AboutStudy />}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-auto pt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-ink-900 text-white px-6 sm:px-10 py-9 border border-white/10 shadow-soft">
            <div className="absolute -top-24 -right-16 w-72 h-72 rounded-full bg-airbnb-coral/30 blur-[90px]" />
            <div className="absolute -bottom-24 -left-10 w-72 h-72 rounded-full bg-accent-violet/25 blur-[90px]" />
            <div className="absolute inset-0 bg-grid opacity-40" />

            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="max-w-lg space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-semibold tracking-wide text-white/90">
                  <Layers className="w-3.5 h-3.5 text-airbnb-coral" />
                  <span>Foundations of Data Science · Final Case Study</span>
                </div>
                <h3 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
                  NYC Airbnb <span className="text-gradient">Market Intelligence</span>
                </h3>
                <p className="text-sm text-white/60 leading-relaxed">
                  A full-stack statistical investigation of 48,870 verified listings — exploratory analysis,
                  inferential testing, ensemble price modelling, and interactive submarket discovery.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {['Python', 'Flask', 'React', 'Recharts', 'scikit-learn', 'Tableau'].map((t) => (
                    <span
                      key={t}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/70"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 lg:w-80 shrink-0">
                {[
                  { icon: Database, label: 'Listings', value: '48,870' },
                  { icon: Cpu, label: 'Models', value: '4 Trained' },
                  { icon: Layers, label: 'Questions', value: '18 Solved' },
                  { icon: ArrowUpRight, label: 'Tests', value: '14 Registered' },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3 hover:bg-white/10 hover:border-airbnb-coral/40 transition-colors"
                  >
                    <s.icon className="w-4 h-4 text-airbnb-coral mb-1.5" />
                    <div className="font-display text-lg font-bold">{s.value}</div>
                    <div className="text-[10px] uppercase tracking-wider text-white/50">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative mt-8 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/45">
              <span className="font-semibold text-white/70">23CSE351 — Foundations of Data Science</span>
              <div className="flex items-center gap-3">
                <span>Tableau Integration Ready</span>
                <span className="w-1 h-1 rounded-full bg-white/30" />
                <span>Supervised ML Models</span>
                <span className="w-1 h-1 rounded-full bg-white/30" />
                <span>Interactive Analytics Platform</span>
              </div>
            </div>
          </div>

          <div className="py-6 text-center text-[11px] text-ink-400">
            Built for academic evaluation · Data source: NYC Airbnb Open Data (2019)
          </div>
        </div>
      </footer>
    </div>
  );
}
