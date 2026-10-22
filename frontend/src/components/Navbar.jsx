import React, { useEffect, useState } from 'react';
import { Home, Compass, HelpCircle, Activity, Calculator, Columns, BarChart3, Info } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, apiOnline }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { id: 'overview', label: 'Overview', full: 'Overview', short: 'Home', icon: Home },
    { id: 'explore', label: 'Explore', full: 'Explore Market', short: 'Explore', icon: Compass },
    { id: 'questions', label: 'Q&A (18)', full: 'Research Questions (18 solved)', short: 'Q&A', icon: HelpCircle },
    { id: 'evidence', label: 'Tests', full: 'Statistical Tests', short: 'Tests', icon: Activity },
    { id: 'predict', label: 'Predict', full: 'Price Prediction', short: 'Predict', icon: Calculator },
    { id: 'compare', label: 'Compare', full: 'Market Explorer', short: 'Compare', icon: Columns },
    { id: 'tableau', label: 'Tableau', full: 'Tableau Dashboard', short: 'Tableau', icon: BarChart3 },
    { id: 'about', label: 'About', full: 'About Study', short: 'About', icon: Info },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass border-b border-white/60 shadow-[0_8px_30px_-16px_rgba(16,24,40,0.28)]' : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? 'h-16' : 'h-20'}`}>
          {/* Brand Mark & Title */}
          <button
            onClick={() => setActiveTab('overview')}
            className="group flex items-center gap-3 cursor-pointer text-left"
          >
            <div className="relative w-11 h-11 shrink-0">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-airbnb-coral via-airbnb-orange to-accent-violet opacity-90 blur-[10px] group-hover:opacity-100 transition-opacity" />
              <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-airbnb-coral to-accent-violet flex items-center justify-center text-white shadow-lg shadow-red-500/25 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18" />
                  <path d="M5 21V7l8-4v18" />
                  <path d="M19 21V11l-6-4" />
                  <circle cx="9" cy="9" r="1" fill="currentColor" />
                  <circle cx="9" cy="13" r="1" fill="currentColor" />
                  <circle cx="9" cy="17" r="1" fill="currentColor" />
                </svg>
              </div>
            </div>
            <div className="hidden sm:block">
              <span className="font-display text-[17px] font-bold tracking-tight text-ink-900 block leading-tight">
                NYC Airbnb <span className="text-gradient">Market Intelligence</span>
              </span>
              <span className="block text-[11px] text-ink-400 font-medium tracking-wide">
                23CSE351 · Foundations of Data Science
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1 p-1 rounded-2xl bg-white/50 border border-white/70 backdrop-blur-sm min-w-0 overflow-x-auto no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  title={item.full || item.label}
                  aria-label={item.full || item.label}
                  className={`nav-item ${isActive ? 'is-active' : ''} group relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                    isActive
                      ? 'text-white shadow-md shadow-red-500/25'
                      : 'text-ink-500 hover:text-ink-900'
                  }`}
                >
                  {isActive && (
                    <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-airbnb-coral to-accent-violet -z-10" />
                  )}
                  {!isActive && (
                    <span className="absolute inset-0 rounded-xl bg-ink-900/0 group-hover:bg-ink-900/5 -z-10 transition-colors" />
                  )}
                  <Icon className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Live API Status Pill */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-colors ${
                apiOnline
                  ? 'bg-emerald-50/80 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50/80 text-amber-700 border-amber-200'
              }`}
            >
              <span className="relative flex w-2 h-2">
                <span
                  className={`absolute inline-flex w-full h-full rounded-full ${
                    apiOnline ? 'bg-emerald-400 animate-pulse-soft' : 'bg-amber-400'
                  }`}
                />
                <span className={`relative inline-flex w-2 h-2 rounded-full ${apiOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              </span>
              <span className="hidden sm:inline">{apiOnline ? 'API Live' : 'Offline Cache'}</span>
            </div>
          </div>
        </div>

        {/* Mobile / tablet Navigation bar */}
        <div className="xl:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-white/60 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-airbnb-coral to-accent-violet text-white shadow-sm shadow-red-500/20'
                    : 'text-ink-500 hover:bg-white/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.short}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
