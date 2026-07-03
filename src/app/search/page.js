'use client';

import { Suspense } from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import Fuse from 'fuse.js';

const ITEMS_PER_PAGE = 20;

// Inner component that uses useSearchParams - wrapped in Suspense
function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const desigFilter = searchParams.get('designation') || '';
  const yearFilter = searchParams.get('year') || '';
  
  const [officers, setOfficers] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch('/data/officers.json')
      .then(r => r.json())
      .then(setOfficers)
      .catch(() => setOfficers([]));
  }, []);

  const fuse = useMemo(() => new Fuse(officers, {
    keys: ['name', 'designation', 'section', 'from_role', 'to_role', 'order_number'],
    threshold: 0.3,
  }), [officers]);

  let filtered = officers;
  
  if (query) {
    filtered = fuse.search(query).map(r => r.item);
  }
  if (desigFilter) {
    filtered = filtered.filter(o => o.designation === desigFilter);
  }
  if (yearFilter) {
    filtered = filtered.filter(o => String(o.order_year) === yearFilter);
  }

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const designations = [...new Set(officers.map(o => o.designation).filter(Boolean))].sort();
  const years = [...new Set(officers.map(o => o.order_year).filter(Boolean))].sort();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Search Officers</h1>

        {/* Search + Filters */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-6">
          <div className="mb-4">
            <SearchBar officers={officers} initialQuery={query} />
          </div>
          <div className="flex flex-wrap gap-2">
            <select value={desigFilter} onChange={e => { setPage(1); window.history.replaceState({}, '', `?q=${query}&designation=${e.target.value}&year=${yearFilter}`); }}
              className="bg-gray-700 rounded px-3 py-1 text-sm">
              <option value="">All Designations</option>
              {designations.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={yearFilter} onChange={e => { setPage(1); window.history.replaceState({}, '', `?q=${query}&designation=${desigFilter}&year=${e.target.value}`); }}
              className="bg-gray-700 rounded px-3 py-1 text-sm">
              <option value="">All Years</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <span className="text-gray-400 text-sm py-1">{filtered.length} results</span>
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-700">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Designation</th>
                <th className="p-3 text-left">From</th>
                <th className="p-3 text-left">To</th>
                <th className="p-3 text-left">Order</th>
                <th className="p-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((o, i) => (
                <tr key={i} className="border-t border-gray-700 hover:bg-gray-700/50">
                  <td className="p-3">
                    <Link href={`/officer/${encodeURIComponent(o.name)}`} className="text-blue-400 hover:underline">
                      {o.name}
                    </Link>
                  </td>
                  <td className="p-3">{o.designation}</td>
                  <td className="p-3 text-gray-300">{o.from_role}</td>
                  <td className="p-3 text-gray-300">{o.to_role}</td>
                  <td className="p-3 text-gray-400 text-xs">{o.order_number}</td>
                  <td className="p-3 text-gray-400">{o.order_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-railway-gold text-black' : 'bg-gray-700 hover:bg-gray-600'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Wrapper with Suspense boundary for static export
export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 text-white p-8">Loading search...</div>}>
      <SearchResults />
    </Suspense>
  );
}
