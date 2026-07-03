import officersData from '../../public/data/officers.json';
import Fuse from 'fuse.js';

let fuseInstance = null;

function getFuse() {
  if (!fuseInstance) {
    fuseInstance = new Fuse(officersData, {
      keys: ['name', 'designation', 'order_number', 'section', 'from_role', 'to_role', 'from_location', 'to_location'],
      threshold: 0.4,
      includeScore: true,
    });
  }
  return fuseInstance;
}

export function getAllOfficers() {
  return officersData;
}

export function getUniqueOfficers() {
  const seen = new Set();
  return officersData.filter(o => {
    if (seen.has(o.name)) return false;
    seen.add(o.name);
    return true;
  });
}

export function getOfficerByName(name) {
  return officersData
    .filter(o => o.name.toLowerCase() === name.toLowerCase())
    .sort((a, b) => new Date(a.order_date) - new Date(b.order_date));
}

export function getOfficersByDesignation(desig) {
  return officersData.filter(o => o.designation === desig);
}

export function getOfficersByYear(year) {
  return officersData.filter(o => o.order_year === parseInt(year));
}

export function searchOfficers(query) {
  if (!query || query.trim() === '') return [];
  const fuse = getFuse();
  const results = fuse.search(query);
  return results.map(r => r.item);
}

export function getStats() {
  const uniqueNames = new Set(officersData.map(o => o.name));
  const uniqueOrders = new Set(officersData.map(o => o.order_number));
  const years = [...new Set(officersData.map(o => o.order_year))].sort();

  const ordersByYear = {};
  officersData.forEach(o => {
    if (!ordersByYear[o.order_year]) ordersByYear[o.order_year] = new Set();
    ordersByYear[o.order_year].add(o.order_number);
  });
  const ordersByYearCount = Object.fromEntries(
    Object.entries(ordersByYear).map(([year, orders]) => [year, orders.size])
  );

  const desigCounts = {};
  officersData.forEach(o => {
    desigCounts[o.designation] = (desigCounts[o.designation] || 0) + 1;
  });

  const monthCounts = {};
  officersData.forEach(o => {
    const month = o.order_date.substring(0, 7);
    monthCounts[month] = (monthCounts[month] || 0) + 1;
  });

  const docTypeCounts = {};
  officersData.forEach(o => {
    docTypeCounts[o.doc_type] = (docTypeCounts[o.doc_type] || 0) + 1;
  });

  const recentOrders = getRecentOrders(10);

  return {
    totalOfficers: uniqueNames.size,
    totalOrders: uniqueOrders.size,
    totalEntries: officersData.length,
    yearRange: years.length > 0 ? `${years[0]} - ${years[years.length - 1]}` : 'N/A',
    ordersByYear: ordersByYearCount,
    designationCounts: desigCounts,
    monthCounts,
    docTypeCounts,
    recentOrders,
  };
}

function getRecentOrders(limit = 10) {
  const seen = new Set();
  const unique = [];
  for (const o of [...officersData].sort((a, b) => new Date(b.order_date) - new Date(a.order_date))) {
    if (!seen.has(o.order_number)) {
      seen.add(o.order_number);
      const officerNames = officersData
        .filter(x => x.order_number === o.order_number)
        .map(x => x.name);
      unique.push({
        order_number: o.order_number,
        order_date: o.order_date,
        order_year: o.order_year,
        officer_count: officerNames.length,
        officers: officerNames,
      });
    }
  }
  return unique.slice(0, limit);
}

export function groupByYear() {
  const groups = {};
  officersData.forEach(o => {
    if (!groups[o.order_year]) groups[o.order_year] = {};
    const month = o.order_date.substring(0, 7);
    if (!groups[o.order_year][month]) groups[o.order_year][month] = new Set();
    groups[o.order_year][month].add(o.order_number);
  });
  const result = {};
  Object.keys(groups).sort().forEach(year => {
    result[year] = {};
    Object.keys(groups[year]).sort().forEach(month => {
      result[year][month] = [...groups[year][month]];
    });
  });
  return result;
}
