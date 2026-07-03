import Link from 'next/link';

export default function OfficerCard({ officer }) {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const date = new Date(officer.order_date);
  const formattedDate = `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;

  const badgeColor = {
    transfer: 'bg-blue-100 text-blue-800',
    promotion: 'bg-green-100 text-green-800',
    deputation: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <Link
          href={`/officer/${encodeURIComponent(officer.name)}`}
          className="text-lg font-semibold text-railway-blue hover:text-blue-700 transition-colors"
        >
          {officer.name}
        </Link>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeColor[officer.doc_type] || 'bg-gray-100 text-gray-800'}`}>
          {officer.doc_type}
        </span>
      </div>
      <div className="space-y-1.5 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{officer.designation}</span>
          <span className="text-gray-400">&middot;</span>
          <span>{officer.section}</span>
        </div>
        <div className="text-gray-500">
          {officer.from_role} → {officer.to_role}
        </div>
        <div className="text-gray-500">
          {officer.from_location} → {officer.to_location}
        </div>
        <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-50">
          <span className="text-xs text-gray-400">{officer.order_number}</span>
          <span className="text-xs text-gray-400">{formattedDate}</span>
        </div>
      </div>
    </div>
  );
}
