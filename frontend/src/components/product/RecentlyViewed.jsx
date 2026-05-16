import { useLocalStorage } from '../../hooks/useLocalStorage';
import ProductCard from './ProductCard';

export default function RecentlyViewed() {
  const [viewed] = useLocalStorage('recently_viewed', []);
  if (!viewed.length) return null;
  return (
    <section className="page-container py-12 border-t">
      <h2 className="section-heading mb-6">Recently Viewed</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
        {viewed.slice(0, 5).map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
}
