'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = ['#1e3a5f', '#c41e3a', '#c9a84c', '#2563eb', '#059669', '#7c3aed', '#d97706', '#0891b2'];

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function StatsPage() {
  const [officers, setOfficers] = useState([]);

  useEffect(() => {
    fetch('/data/officers.json')
      .then(r => r.json())
      .then(data => setOfficers(data))
      .catch(() => {});
  }, []);

  const stats = useMemo(() => {
    if (officers.length === 0) return null;

    const uniqueNames = new Set(officers.map(o => o.name));
    const uniqueOrders = new Set(officers.map(o => o.order_number));

    // Orders by year
    const ordersByYear = {};
    officers.forEach(o => {
      if (!ordersByYear[o.order_year]) ordersByYear[o.order_year] = new Set();
      ordersByYear[o.order_year].add(o.order_number);
    });

    // Designation distribution
    const desigCounts = {};
    officers.forEach(o => {
      desigCounts[o.designation] = (desigCounts[o.designation] || 0) + 1;
    });

    // Monthly activity
    const monthCounts = {};
    officers.forEach(o => {
      const month = o.order_date.substring(0, 7);
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    });

    // Doc type distribution
    const docTypes = {};
    officers.forEach(o => {
      docTypes[o.doc_type] = (docTypes[o.doc_type] || 0) + 1;
    });

    // Section distribution
    const sectionCounts = {};
    officers.forEach(o => {
      sectionCounts[o.section] = (sectionCounts[o.section] || 0) + 1;
    });

    // Location distribution
    const locCounts = {};
    officers.forEach(o => {
      locCounts[o.from_location] = (locCounts[o.from_location] || 0) + 1;
      locCounts[o.to_location] = (locCounts[o.to_location] || 0) + 1;
    });

    return {
      totalOfficers: uniqueNames.size,
      totalOrders: uniqueOrders.size,
      totalEntries: officers.length,
      ordersByYear: Object.fromEntries(
        Object.entries(ordersByYear).map(([y, s]) => [y, s.size])
      ),
      designationCounts: desigCounts,
      monthCounts,
      docTypes,
      sectionCounts,
      locCounts,
    };
  }, [officers]);

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

  const monthData = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.monthCounts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([monthKey, count]) => {
        const [y, m] = monthKey.split('-');
        const label = `${monthNames[parseInt(m) - 1]} ${y}`;
        return { month: label, entries: count };
      });
  }, [stats]);

  const sectionData = useMemo(() => {
    if (!stats) return [];
    return Object.entries(stats.sectionCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [stats]);

  const locationData = useMemo(() => {
    if (!stats) return [];
    const sorted = Object.entries(stats.locCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    const top = sorted.slice(0, 8);
    const rest = sorted.slice(8).reduce((sum, item) => sum + item.value, 0);
    if (rest > 0) top.push({ name: 'Others', value: rest });
    return top;
  }, [stats]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-railway-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Statistics</h1>
          <p className="text-sm text-gray-500 mt-1">Comprehensive analytics of RBSS/RBSSS officer data</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
            <p className="text-sm text-gray-500 mb-1">Total Officers</p>
            <p className="text-4xl font-bold text-railway-blue">{stats.totalOfficers}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
            <p className="text-sm text-gray-500 mb-1">Total Orders</p>
            <p className="text-4xl font-bold text-railway-red">{stats.totalOrders}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
            <p className="text-sm text-gray-500 mb-1">Total Records</p>
            <p className="text-4xl font-bold text-railway-gold">{stats.totalEntries}</p>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Orders by Year</h2>
            <ResponsiveContainer width="100%" height={300}>
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

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Designation Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%" cy="50%"
                  outerRadius={100}
                  innerRadius={45}
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

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Activity</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  formatter={(value) => [value, 'Entries']}
                />
                <Bar dataKey="entries" fill="#c41e3a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Section Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sectionData}
                  cx="50%" cy="50%"
                  outerRadius={100}
                  innerRadius={45}
                  dataKey="value"
                  label={({ name, value }) => `${name} (${value})`}
                  labelLine={false}
                >
                  {sectionData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Most Active Locations</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={locationData}
                  cx="50%" cy="50%"
                  outerRadius={100}
                  innerRadius={45}
                  dataKey="value"
                  label={({ name, value }) => `${name.split(' ')[0]} (${value})`}
                  labelLine={false}
                >
                  {locationData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Types</h2>
            <div className="space-y-4">
              {Object.entries(stats.docTypes).map(([type, count], idx) => (
                <div key={type} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    ></div>
                    <span className="font-medium text-gray-700 capitalize">{type}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
