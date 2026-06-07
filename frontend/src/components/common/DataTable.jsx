import React, { useState } from 'react';
import Loading from './Loading';

const DataTable = ({
  columns = [], // [{ header, key, render }]
  data = [],
  loading = false,
  pageSize = 5,
  emptyMessage = 'No records available.'
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = data.slice(startIndex, startIndex + pageSize);

  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(totalPages, page)));
  };

  if (loading) {
    return <Loading message="Loading data rows..." />;
  }

  return (
    <div className="space-y-4">
      {/* Table Panel */}
      <div className="bg-white border border-secondary-200 rounded-xl shadow-sm overflow-hidden w-full">
        {data.length === 0 ? (
          <div className="p-8 text-center text-sm text-secondary-500 font-medium">
            {emptyMessage}
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm border-collapse text-secondary-700">
              <thead className="bg-secondary-50 border-b border-secondary-200 text-secondary-500 text-xs font-semibold uppercase tracking-wider select-none">
                <tr>
                  {columns.map((col, idx) => (
                    <th key={col.key || idx} className="px-6 py-3.5">
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-200">
                {paginatedData.map((row, rowIdx) => (
                  <tr key={row.id || rowIdx} className="hover:bg-secondary-50/50 transition-colors">
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className="px-6 py-4">
                        {col.render ? col.render(row, rowIdx) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {data.length > pageSize && (
        <div className="flex items-center justify-between px-2 text-sm text-secondary-500 select-none flex-wrap gap-2 shrink-0">
          <div>
            Showing <span className="font-semibold text-secondary-800">{startIndex + 1}</span> to{' '}
            <span className="font-semibold text-secondary-800">
              {Math.min(startIndex + pageSize, data.length)}
            </span>{' '}
            of <span className="font-semibold text-secondary-800">{data.length}</span> rows
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-secondary-300 bg-white hover:bg-secondary-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              Previous
            </button>
            
            <div className="flex items-center text-xs font-semibold">
              <span className="px-3 py-1.5 rounded-lg bg-primary-50 border border-primary-100 text-primary-750">
                Page {currentPage} of {totalPages}
              </span>
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-secondary-300 bg-white hover:bg-secondary-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
