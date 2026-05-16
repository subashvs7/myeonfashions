import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUiStore } from '../../stores/uiStore';
import { useDebounce } from '../../hooks/useDebounce';
import { useQuery } from '@tanstack/react-query';
import { searchApi } from '../../api/search';

export default function SearchBar() {
  const { searchOpen, closeSearch } = useUiStore();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const debounced = useDebounce(query, 300);

  const { data } = useQuery({
    queryKey: ['search-suggestions', debounced],
    queryFn: () => searchApi.suggestions(debounced).then(r => r.data.data),
    enabled: debounced.length >= 2,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      closeSearch();
      setQuery('');
    }
  };

  const handleSelect = (slug) => {
    navigate(`/products/${slug}`);
    closeSearch();
    setQuery('');
  };

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center pt-20 px-4"
          onClick={closeSearch}
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }}
            className="bg-white w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSearch} className="flex items-center border-b border-gray-200">
              <Search size={20} className="ml-4 text-gray-400 shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sarees, kurtas, lehengas..."
                className="flex-1 px-4 py-4 text-base outline-none"
              />
              <button type="button" onClick={closeSearch} className="p-4"><X size={20}/></button>
            </form>
            {data?.length > 0 && (
              <div className="border-t">
                {data.map((item) => (
                  <button key={item.id} onClick={() => handleSelect(item.slug)} className="w-full text-left px-5 py-3 text-sm hover:bg-brand-bg flex items-center gap-3">
                    <Search size={14} className="text-gray-400" /> {item.name}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
