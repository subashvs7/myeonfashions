import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '../api/categories';
import CategoryBanner from '../components/category/CategoryBanner';
import FilterSidebar from '../components/category/FilterSidebar';
import SortDropdown from '../components/category/SortDropdown';
import ActiveFilters from '../components/category/ActiveFilters';
import ProductGrid from '../components/product/ProductGrid';
import Pagination from '../components/ui/Pagination';
import Breadcrumb from '../components/ui/Breadcrumb';

export default function CategoryPage() {
  const { slug } = useParams();
  const [filters, setFilters] = useState({});
  const [sort, setSort]       = useState('');
  const [page, setPage]       = useState(1);

  const { data: catData } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => categoriesApi.getOne(slug).then(r => r.data.data),
  });

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['category-products', slug, filters, sort, page],
    queryFn: () => categoriesApi.getProducts(slug, { ...filters, sort, page }).then(r => r.data.data),
  });

  const updateFilter = (newFilters) => { setFilters(f => ({ ...f, ...newFilters })); setPage(1); };
  const removeFilter = (key) => { setFilters(f => { const c = { ...f }; delete c[key]; return c; }); setPage(1); };

  return (
    <div>
      <CategoryBanner category={catData} />
      <div className="page-container py-8">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: catData?.name || slug }]} />

        <div className="flex gap-8 mt-6">
          <FilterSidebar filters={filters} onFilterChange={updateFilter} />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <p className="text-sm text-gray-500">{productsData?.total || 0} products</p>
              <div className="flex items-center gap-4 flex-wrap">
                <ActiveFilters filters={filters} onRemove={removeFilter} onClearAll={() => setFilters({})} />
                <SortDropdown value={sort} onChange={(v) => { setSort(v); setPage(1); }} />
              </div>
            </div>

            <ProductGrid products={productsData?.data} isLoading={isLoading} />
            <Pagination currentPage={productsData?.current_page || 1} lastPage={productsData?.last_page || 1} onPageChange={setPage} />
          </div>
        </div>
      </div>
    </div>
  );
}
