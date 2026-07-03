'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Fuse from 'fuse.js';

export default function SearchBar({ placeholder = 'Search by name, designation, order number...', large = false }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allOfficers, setAllOfficers] = useState([]);
  const router = useRouter();
  const wrapperRef = useRef(null);

  const fuse = useMemo(() => {
    if (allOfficers.length === 0) return null;
    return new Fuse(allOfficers, {
      keys: ['name', 'designation', 'order_number', 'section', 'from_role', 'to_role'],
      threshold: 0.4,
      includeScore: true,
    });
  }, [allOfficers]);

  useEffect(() => {
    fetch('/data/officers.json')
      .then(r => r.json())
      .then(data => setAllOfficers(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2 || !fuse) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(() => {
      const results = fuse.search(query);
      const seen = new Set();
      const unique = results
        .filter(r => {
          if (seen.has(r.item.name)) return false;
          seen.add(r.item.name);
          return true;
        })
        .map(r => r.item)
        .slice(0, 8);
      setSuggestions(unique);
      setShowSuggestions(true);
    }, 200);
    return () => clearTimeout(timer);
  }, [query, fuse]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (name) => {
    router.push(`/officer/${encodeURIComponent(name)}`);
    setShowSuggestions(false);
    setQuery('');
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <svg
            className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 ${large ? 'w-6 h-6' : 'w-5 h-5'}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
            placeholder={placeholder}
            className={`w-full pl-12 pr-4 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-railway-blue focus:border-transparent ${
              large ? 'py-4 text-lg' : 'py-3 text-base'
            }`}
          />
        </div>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((item, idx) => (
            <button
              key={idx}
              onClick={() => selectSuggestion(item.name)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="font-medium text-gray-900">{item.name}</div>
              <div className="text-sm text-gray-500">
                {item.designation} &middot; {item.section} &middot; {item.order_number}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
