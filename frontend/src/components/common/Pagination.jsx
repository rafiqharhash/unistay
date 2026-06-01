import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-8" role="navigation" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="btn-ghost p-2 disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Previous page"
        id="pagination-prev"
      >
        <ChevronLeft size={18} />
      </button>

      {startPage > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className={`w-9 h-9 rounded-xl text-sm font-medium transition-all duration-200 ${
              currentPage === 1
                ? 'bg-primary-500 text-white shadow-glow-orange'
                : 'btn-ghost'
            }`}
          >
            1
          </button>
          {startPage > 2 && <span className="text-dark-400 px-1">…</span>}
        </>
      )}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          id={`pagination-page-${page}`}
          className={`w-9 h-9 rounded-xl text-sm font-medium transition-all duration-200 ${
            currentPage === page
              ? 'bg-primary-500 text-white shadow-glow-orange'
              : 'btn-ghost'
          }`}
          aria-current={currentPage === page ? 'page' : undefined}
        >
          {page}
        </button>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="text-dark-400 px-1">…</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className={`w-9 h-9 rounded-xl text-sm font-medium transition-all duration-200 ${
              currentPage === totalPages
                ? 'bg-primary-500 text-white shadow-glow-orange'
                : 'btn-ghost'
            }`}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="btn-ghost p-2 disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Next page"
        id="pagination-next"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

export default Pagination;
