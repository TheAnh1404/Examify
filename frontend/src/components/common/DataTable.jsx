import React, { useState } from 'react';
import Loading from './Loading';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DataTable = ({
  columns = [], // [{ header, key, render, className }]
  data = [],
  loading = false,
  pageSize = 10,
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
    return (
      <div className="saas-card p-12 flex justify-center items-center">
        <Loading message="Fetching records..." />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Table Container */}
      <div className="saas-card">
        {data.length === 0 ? (
          <div className="p-12 text-center text-sm text-secondary-500 font-medium">
            {emptyMessage}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-secondary-50/30 border-b border-secondary-50">
                  {columns.map((col, idx) => (
                    <th 
                      key={col.key || idx} 
                      className={`px-8 py-5 text-[10px] font-extrabold text-secondary-400 uppercase tracking-[0.15em] ${col.className || ''}`}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-50">
                {paginatedData.map((row, rowIdx) => (
                  <tr key={row.id || rowIdx} className="hover:bg-primary-50/30 transition-colors group">
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className={`px-8 py-5 text-secondary-700 font-semibold ${col.className || ''}`}>
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

      {/* Modern Pagination */}
      {data.length > pageSize && (
        <div className="flex items-center justify-between px-2 py-1">
          <p className="text-sm text-secondary-500">
            Showing <span className="font-bold text-secondary-900">{startIndex + 1}</span> to{' '}
            <span className="font-bold text-secondary-900">
              {Math.min(startIndex + pageSize, data.length)}
            </span>{' '}
            of <span className="font-bold text-secondary-900">{data.length}</span> results
          </p>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-xl border border-secondary-100 bg-white text-secondary-500 hover:bg-secondary-50 hover:text-secondary-900 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-1.5">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                // Only show a limited range of pages if totalPages is large
                if (totalPages > 5 && Math.abs(pageNum - currentPage) > 2) return null;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`h-9 w-9 rounded-xl text-sm font-extrabold transition-all ${
                      currentPage === pageNum
                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/20'
                        : 'text-secondary-400 hover:bg-secondary-50 hover:text-secondary-900'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl border border-secondary-100 bg-white text-secondary-500 hover:bg-secondary-50 hover:text-secondary-900 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-sm"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
