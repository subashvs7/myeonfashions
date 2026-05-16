import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchApi } from '../api/search';
import ProductGrid from '../components/product/ProductGrid';
import Pagination from '../components/ui/Pagination';
import { useState } from 'react';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['search', q, page],
    queryFn: () => searchApi.search(q, { page }).then(r => r.data.data),
    enabled: q.length >= 2,
  });

  return (
    <div className="page-container py-8">
      <h1 className="font-heading text-3xl font-bold text-brand-primary mb-2">Search Results</h1>
      <p className="text-gray-500 mb-8">Showing results for "<strong>{q}</strong>" — {data?.total || 0} products</p>
      <ProductGrid products={data?.data} isLoading={isLoading} />
      <Pagination currentPage={data?.current_page || 1} lastPage={data?.last_page || 1} onPageChange={setPage} />
    </div>
  );
}
