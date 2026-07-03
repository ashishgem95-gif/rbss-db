'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function BrowsePage() {
  const [officers, setOfficers] = useState([]);

  useEffect(() => {
    fetch('/data/officers.json')
      .then(r => r.json())
      .then(data => setOfficers(data))
      .catch(() => {});
  }, []);

  const grouped = useMemo(() => {
    const groups = {};
    officers.forEach(o => {
      if (!groups[o.order_year]) groups[o.order_year] = {};
      const month = o.order_date.substring(0, 7);
      if (!groups[o.order_year][month]) groups[o.order_year][month] = new Set();
      groups[o.order_year][month].add(o.order_number);
    });
    return Object.entries(groups)
      .sort((a, b) => b[0] - a[0])
      .map(([year, months]) => ({
        year,
        months: Object.entries(months)
          .sort((a, b) => b[0].localeCompare(a[0]))
          .map(([monthKey, orders]) => {
            const [y, m] = monthKey.split('-');
            const monthName = monthNames[parseInt(m) - 1];
            return {
              monthKey,
              monthName: `${monthName} ${y}`,
              orders: [...orders],
            };
          }),
      }));
  }, [officers]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Browse Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Browse orders chronologically by year and month</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {grouped.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : (
          <div className="space-y-8">
            {grouped.map(({ year, months }) => (
              <div key={year} className="card">
                <h2 className="text-xl font-bold text-railway-blue mb-4">{year}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {months.map(({ monthKey, monthName, orders }) => (
                    <div key={monthKey} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <h3 className="font-semibold text-gray-900 text-sm mb-2">{monthName}</h3>
                      <div className="space-y-1.5">
                        {orders.map((order, idx) => {
                          const names = [...new Set(
                            officers.filter(o => o.order_number === order).map(o => o.name)
                          )];
                          return (
                            <div key={idx} className="text-sm">
                              <Link
                                href={`/search?q=${encodeURIComponent(order)}`}
                                className="text-railway-blue hover:text-blue-700 font-medium"
                              >
                                {order}
                              </Link>
                              <div className="text-xs text-gray-400 mt-0.5">
                                {names.length} officer{names.length > 1 ? 's' : ''}: {names.join(', ')}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
