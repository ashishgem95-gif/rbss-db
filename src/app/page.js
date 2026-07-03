'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import StatsCard from '@/components/StatsCard';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#1e3a5f', '#c41e3a', '#c9a84c', '#2563eb', '#059669', '#7c3aed', '#d97706', '#0891b2'];

export default function HomePage() {
  const [officers, setOfficers] = useState([]);
  const [stats, setStats] = useState(null);
  const [filterDesig, setFilterDesig] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterSection, setFilterSection] = useState('');

  useEffect(() => {
    fetch('/data/officers.json')
      .then(r => r.json())
      .then(data => {
        setOfficers(data);
        computeStats(data);
      })
      .catch(() => {});
  }, []);

  function computeStats(data) {
    const uniqueNames = new Set(data.map(o => o.name));
    const uniqueOrders = new Set(data.map(o => o.order_number));
    const years = [...new Set(data.map(o => o.order_year))].sort();

    const ordersByYear = {};
    data.forEach(o => {
      if (!ordersByYear[o.order_year]) ordersByYear[o.order_year] = new Set();
      ordersByYear[o.order_year].add(o.order_number);
    });

    const desigCounts = {};
    data.forEach(o => {
      desigCounts[o.designation] = (desigCounts[o.designation] || 0) + 1;
    });

    const recent = getRecentOrders(data, 10);

    setStats({
      totalOfficers: uniqueNames.size,
      totalOrders: uniqueOrders.size,
      totalEntries: data.length,
      yearRange: years.length > 0 ? `${years[0]} - ${years[years.length - 1]}` : 'N/A',
      ordersByYear: Object.fromEntries(
        Object.entries(ordersByYear).map(([y, s]) => [y, s.size])
      ),
      designationCounts: desigCounts,
      recentOrders: recent,
    });
  }

  function getRecentOrders(data, limit) {
    const seen = new Set();
    const unique = [];
    for (const o of [...data].sort((a, b) => new Date(b.order_date) - new Date(a.order_date))) {
      if (!seen.has(o.order_number)) {
        seen.add(o.order_number);
        const names = data.filter(x => x.order_number === o.order_number).map(x => x.name);
        unique.push({
          order_number: o.order_number,
          order_date: o.order_date,
          order_year: o.order_year,
          officer_count: names.length,
          officers: names,
        });
      }
    }
    return unique.slice(0, limit);
  }

  const years = useMemo(() => [...new Set(officers.map(o => o.order_year))].sort(), [officers]);
  const designations = useMemo(() => [...new Set(officers.map(o => o.designation))].sort(), [officers]);
  const sections = useMemo(() => [...new Set(officers.map(o => o.section))].sort(), [officers]);

  const barData = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.ordersByYear)
      .map(([year, count]) => ({ year: year.toString(), orders: count }))
      .sort((a, b) => a.year.localeCompare(b.year));
  }, [stats]);

  const pieData = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.designationCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [stats]);

  const filteredOfficers = useMemo(() => {
    return officers.filter(o => {
      if (filterDesig && o.designation !== filterDesig) return false;
      if (filterYear && o.order_year !== parseInt(filterYear)) return false;
      if (filterSection && o.section !== filterSection) return false;
      return true;
    });
  }, [officers, filterDesig, filterYear, filterSection]);

  const displayOfficers = useMemo(() => {
    const seen = new Set();
    return filteredOfficers.filter(o => {
      if (seen.has(o.name)) return false;
      seen.add(o.name);
      return true;
    }).slice(0, 12);
  }, [filteredOfficers]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-railway-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-railway-dark via-railway-blue to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold mb-3">RBSS/RBSSS Officer Database</h1>
            <p className="text-lg text-blue-200 max-w-2xl mx-auto">
              Railway Board Secretariat Service — Comprehensive officer records, orders, and statistics
            </p>
          </div>
          <div className="max-w-2xl mx-auto">
            <SearchBar large={true} />
          </div>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-sm bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-railway-gold"
            >
              <option value="" className="text-gray-900">All Years</option>
              {years.map(y => (
                <option key={y} value={y} className="text-gray-900">{y}</option>
              ))}
            </select>
            <select
              value={filterDesig}
              onChange={(e) => setFilterDesig(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-sm bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-railway-gold"
            >
              <option value="" className="text-gray-900">All Designations</option>
              {designations.map(d => (
                <option key={d} value={d} className="text-gray-900">{d}</option>
              ))}
            </select>
            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-sm bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-railway-gold"
            >
              <option value="" className="text-gray-900">All Sections</option>
              {sections.map(s => (
                <option key={s} value={s} className="text-gray-900">{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Officers"
            value={stats.totalOfficers}
            subtitle="Unique officers"
            color="blue"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
          />
          <StatsCard
            title="Total Orders"
            value={stats.totalOrders}
            subtitle="Unique order numbers"
            color="green"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
          />
          <StatsCard
            title="Total Entries"
            value={stats.totalEntries}
            subtitle="Individual records"
            color="amber"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>}
          />
          <StatsCard
            title="Year Range"
            value={stats.yearRange}
            subtitle="Active period"
            color="purple"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Orders by Year</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  formatter={(value) => [value, 'Orders']}
                />
                <Bar dataKey="orders" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Officers by Designation</h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={40}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value})`}
                  labelLine={false}
                >
                  {pieData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Officers Grid + Recent Orders */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Officer Cards */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {filterDesig || filterYear || filterSection ? 'Filtered Officers' : 'Officers'}
            </h2>
            {displayOfficers.length === 0 ? (
              <div className="card text-center py-8 text-gray-500">
                No officers match the selected filters.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {displayOfficers.map((o, idx) => (
                  <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
                    <Link
                      href={`/officer/${encodeURIComponent(o.name)}`}
                      className="font-semibold text-railway-blue hover:text-blue-700"
                    >
                      {o.name}
                    </Link>
                    <div className="text-sm text-gray-500 mt-1">
                      {o.designation} &middot; {o.section}
                    </div>
                    <div className="text-xs text-gray-400 mt-2">
                      {o.from_role} → {o.to_role}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {displayOfficers.length > 0 && (
              <div className="mt-4 text-center">
                <Link href="/browse" className="text-sm text-railway-blue hover:text-blue-700 font-medium">
                  View all officers →
                </Link>
              </div>
            )}
          </div>

          {/* Recent Orders */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
            <div className="space-y-3">
              {stats.recentOrders.map((order, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-100 p-3">
                  <div className="text-sm font-medium text-gray-900 truncate">{order.order_number}</div>
                  <div className="text-xs text-gray-500 mt-1">{order.order_date}</div>
                  <div className="text-xs text-railway-blue mt-1">
                    {order.officer_count} officer{order.officer_count > 1 ? 's' : ''}: {order.officers.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
