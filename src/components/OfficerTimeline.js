export default function OfficerTimeline({ entries }) {
  if (!entries || entries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>No history entries found.</p>
      </div>
    );
  }

  const sorted = [...entries].sort((a, b) => new Date(b.order_date) - new Date(a.order_date));

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

      <div className="space-y-6">
        {sorted.map((entry, idx) => {
          const date = new Date(entry.order_date);
          const formattedDate = `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;

          const typeConfig = {
            transfer: { color: 'bg-blue-500', label: 'Transfer', dotColor: 'ring-blue-200' },
            promotion: { color: 'bg-green-500', label: 'Promotion', dotColor: 'ring-green-200' },
            deputation: { color: 'bg-purple-500', label: 'Deputation', dotColor: 'ring-purple-200' },
          };

          const config = typeConfig[entry.doc_type] || typeConfig.transfer;

          return (
            <div key={idx} className="relative pl-14">
              {/* Timeline dot */}
              <div className={`absolute left-4 w-4 h-4 rounded-full ${config.color} ring-4 ${config.dotColor} -translate-x-1/2 mt-1.5`}></div>

              <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    entry.doc_type === 'promotion' ? 'bg-green-100 text-green-800' :
                    entry.doc_type === 'deputation' ? 'bg-purple-100 text-purple-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {config.label}
                  </span>
                  <span className="text-sm text-gray-400">{formattedDate}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Designation</p>
                    <p className="font-medium text-gray-900">{entry.designation}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Section</p>
                    <p className="font-medium text-gray-900">{entry.section}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">From</p>
                    <p className="text-sm text-gray-700">{entry.from_role} — {entry.from_location}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">To</p>
                    <p className="text-sm text-gray-700">{entry.to_role} — {entry.to_location}</p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-xs text-gray-400">{entry.order_number}</span>
                  {entry.remarks && (
                    <span className="text-xs text-gray-400 italic">{entry.remarks}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
