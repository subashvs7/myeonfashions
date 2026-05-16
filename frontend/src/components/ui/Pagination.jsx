import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, lastPage, onPageChange }) {
  if (lastPage <= 1) return null;
  const pages = Array.from({ length: lastPage }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
        className="p-2 border disabled:opacity-40 hover:bg-brand-primary hover:text-white transition-colors">
        <ChevronLeft size={16} />
      </button>
      {pages.map((p) => (
        <button key={p} onClick={() => onPageChange(p)}
          className={`w-9 h-9 text-sm font-medium border transition-colors ${p === currentPage ? 'bg-brand-primary text-white border-brand-primary' : 'hover:bg-gray-100'}`}>
          {p}
        </button>
      ))}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === lastPage}
        className="p-2 border disabled:opacity-40 hover:bg-brand-primary hover:text-white transition-colors">
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
