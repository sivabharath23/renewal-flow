'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalCount,
  limit,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startRange = (currentPage - 1) * limit + 1;
  const endRange = Math.min(currentPage * limit, totalCount);

  // Generate page numbers to display, including ellipses for large ranges
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      if (start > 2) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-white border-t border-slate-100/80">
      {/* Range Info */}
      <div className="text-xs text-slate-500 font-semibold">
        Showing <span className="text-slate-800 font-extrabold">{startRange}</span> to{' '}
        <span className="text-slate-800 font-extrabold">{endRange}</span> of{' '}
        <span className="text-slate-800 font-extrabold">{totalCount}</span> entries
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-1.5">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-all disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-500 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-400 select-none"
                >
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            const isActive = pageNum === currentPage;

            return (
              <button
                key={`page-${pageNum}`}
                onClick={() => onPageChange(pageNum)}
                className={`min-w-9 h-9 px-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                  isActive
                    ? 'bg-blue-600 border border-blue-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 active:bg-slate-100'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-all disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-500 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
