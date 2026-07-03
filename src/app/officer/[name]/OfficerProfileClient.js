'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import OfficerTimeline from '@/components/OfficerTimeline';

export default function OfficerProfileClient({ name }) {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    fetch('/data/officers.json')
      .then(r => r.json())
      .then(data => {
        const filtered = data
          .filter(o => o.name.toLowerCase() === name.toLowerCase())
          .sort((a, b) => new Date(a.order_date) - new Date(b.order_date));
        setEntries(filtered);
      })
      .catch(() => {});
  }, [name]);

  if (entries.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-railway-blue mx-auto mb-4"></div>
          <p className="text-gray-500">Loading officer details...</p>
        </div>
      </div>
    );
  }

  const officer = entries[0];
  const currentRole = entries[entries.length - 1];

  const dobFormatted = officer.dob
    ? new Date(officer.dob).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Not available';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link href="/" className="hover:text-gray-600">Home</Link>
            <span>/</span>
            <Link href="/search" className="hover:text-gray-600">Search</Link>
            <span>/</span>
            <span className="text-gray-700 font-medium">{officer.name}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{officer.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-railway-blue text-white">
                  {currentRole.designation}
                </span>
                <span className="text-gray-500">{currentRole.section}</span>
                <span className="text-gray-400">&middot;</span>
                <span className="text-gray-500">{currentRole.from_location}</span>
              </div>
            </div>
            <div className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg">
              <p>Current: {currentRole.to_role}</p>
              <p>{entries.length} career entries</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="card space-y-4">
              <h3 className="font-semibold text-gray-900">Personal Info</h3>
              <div>
                <p className="text-xs text-gray-400">Date of Birth</p>
                <p className="text-sm text-gray-900">{dobFormatted}</p>
              </div>
              <div className="pt-3 border-t border-gray-50">
                <p className="text-xs text-gray-400">Designations Held</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {[...new Set(entries.map(e => e.designation))].map(d => (
                    <span key={d} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
              <div className="pt-3 border-t border-gray-50">
                <p className="text-xs text-gray-400">Sections Worked</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {[...new Set(entries.map(e => e.section))].map(s => (
                    <span key={s} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-50 text-green-700">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="pt-3 border-t border-gray-50">
                <p className="text-xs text-gray-400">Total Orders</p>
                <p className="text-sm font-semibold text-gray-900">{new Set(entries.map(e => e.order_number)).size}</p>
              </div>
              <div className="pt-3 border-t border-gray-50">
                <p className="text-xs text-gray-400">Career Span</p>
                <p className="text-sm font-semibold text-gray-900">
                  {entries[0].order_date.substring(0, 4)} — {entries[entries.length - 1].order_date.substring(0, 4)}
                </p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Career Timeline</h2>
            <OfficerTimeline entries={entries} />
          </div>
        </div>
      </div>
    </div>
  );
}
