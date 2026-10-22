import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid
} from 'recharts';
import {
  Search, RotateCcw, Download, MapPin, Bed, Star, Calendar,
  ChevronLeft, ChevronRight, BarChart2, Compass
} from 'lucide-react';
import { Reveal, SpotlightCard, TiltCard } from './Effects';
import { SectionHeading, Chip, SegmentedControl, MagneticButton, StatTile, Skeleton, EmptyState } from './ui';
import { CHART, gridStroke, tooltipStyle, tooltipLabelStyle, tooltipItemStyle, ChartCard, ChartLegend } from './Charts';

export default function ExploreMarket({ apiOnline }) {
  const [borough, setBorough] = useState('All');
  const [roomType, setRoomType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [maxPrice, setMaxPrice] = useState(799);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    total: 0,
    total_pages: 1,
    summary: { count: 0, mean_price: 0, median_price: 0, avg_reviews: 0 },
    listings: []
  });

  const boroughs = ['All', 'Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];
  const roomTypes = ['All', 'Entire home/apt', 'Private room', 'Shared room'];

  // Fetch listings from API (or fallback)
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: '12',
      borough: borough !== 'All' ? borough : '',
      room_type: roomType !== 'All' ? roomType : '',
      max_price: maxPrice.toString(),
      search: searchTerm.trim()
    });

    fetch(`/api/listings?${queryParams.toString()}`)
      .then((res) => {
        if (!res.ok) throw new Error('API fetch failed');
        return res.json();
      })
      .then((json) => {
        if (isMounted) {
          setData(json);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Fallback listing query:', err);
        if (isMounted) {
          setData({
            total: 13200,
            total_pages: 1100,
            summary: { count: 13200, mean_price: 155.4, median_price: 120.0, avg_reviews: 24.5 },
            listings: [
              {
                id: 2595,
                name: 'Skylit Midtown Castle',
                neighbourhood_group: 'Manhattan',
                neighbourhood: 'Midtown',
                room_type: 'Entire home/apt',
                price_capped: 225,
                minimum_nights: 1,
                number_of_reviews: 45,
                availability_365: 355,
                host_type: 'Single Property (1)'
              },
              {
                id: 3831,
                name: 'Cozy Entire Floor in Brownstone',
                neighbourhood_group: 'Brooklyn',
                neighbourhood: 'Clinton Hill',
                room_type: 'Entire home/apt',
                price_capped: 89,
                minimum_nights: 1,
                number_of_reviews: 270,
                availability_365: 194,
                host_type: 'Single Property (1)'
              },
              {
                id: 5099,
                name: 'Large Clean 1 BR in Murray Hill',
                neighbourhood_group: 'Manhattan',
                neighbourhood: 'Murray Hill',
                room_type: 'Entire home/apt',
                price_capped: 200,
                minimum_nights: 3,
                number_of_reviews: 74,
                availability_365: 129,
                host_type: 'Single Property (1)'
              },
              {
                id: 5121,
                name: 'BlissArtsSpace!',
                neighbourhood_group: 'Brooklyn',
                neighbourhood: 'Bedford-Stuyvesant',
                room_type: 'Private room',
                price_capped: 60,
                minimum_nights: 45,
                number_of_reviews: 49,
                availability_365: 0,
                host_type: 'Single Property (1)'
              }
            ]
          });
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [borough, roomType, maxPrice, searchTerm, page]);

  // Reset filters
  const handleReset = () => {
    setBorough('All');
    setRoomType('All');
    setSearchTerm('');
    setMaxPrice(799);
    setPage(1);
  };

  // Export current listings to CSV
  const handleExportCSV = () => {
    if (!data.listings || data.listings.length === 0) return;
    const headers = ['ID', 'Name', 'Borough', 'Neighbourhood', 'Room Type', 'Price ($)', 'Min Nights', 'Reviews', 'Availability (Days)'];
    const rows = data.listings.map((l) => [
      l.id,
      `"${(l.name || '').replace(/"/g, '""')}"`,
      l.neighbourhood_group,
      `"${l.neighbourhood}"`,
      l.room_type,
      l.price_capped,
      l.minimum_nights,
      l.number_of_reviews,
      l.availability_365
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NYC_Airbnb_Filtered_${borough}_${roomType}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate quick distribution of the current page listings
  const pageListings = data.listings || [];
  const currentPrices = pageListings.map((l) => ({
    name: l.name?.substring(0, 16) + '...',
    price: l.price_capped,
    room_type: l.room_type,
    borough: l.neighbourhood_group
  }));

  const hasFilters = borough !== 'All' || roomType !== 'All' || searchTerm.trim() !== '' || maxPrice !== 799;

  return (
    <div className="space-y-8 pb-12">
      <SectionHeading
        eyebrow="Verified Dataset · 48,870 Listings"
        eyebrowIcon={Compass}
        title="Explore the NYC"
        accent="Rental Market"
        subtitle="Filter, search, and analyze individual properties across all five boroughs and every room exclusivity tier."
        right={
          <div className="flex items-center gap-2">
            <SegmentedControl
              value={viewMode}
              onChange={setViewMode}
              options={[
                { label: 'Cards', value: 'cards' },
                { label: 'Table', value: 'table' },
              ]}
            />
            <MagneticButton
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-ink-900 hover:bg-black text-white text-xs font-bold shadow-card"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </MagneticButton>
          </div>
        }
      />

      {/* Filter Controls Bar */}
      <Reveal delay={60}>
        <SpotlightCard className="bg-white rounded-2xl p-5 sm:p-6 border border-airbnb-border shadow-card space-y-5">
          <div className="flex items-center gap-2 text-xs font-bold text-ink-500 uppercase tracking-wider">
            <Search className="w-4 h-4 text-airbnb-coral" />
            <span>Refine Dataset</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Term */}
            <div>
              <label htmlFor="listing-search" className="block text-[11px] font-bold uppercase tracking-wider text-ink-500 mb-1.5">Search Listing or Neighbourhood</label>
              <div className="relative group">
                <Search className="w-4 h-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-airbnb-coral" />
                <input
                  id="listing-search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  placeholder="e.g. Williamsburg, loft, cozy…"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-ink-100 text-sm text-ink-800 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-airbnb-coral/20 focus:border-airbnb-coral/50"
                />
              </div>
            </div>

            {/* Borough Filter */}
            <div>
              <label htmlFor="listing-borough" className="block text-[11px] font-bold uppercase tracking-wider text-ink-500 mb-1.5">Borough Submarket</label>
              <select
                id="listing-borough"
                value={borough}
                onChange={(e) => {
                  setBorough(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-ink-100 text-sm text-ink-800 bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-airbnb-coral/20 focus:border-airbnb-coral/50"
              >
                {boroughs.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Room Type */}
            <div>
              <label htmlFor="listing-room" className="block text-[11px] font-bold uppercase tracking-wider text-ink-500 mb-1.5">Room Exclusivity Tier</label>
              <select
                id="listing-room"
                value={roomType}
                onChange={(e) => {
                  setRoomType(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-ink-100 text-sm text-ink-800 bg-white transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-airbnb-coral/20 focus:border-airbnb-coral/50"
              >
                {roomTypes.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Price Cap Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="listing-price" className="text-[11px] font-bold uppercase tracking-wider text-ink-500">Max Nightly Price</label>
                <span className="text-xs font-bold text-airbnb-coral font-mono">${maxPrice}</span>
              </div>
              <input
                id="listing-price"
                type="range"
                min="20"
                max="799"
                step="10"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(Number(e.target.value));
                  setPage(1);
                }}
                className="range-premium w-full mt-3"
              />
              <div className="flex justify-between text-[10px] text-ink-400 mt-0.5">
                <span>$20</span>
                <span>$799 (99th cap)</span>
              </div>
            </div>
          </div>

          {/* Filter Summary & Reset Pill */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-ink-100 text-xs">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-ink-600">
              <span><strong className="text-ink-900">{data.total?.toLocaleString()}</strong> listings found</span>
              {data.summary?.count > 0 && (
                <>
                  <span className="hidden sm:inline text-ink-300">•</span>
                  <span>Slice Median: <strong className="text-ink-900">${data.summary.median_price}</strong></span>
                  <span className="hidden sm:inline text-ink-300">•</span>
                  <span>Slice Mean: <strong className="text-ink-900">${data.summary.mean_price}</strong></span>
                </>
              )}
            </div>
            <button
              onClick={handleReset}
              disabled={!hasFilters}
              className="inline-flex items-center gap-1.5 text-xs text-ink-500 hover:text-airbnb-coral transition font-semibold disabled:opacity-40 disabled:hover:text-ink-500"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        </SpotlightCard>
      </Reveal>

      {/* Filtered Subset KPI Banner */}
      {data.summary?.count > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Reveal delay={40} className="h-full">
            <StatTile label="Active Submarket Slice" value={data.total} icon={Compass} tint="bg-stone-100 text-ink-700" gradient="from-ink-400 to-ink-700" hint="Filtered properties" />
          </Reveal>
          <Reveal delay={90} className="h-full">
            <StatTile label="Slice Median Price" value={data.summary.median_price} prefix="$" icon={BarChart2} tint="bg-rose-50 text-airbnb-coral" gradient="from-airbnb-coral to-accent-violet" hint="Nightly rate benchmark" />
          </Reveal>
          <Reveal delay={140} className="h-full">
            <StatTile label="Slice Mean Price" value={data.summary.mean_price} prefix="$" decimals={2} icon={BarChart2} tint="bg-amber-50 text-airbnb-orange" gradient="from-airbnb-orange to-accent-pink" hint="Arithmetic average" />
          </Reveal>
          <Reveal delay={190} className="h-full">
            <StatTile label="Average Reviews" value={data.summary.avg_reviews} decimals={1} icon={Star} tint="bg-teal-50 text-airbnb-teal" gradient="from-airbnb-teal to-accent-cyan" hint="Reviews per listing" />
          </Reveal>
        </div>
      )}

      {/* Mini Visual Chart for current page listings */}
      {currentPrices.length > 0 && !loading && (
        <Reveal delay={60}>
          <ChartCard
            icon={BarChart2}
            gradient="from-airbnb-coral to-accent-violet"
            title="Current Page Listings Price Comparison"
            subtitle="Nightly rate per property on this page"
            badge={`Page ${page} of ${data.total_pages}`}
          >
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={currentPrices} margin={{ top: 5, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                  <XAxis dataKey="name" angle={-20} textAnchor="end" tick={{ fontSize: 9, fill: CHART.axis }} interval={0} height={48} />
                  <YAxis tick={{ fontSize: 10, fill: CHART.axis }} unit="$" />
                  <Tooltip contentStyle={tooltipStyle} labelStyle={tooltipLabelStyle} itemStyle={tooltipItemStyle} formatter={(val) => [`$${val}`, 'Nightly Rate']} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                  <Bar dataKey="price" radius={[4, 4, 0, 0]}>
                    {currentPrices.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.room_type === 'Entire home/apt' ? CHART.coral : entry.room_type === 'Private room' ? CHART.teal : CHART.orange} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ChartLegend
              items={[
                { label: 'Entire home/apt', color: CHART.coral },
                { label: 'Private room', color: CHART.teal },
                { label: 'Shared room', color: CHART.orange },
              ]}
            />
          </ChartCard>
        </Reveal>
      )}

      {/* Listings Display Area */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-airbnb-border h-52 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-10 w-full mt-4" />
            </div>
          ))}
        </div>
      ) : data.listings.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No listings match your filter criteria"
          message="Try broadening your search term or adjusting the price threshold to reveal matching properties."
          action={
            <MagneticButton
              onClick={handleReset}
              className="px-5 py-2.5 rounded-xl bg-airbnb-coral text-white text-xs font-bold shadow-card hover:bg-airbnb-orange"
            >
              Clear Filters
            </MagneticButton>
          }
        />
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.listings.map((item, i) => (
            <Reveal key={item.id} delay={Math.min(i * 45, 360)} className="h-full">
              <TiltCard max={5} className="h-full">
                <SpotlightCard className="group h-full bg-white rounded-2xl p-5 border border-airbnb-border shadow-card hover:shadow-soft transition-all duration-300 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <Chip tone={item.neighbourhood_group === 'Manhattan' ? 'coral' : item.neighbourhood_group === 'Brooklyn' ? 'teal' : 'violet'} icon={MapPin}>
                        {item.neighbourhood_group}
                      </Chip>
                      <div className="text-right shrink-0">
                        <span className="text-lg font-black text-airbnb-coral">${item.price_capped}</span>
                        <span className="text-[11px] text-ink-400 block">/ night</span>
                      </div>
                    </div>

                    <h3 className="font-display font-bold text-sm text-ink-900 line-clamp-2 leading-snug">
                      {item.name || 'Untitled Listing'}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-ink-500">
                      <MapPin className="w-3.5 h-3.5 text-ink-300 shrink-0" />
                      <span className="truncate">{item.neighbourhood}</span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-ink-100 space-y-2 text-xs text-ink-600">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1 text-ink-500">
                        <Bed className="w-3.5 h-3.5 text-ink-300" />
                        <span>{item.room_type}</span>
                      </span>
                      <span className="font-semibold text-ink-800">
                        {item.minimum_nights} {item.minimum_nights === 1 ? 'night min' : 'nights min'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="flex items-center gap-1 text-ink-500">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>{item.number_of_reviews} reviews</span>
                      </span>
                      <span className="flex items-center gap-1 text-ink-500">
                        <Calendar className="w-3.5 h-3.5 text-ink-300" />
                        <span>{item.availability_365}d avail</span>
                      </span>
                    </div>
                  </div>
                </SpotlightCard>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      ) : (
        <Reveal>
          <SpotlightCard className="bg-white rounded-2xl border border-airbnb-border shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-ink-50/80 text-ink-500 uppercase font-semibold border-b border-ink-100">
                  <tr>
                    <th className="py-3.5 px-4 whitespace-nowrap">Listing Name</th>
                    <th className="py-3.5 px-3 whitespace-nowrap">Borough</th>
                    <th className="py-3.5 px-3 whitespace-nowrap">Neighbourhood</th>
                    <th className="py-3.5 px-3 whitespace-nowrap">Room Type</th>
                    <th className="py-3.5 px-3 whitespace-nowrap">Nightly Rate</th>
                    <th className="py-3.5 px-3 whitespace-nowrap">Min Stay</th>
                    <th className="py-3.5 px-3 whitespace-nowrap">Reviews</th>
                    <th className="py-3.5 px-3 whitespace-nowrap">Availability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100 text-ink-700">
                  {data.listings.map((item) => (
                    <tr key={item.id} className="hover:bg-ink-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-ink-900 max-w-xs truncate">{item.name}</td>
                      <td className="py-3.5 px-3">{item.neighbourhood_group}</td>
                      <td className="py-3.5 px-3">{item.neighbourhood}</td>
                      <td className="py-3.5 px-3">{item.room_type}</td>
                      <td className="py-3.5 px-3 font-bold text-airbnb-coral">${item.price_capped}</td>
                      <td className="py-3.5 px-3">{item.minimum_nights} nights</td>
                      <td className="py-3.5 px-3">{item.number_of_reviews}</td>
                      <td className="py-3.5 px-3">{item.availability_365} days</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SpotlightCard>
        </Reveal>
      )}

      {/* Pagination Controls */}
      {data.total_pages > 1 && (
        <Reveal>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white rounded-2xl p-4 border border-airbnb-border shadow-card text-xs">
            <span className="text-ink-500">
              Page <strong className="text-ink-900">{page}</strong> of <strong className="text-ink-900">{data.total_pages}</strong> ({data.total?.toLocaleString()} total listings)
            </span>
            <div className="flex items-center gap-2">
              <MagneticButton
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg border border-ink-100 bg-white hover:bg-ink-50 disabled:opacity-40 disabled:hover:bg-white transition font-semibold text-ink-700"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </MagneticButton>
              <MagneticButton
                onClick={() => setPage(Math.min(data.total_pages, page + 1))}
                disabled={page >= data.total_pages}
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg border border-ink-100 bg-white hover:bg-ink-50 disabled:opacity-40 disabled:hover:bg-white transition font-semibold text-ink-700"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </MagneticButton>
            </div>
          </div>
        </Reveal>
      )}
    </div>
  );
}
