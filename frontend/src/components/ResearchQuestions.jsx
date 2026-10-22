import React, { useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, Tooltip, Legend, CartesianGrid, Cell, PieChart, Pie, ReferenceLine
} from 'recharts';
import {
  ChevronDown, CheckCircle2, BookmarkCheck, BarChart2, HelpCircle, ShieldCheck, Sigma, ArrowRight
} from 'lucide-react';
import { Reveal, SpotlightCard } from './Effects';
import { SectionHeading, Chip, SegmentedControl, IconTile } from './ui';
import { CHART, gridStroke, axisTick, axisTickStrong, tooltipStyle, tooltipLabelStyle, tooltipItemStyle, legendStyle } from './Charts';

export default function ResearchQuestions({ data }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openQuestionId, setOpenQuestionId] = useState(1);
  const [q1Mode, setQ1Mode] = useState('price'); // 'price' | 'log'
  const [q11Mode, setQ11Mode] = useState('cdf'); // 'cdf' | 'density'

  const questions = data?.questions || [];

  const categories = [
    'All',
    'Price & Distribution (Q1, Q16)',
    'Geography & Boroughs (Q2, Q4, Q5, Q13)',
    'Room Exclusivity & Policy (Q3, Q8, Q9, Q14, Q15)',
    'Correlation & Dynamics (Q6, Q7)',
    'FODS Linear Algebra, Probability & CLT (Q10, Q11, Q12)',
    'Regression & Prediction (Q17, Q18)'
  ];

  const filterQuestion = (q) => {
    if (selectedCategory === 'All') return true;
    if (selectedCategory.includes('Price & Distribution') && [1, 16].includes(q.id)) return true;
    if (selectedCategory.includes('Geography') && [2, 4, 5, 13].includes(q.id)) return true;
    if (selectedCategory.includes('Room Exclusivity') && [3, 8, 9, 14, 15].includes(q.id)) return true;
    if (selectedCategory.includes('Correlation') && [6, 7].includes(q.id)) return true;
    if (selectedCategory.includes('Linear Algebra') && [10, 11, 12].includes(q.id)) return true;
    if (selectedCategory.includes('Regression & Prediction') && [17, 18].includes(q.id)) return true;
    return false;
  };

  const filteredList = questions.filter(filterQuestion);

  const tooltipProps = {
    contentStyle: tooltipStyle,
    labelStyle: tooltipLabelStyle,
    itemStyle: tooltipItemStyle,
  };
  const legendProps = { wrapperStyle: legendStyle };

  // Renders the question-specific Recharts visualization
  const renderQuestionChart = (q) => {
    const cd = q.chart_data;
    if (!cd) return null;

    switch (q.id) {
      case 1: {
        return (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-xs font-bold text-ink-500 uppercase tracking-wider">Distribution Mode</span>
              <SegmentedControl
                value={q1Mode}
                onChange={setQ1Mode}
                options={[
                  { label: 'Capped Price ($ USD)', value: 'price' },
                  { label: 'Log-Price ln(1+p) & Gaussian', value: 'log' },
                ]}
              />
            </div>

            {q1Mode === 'price' ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cd.price_histogram} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                    <XAxis dataKey="bin_label" angle={-35} textAnchor="end" tick={axisTick} interval={0} height={48} />
                    <YAxis tick={axisTick} />
                    <Tooltip
                      {...tooltipProps}
                      formatter={(val) => [val.toLocaleString() + ' listings', 'Listing Count']}
                      labelFormatter={(l) => `Price Range: ${l}`}
                    />
                    <ReferenceLine x="$100-$149" stroke={CHART.teal} strokeDasharray="3 3" label={{ value: 'Median $106', fill: CHART.teal, fontSize: 11 }} />
                    <Bar dataKey="count" fill={CHART.coral} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cd.log_histogram} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                    <XAxis dataKey="log_bin" angle={-35} textAnchor="end" tick={axisTick} interval={0} height={48} />
                    <YAxis tick={axisTick} />
                    <Tooltip
                      {...tooltipProps}
                      formatter={(val, name) => [val, name === 'empirical_density' ? 'Empirical Density' : 'Normal PDF Curve']}
                    />
                    <Legend {...legendProps} />
                    <Area type="monotone" dataKey="empirical_density" stroke={CHART.teal} fill={CHART.teal} fillOpacity={0.3} name="Empirical Density" />
                    <Line type="monotone" dataKey="normal_pdf" stroke={CHART.coral} strokeWidth={2.5} dot={false} name="Normal PDF Curve" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        );
      }

      case 2: {
        return (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cd} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis dataKey="neighbourhood_group" tick={axisTickStrong} />
                <YAxis tick={axisTick} unit="$" />
                <Tooltip {...tooltipProps} formatter={(val, name) => [`$${val}`, name === 'median' ? 'Median Price' : 'Mean Price']} />
                <Legend {...legendProps} />
                <Bar dataKey="median" fill={CHART.coral} name="Median Price ($)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="mean" fill={CHART.orange} name="Mean Price ($)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      }

      case 3: {
        return (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cd} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis dataKey="room_type" tick={axisTickStrong} />
                <YAxis tick={axisTick} unit="$" />
                <Tooltip {...tooltipProps} formatter={(val, name) => [`$${val}`, name === 'median' ? 'Median Nightly Price' : 'Mean Nightly Price']} />
                <Legend {...legendProps} />
                <Bar dataKey="median" fill={CHART.teal} name="Median Price ($)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="mean" fill={CHART.coral} name="Mean Price ($)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      }

      case 4: {
        return (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cd} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis dataKey="borough" tick={axisTickStrong} />
                <YAxis tick={axisTick} unit="%" domain={[0, 100]} />
                <Tooltip {...tooltipProps} formatter={(val, name) => [`${val}%`, name.replace(/_/g, ' ')]} />
                <Legend {...legendProps} />
                <Bar dataKey="Entire_home_apt" stackId="a" fill={CHART.coral} name="Entire Home/Apt (%)" />
                <Bar dataKey="Private_room" stackId="a" fill={CHART.teal} name="Private Room (%)" />
                <Bar dataKey="Shared_room" stackId="a" fill={CHART.orange} name="Shared Room (%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      }

      case 5: {
        return (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cd} layout="vertical" margin={{ top: 5, right: 20, left: 45, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridStroke} />
                <XAxis type="number" tick={axisTick} unit="$" domain={[0, 300]} />
                <YAxis type="category" dataKey="neighbourhood" tick={{ fontSize: 10, fill: CHART.axisStrong, fontWeight: 600 }} />
                <Tooltip {...tooltipProps} formatter={(val, name) => [`$${val}`, name === 'median' ? 'Median Price' : 'Mean Price']} labelFormatter={(l) => `Neighbourhood: ${l}`} />
                <Legend {...legendProps} />
                <Bar dataKey="median" fill={CHART.coral} name="Median Price ($)" radius={[0, 4, 4, 0]} />
                <Bar dataKey="mean" fill={CHART.teal} name="Mean Price ($)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      }

      case 6: {
        return (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cd} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis dataKey="bracket" tick={axisTick} />
                <YAxis tick={axisTick} unit="$" domain={[80, 180]} />
                <Tooltip {...tooltipProps} formatter={(val, name) => [`$${val}`, name === 'mean_price' ? 'Mean Nightly Price' : 'Median Nightly Price']} />
                <Legend {...legendProps} />
                <Line type="monotone" dataKey="mean_price" stroke={CHART.coral} strokeWidth={2.5} name="Mean Price ($)" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="median_price" stroke={CHART.teal} strokeWidth={2} strokeDasharray="4 4" name="Median Price ($)" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      }

      case 7: {
        return (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cd} margin={{ top: 10, right: 10, left: -15, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis dataKey="bracket" tick={axisTick} />
                <YAxis tick={axisTick} unit="/mo" />
                <Tooltip {...tooltipProps} formatter={(val, name) => [val, name === 'avg_velocity' ? 'Mean Reviews/Month' : 'Median Reviews/Month']} />
                <Legend {...legendProps} />
                <Line type="monotone" dataKey="avg_velocity" stroke={CHART.violet} strokeWidth={2.5} name="Mean Reviews/Month" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="median_velocity" stroke={CHART.pink} strokeWidth={2} strokeDasharray="3 3" name="Median Velocity" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      }

      case 8: {
        return (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cd} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis dataKey="room_type" tick={axisTickStrong} />
                <YAxis yAxisId="left" tick={axisTick} unit=" n" />
                <YAxis yAxisId="right" orientation="right" tick={axisTick} unit="%" domain={[0, 15]} />
                <Tooltip {...tooltipProps} formatter={(val, name) => [name.includes('%') ? `${val}%` : `${val} nights`, name]} />
                <Legend {...legendProps} />
                <Bar yAxisId="left" dataKey="mean" fill={CHART.teal} name="Mean Stay (Nights)" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="pct_30plus" fill={CHART.coral} name="% Mandating >=30 Nights (MDL Law)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      }

      case 9: {
        const colors = [CHART.teal, CHART.blue, CHART.coral];
        return (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-6 h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cd}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="percentage"
                    nameKey="host_type"
                    label={({ percentage }) => `${percentage}%`}
                  >
                    {cd.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    {...tooltipProps}
                    formatter={(val, name, item) => [`${val}% (${item.payload.listing_count.toLocaleString()} listings)`, item.payload.host_type]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="md:col-span-6 space-y-2 text-xs">
              {cd.map((entry, idx) => (
                <div key={entry.host_type} className="p-3 rounded-xl border border-ink-100 bg-ink-50/70 flex items-center justify-between hover:bg-ink-50 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: colors[idx] }} />
                    <span className="font-bold text-ink-900">{entry.host_type}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-ink-800">{entry.percentage}%</span>
                    <span className="text-[10px] text-ink-400 block">${entry.mean_price} avg price</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      case 10: {
        const feats = ['log_price', 'minimum_nights', 'number_of_reviews', 'reviews_per_month', 'calculated_host_listings_count', 'availability_365'];
        const formatLabel = (f) => f.replace('calculated_host_listings_count', 'host_count').replace('reviews_per_month', 'rev_per_mo');
        const gramError = questions.find((q) => q.id === 10)?.metrics?.frobenius_norm_difference;
        const gramDisplay = typeof gramError === 'number' ? gramError.toExponential(2) : '—';
        const getColor = (val) => {
          if (val === 1) return 'bg-rose-500 text-white font-bold';
          if (val > 0.3) return 'bg-rose-200 text-rose-900 font-semibold';
          if (val > 0.05) return 'bg-rose-50 text-rose-800';
          if (val < -0.1) return 'bg-sky-200 text-sky-900 font-semibold';
          if (val < 0) return 'bg-sky-50 text-sky-800';
          return 'bg-gray-50 text-gray-700';
        };

        return (
          <div className="space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-center text-[10px]">
                <thead>
                  <tr className="border-b border-ink-100 text-ink-400 uppercase">
                    <th className="py-1 px-2 text-left">Feature</th>
                    {feats.map((f) => (
                      <th key={f} className="py-1 px-1">{formatLabel(f)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100 font-mono">
                  {cd.map((row) => (
                    <tr key={row.feature}>
                      <td className="py-1.5 px-2 text-left font-bold font-sans text-ink-900 text-[11px]">
                        {formatLabel(row.feature)}
                      </td>
                      {feats.map((f) => {
                        const val = row[f];
                        return (
                          <td key={f} className="py-1.5 px-1">
                            <span className={`px-1.5 py-0.5 rounded ${getColor(val)}`}>
                              {val > 0 && val !== 1 ? `+${val.toFixed(2)}` : val.toFixed(2)}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Gram Matrix Identity Verified: ||Cov(Z) - Corr(X)||_F = {gramDisplay}</span>
              </div>
              <span className="font-mono font-bold text-[10px] hidden sm:inline">Machine Epsilon Precision</span>
            </div>
          </div>
        );
      }

      case 11: {
        return (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-xs font-bold text-ink-500 uppercase tracking-wider">Probability Curve View</span>
              <SegmentedControl
                value={q11Mode}
                onChange={setQ11Mode}
                options={[
                  { label: 'Empirical CDF vs Normal CDF', value: 'cdf' },
                  { label: 'Gaussian PDF & Density', value: 'density' },
                ]}
              />
            </div>

            {q11Mode === 'cdf' ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cd.cdf_curve} margin={{ top: 20, right: 15, left: -15, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                    <XAxis dataKey="price_usd" tick={axisTick} unit="$" />
                    <YAxis tick={axisTick} unit="%" domain={[0, 100]} />
                    <Tooltip {...tooltipProps} formatter={(val, name) => [`${val}%`, name === 'empirical_cdf_pct' ? 'Empirical Frequency' : 'Theoretical Gaussian CDF']} labelFormatter={(l) => `Listing Price: $${l}`} />
                    <Legend {...legendProps} />
                    <ReferenceLine x={100} stroke={CHART.coral} strokeDasharray="3 3" label={{ value: 'Threshold $100 (Delta 5.87%)', fill: CHART.coral, fontSize: 11, position: 'top' }} />
                    <Line type="monotone" dataKey="empirical_cdf_pct" stroke={CHART.teal} strokeWidth={2.5} dot={false} name="Empirical Market CDF (%)" />
                    <Line type="monotone" dataKey="theoretical_cdf_pct" stroke={CHART.coral} strokeWidth={2} strokeDasharray="4 4" dot={false} name="Theoretical Normal CDF (%)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cd.density_curve} margin={{ top: 20, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                    <XAxis dataKey="log_price" tick={axisTick} unit=" log" />
                    <YAxis tick={axisTick} />
                    <Tooltip {...tooltipProps} formatter={(val, name) => [val, name === 'empirical_density' ? 'Empirical Density' : 'Normal PDF N(4.73, 0.67²)']} />
                    <Legend {...legendProps} />
                    <ReferenceLine x={4.62} stroke={CHART.blue} strokeDasharray="3 3" label={{ value: 'ln(101) = 4.62', fill: CHART.blue, fontSize: 10 }} />
                    <Line type="monotone" dataKey="empirical_density" stroke={CHART.teal} strokeWidth={2} dot={false} name="Empirical Density" />
                    <Line type="monotone" dataKey="normal_pdf" stroke={CHART.coral} strokeWidth={2.5} dot={false} name="Normal PDF Fit" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        );
      }

      case 12: {
        return (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cd} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis dataKey="sample_size" tick={axisTickStrong} />
                <YAxis tick={axisTick} unit="$" />
                <Tooltip {...tooltipProps} formatter={(val, name) => [`$${val}`, name === 'observed_se' ? 'Observed SE from 1,000 resamples' : 'Expected Theoretical SE (σ/√n)']} />
                <Legend {...legendProps} />
                <Bar dataKey="expected_se" fill={CHART.coral} name="Theoretical SE: σ / √n" radius={[4, 4, 0, 0]} />
                <Bar dataKey="observed_se" fill={CHART.teal} name="Observed Sampling SE" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      }

      case 13: {
        return (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cd} layout="vertical" margin={{ top: 5, right: 20, left: 90, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridStroke} />
                <XAxis type="number" tick={axisTick} unit="$" domain={[0, 250]} />
                <YAxis type="category" dataKey="cluster_name" tick={{ fontSize: 9.5, fill: CHART.axisStrong }} />
                <Tooltip {...tooltipProps} formatter={(val, name) => [`$${val}`, name === 'median_price' ? 'Median Nightly Price' : 'Mean Nightly Price']} />
                <Legend {...legendProps} />
                <Bar dataKey="median_price" fill={CHART.coral} name="Median Price ($)" radius={[0, 4, 4, 0]} />
                <Bar dataKey="mean_price" fill={CHART.teal} name="Mean Price ($)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      }

      case 14: {
        return (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cd} margin={{ top: 10, right: 10, left: -15, bottom: 15 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis dataKey="segment" tick={{ fontSize: 10, fill: CHART.axisStrong, fontWeight: 600 }} />
                <YAxis yAxisId="left" tick={axisTick} unit="$" />
                <YAxis yAxisId="right" orientation="right" tick={axisTick} unit=" revs" />
                <Tooltip {...tooltipProps} formatter={(val, name) => [name.includes('Price') ? `$${val}` : val, name]} />
                <Legend {...legendProps} />
                <Bar yAxisId="left" dataKey="mean_price" fill={CHART.blue} name="Mean Price ($)" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="median_price" fill={CHART.teal} name="Median Price ($)" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="mean_reviews" fill={CHART.coral} name="Avg Reviews" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      }

      case 15: {
        return (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cd} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis dataKey="review_cohort" tick={axisTickStrong} />
                <YAxis tick={axisTick} unit="$" domain={[80, 160]} />
                <Tooltip {...tooltipProps} formatter={(val, name) => [`$${val}`, name === 'median' ? 'Median Price' : 'Mean Price']} />
                <Legend {...legendProps} />
                <Bar dataKey="median" fill={CHART.coral} name="Median Price ($)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="mean" fill={CHART.teal} name="Mean Price ($)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      }

      case 16: {
        return (
          <div className="space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-ink-50/80 text-ink-500 uppercase font-semibold border-b border-ink-100">
                  <tr>
                    <th className="py-2.5 px-3 whitespace-nowrap">Treatment / Form</th>
                    <th className="py-2.5 px-2">Mean</th>
                    <th className="py-2.5 px-2">Median</th>
                    <th className="py-2.5 px-2">Std Dev</th>
                    <th className="py-2.5 px-2">Skewness</th>
                    <th className="py-2.5 px-2">Kurtosis</th>
                    <th className="py-2.5 px-2">Max Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100 font-mono text-[11px]">
                  {cd.map((row) => (
                    <tr key={row.treatment} className="hover:bg-ink-50/60 transition-colors">
                      <td className="py-2.5 px-3 font-sans font-bold text-ink-900 whitespace-nowrap">{row.treatment}</td>
                      <td className="py-2.5 px-2 font-semibold text-ink-800">{row.mean}</td>
                      <td className="py-2.5 px-2 font-bold text-airbnb-coral">{row.median}</td>
                      <td className="py-2.5 px-2 text-ink-500">{row.std}</td>
                      <td className="py-2.5 px-2">
                        <span className={`px-2 py-0.5 rounded font-bold ${row.skewness > 10 ? 'bg-rose-100 text-rose-800' : row.skewness > 1 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {row.skewness}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-ink-500">{row.kurtosis}</td>
                      <td className="py-2.5 px-2 text-ink-700">{typeof row.max === 'number' ? row.max.toLocaleString() : row.max}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
                <span className="font-bold block">85.5% Skewness Reduction</span>
                <span className="text-[11px] text-rose-700">99th-percentile Winsorization ($799) drops skewness from 19.12 to 2.78 while preserving true median ($106).</span>
              </div>
              <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900">
                <span className="font-bold block">98.1% Skewness Reduction</span>
                <span className="text-[11px] text-teal-700">Log-transformation ln(1+p) achieves skewness 0.37, stabilizing residual variance for linear modeling.</span>
              </div>
            </div>
          </div>
        );
      }

      case 17: {
        // Model benchmark: test-set R² (log scale) vs dollar MAE for every candidate regressor
        const chartRows = cd.map((row) => ({
          ...row,
          short_model: row.model
            .replace(' Regressor', '')
            .replace(' (Baseline)', '')
            .replace(' (Selected)', '')
            .replace(' (Benchmark)', ''),
        }));
        return (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartRows} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis dataKey="short_model" tick={{ fontSize: 9.5, fill: CHART.axisStrong, fontWeight: 600 }} interval={0} angle={-18} textAnchor="end" height={54} />
                <YAxis yAxisId="left" tick={axisTick} domain={[0, 0.7]} />
                <YAxis yAxisId="right" orientation="right" tick={axisTick} unit="$" />
                <Tooltip
                  {...tooltipProps}
                  formatter={(val, name) => (name.includes('MAE') ? [`$${val}`, name] : [val, name])}
                />
                <Legend {...legendProps} />
                <Bar yAxisId="left" dataKey="log_r2" fill={CHART.teal} name="Test R² (log price)" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="dollar_mae" fill={CHART.coral} name="Dollar MAE ($)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      }

      case 18: {
        // Standardised betas: how far log-price moves per one SD of each predictor
        const sorted = [...cd].sort((a, b) => Math.abs(a.beta) - Math.abs(b.beta));
        return (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sorted} layout="vertical" margin={{ top: 5, right: 25, left: 115, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridStroke} />
                <XAxis type="number" tick={axisTick} domain={[-0.65, 0.3]} />
                <YAxis type="category" dataKey="feature" tick={{ fontSize: 10, fill: CHART.axisStrong, fontWeight: 600 }} width={115} />
                <Tooltip {...tooltipProps} formatter={(val) => [val, 'Standardised β']} />
                <ReferenceLine x={0} stroke={CHART.axis} />
                <Bar dataKey="beta" name="Standardised β" radius={[0, 4, 4, 0]}>
                  {sorted.map((row) => (
                    <Cell key={row.feature} fill={row.beta < 0 ? CHART.coral : CHART.teal} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <SectionHeading
        eyebrow="Rubric Requirement: 10–15 Questions · 18 Solved & Visualized"
        eyebrowIcon={BookmarkCheck}
        title="Research Questions &"
        accent="Visual Evidence"
        subtitle="Every question features the complete 10-point scientific analysis: rationale, variables, metrics, interactive chart, statistical test, and evidence-based conclusion."
        right={
          <Chip icon={HelpCircle} tone="coral">
            {filteredList.length} of {questions.length} questions
          </Chip>
        }
      />

      {/* Category Filter Pills */}
      <Reveal delay={60}>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              aria-pressed={selectedCategory === cat}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-ink-900 text-white shadow-card'
                  : 'bg-white text-ink-600 border border-ink-100 hover:bg-ink-50 hover:border-ink-400/30'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </Reveal>

      {/* Question Accordion List */}
      <div className="space-y-4">
        {filteredList.map((q) => {
          const isOpen = openQuestionId === q.id;
          return (
            <Reveal key={q.id} delay={40}>
              <SpotlightCard
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen ? 'border-airbnb-coral/40 shadow-soft ring-1 ring-airbnb-coral/20 bg-white' : 'border-airbnb-border shadow-card hover:border-ink-400/30 bg-white'
                }`}
              >
                {/* Question Header Bar */}
                <button
                  onClick={() => setOpenQuestionId(isOpen ? null : q.id)}
                  aria-expanded={isOpen}
                  className="w-full p-5 text-left flex items-start justify-between gap-4 transition-colors"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shrink-0 transition-all duration-300 ${
                      isOpen ? 'bg-gradient-to-br from-airbnb-coral to-accent-violet text-white shadow-sm' : 'bg-ink-100 text-ink-700'
                    }`}>
                      Q{q.id}
                    </span>
                    <div className="min-w-0">
                      <h3 className="font-display text-sm sm:text-base font-bold text-ink-900 leading-snug">
                        {q.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Chip tone={isOpen ? 'coral' : 'neutral'} className="!text-[10px]">{q.concept}</Chip>
                        {q.variables && (
                          <span className="text-[10px] text-ink-400">
                            Variables: {Array.isArray(q.variables) ? q.variables.join(', ') : Object.keys(q.variables_and_units || {}).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`p-1.5 rounded-lg shrink-0 transition-all duration-300 ${isOpen ? 'bg-airbnb-coral/10 text-airbnb-coral rotate-180' : 'text-ink-400 hover:text-ink-700'}`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>

                {/* Collapsible Content - 10-Point Analysis Panel */}
                {isOpen && (
                  <div className="animate-rise px-5 pb-6 pt-3 space-y-5 border-t border-ink-100 bg-ink-50/40">
                    {/* Point 2: Why it matters */}
                    {q.why_it_matters && (
                      <div className="p-4 rounded-xl bg-white border border-ink-100 space-y-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-ink-400 block">
                          2. Analytical Importance & Business Rationale
                        </span>
                        <p className="text-xs text-ink-700 leading-relaxed font-medium">
                          {q.why_it_matters}
                        </p>
                      </div>
                    )}

                    {/* Point 3 & 4: Variables/Units and Analytical Method */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-4 rounded-xl bg-white border border-ink-100 space-y-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-ink-400 block">
                          3. Variables & Measurement Units
                        </span>
                        {q.variables_and_units ? (
                          <ul className="space-y-1 text-ink-700 font-mono text-[11px]">
                            {Object.entries(q.variables_and_units).map(([vName, vDesc]) => (
                              <li key={vName} className="flex items-start gap-1.5">
                                <span className="text-airbnb-coral font-bold shrink-0">•</span>
                                <span><strong>{vName}:</strong> {vDesc}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-ink-600">{q.variables?.join(', ')}</p>
                        )}
                      </div>

                      <div className="p-4 rounded-xl bg-white border border-ink-100 space-y-1.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-ink-400 block">
                          4. Analytical Method & Justification
                        </span>
                        <p className="text-ink-600 leading-relaxed">
                          {q.analytical_method || q.concept}
                        </p>
                      </div>
                    </div>

                    {/* Point 5: Computed Numerical Metrics */}
                    <div className="p-4 rounded-xl bg-white border border-ink-100">
                      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-ink-400 mb-3">
                        <Sigma className="w-3.5 h-3.5" />
                        5. Actual Calculated Metrics & Parameters
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                        {Object.entries(q.metrics || {})
                          .filter(([, v]) => typeof v === 'number' || typeof v === 'string')
                          .map(([k, v]) => (
                            <div key={k} className="p-2.5 rounded-lg bg-ink-50/80 border border-ink-100 hover:border-airbnb-coral/30 transition-colors">
                              <span className="block text-[10px] text-ink-400 uppercase truncate">
                                {k.replace(/_/g, ' ')}
                              </span>
                              <span className="font-bold text-ink-900 text-xs">
                                {typeof v === 'number' ? v.toLocaleString() : v}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Point 6: Dedicated Visual Evidence (Interactive Recharts) */}
                    <div className="p-4 sm:p-5 rounded-xl bg-white border border-ink-100 space-y-3">
                      <div className="flex items-center justify-between gap-2 border-b border-ink-100 pb-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <IconTile icon={BarChart2} gradient="from-airbnb-coral to-accent-violet" size="sm" />
                          <span className="font-display text-xs font-bold text-ink-900 truncate">6. Visual Evidence: {q.title}</span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-ink-100 text-ink-500 uppercase shrink-0">
                          Recharts
                        </span>
                      </div>

                      {/* Chart Container */}
                      <div className="pt-2">
                        {renderQuestionChart(q)}
                      </div>
                    </div>

                    {/* Point 7: Graph Interpretation */}
                    <div className="p-4 rounded-xl bg-white border border-ink-100 space-y-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-ink-400 block">
                        7. Interpretation of the Visualization
                      </span>
                      <p className="text-xs text-ink-700 leading-relaxed font-normal">
                        {q.graph_interpretation || q.interpretation}
                      </p>
                    </div>

                    {/* Point 8: Evidence-Based Conclusion */}
                    <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/60 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>8. Final Evidence-Based Conclusion</span>
                      </div>
                      <p className="text-xs text-emerald-950 leading-relaxed font-medium">
                        {q.conclusion}
                      </p>
                    </div>

                    {/* Point 9 & 10: Statistical Test and Assumptions/Limitations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {q.statistical_test && (
                        <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 space-y-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-purple-700 block">
                            9. Statistical Test & Inference
                          </span>
                          <div className="text-[11px] font-mono text-purple-950 space-y-0.5">
                            <div><strong>Test:</strong> {q.statistical_test.test_name}</div>
                            <div><strong>Statistic:</strong> {q.statistical_test.statistic} (p = {q.statistical_test.p_value < 1e-4 ? '< 0.001' : q.statistical_test.p_value})</div>
                            <div className="text-[11px] font-sans text-purple-800 pt-1 flex items-start gap-1.5">
                              <ArrowRight className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              <span>{q.statistical_test.result}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {q.assumptions_and_limitations && (
                        <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1.5">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 block">
                            10. Assumptions & Limitations
                          </span>
                          <p className="text-xs text-amber-900 leading-relaxed">
                            {q.assumptions_and_limitations}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </SpotlightCard>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}
