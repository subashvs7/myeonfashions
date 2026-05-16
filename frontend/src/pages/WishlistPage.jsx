import { useQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { wishlistApi } from '../api/wishlist';
import ProductCard from '../components/product/ProductCard';
import EmptyState from '../components/ui/EmptyState';
import { ProductGridSkeleton } from '../components/ui/Skeleton';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

export default function WishlistPage() {
  const { data: items, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistApi.get().then(r => r.data.data),
  });

  return (
    <div className="page-container py-8">
      <h1 className="font-heading text-3xl font-bold text-brand-primary mb-8">My Wishlist ({items?.length || 0})</h1>
      {isLoading ? <ProductGridSkeleton /> : items?.length === 0 ? (
        <EmptyState icon={Heart} title="Your wishlist is empty" description="Save your favourite pieces to wishlist"
          action={<Link to="/categories/sarees"><Button>Browse Collections</Button></Link>} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map(item => <ProductCard key={item.id} product={item.product} />)}
        </div>
      )}
    </div>
  );
}
