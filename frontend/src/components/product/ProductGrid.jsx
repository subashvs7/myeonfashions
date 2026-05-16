import ProductCard from './ProductCard';
import { ProductGridSkeleton } from '../ui/Skeleton';
import EmptyState from '../ui/EmptyState';
import { ShoppingBag } from 'lucide-react';

export default function ProductGrid({ products, isLoading, columns = 4 }) {
  if (isLoading) return <ProductGridSkeleton count={columns * 2} />;
  if (!products?.length) return <EmptyState icon={ShoppingBag} title="No products found" description="Try adjusting your filters" />;

  const cols = { 2: 'grid-cols-2', 3: 'grid-cols-2 sm:grid-cols-3', 4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' };
  return (
    <div className={`grid ${cols[columns] || cols[4]} gap-4 md:gap-6`}>
      {products.map((product) => <ProductCard key={product.id} product={product} />)}
    </div>
  );
}
