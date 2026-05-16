import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../../api/products';
import ProductCard from '../product/ProductCard';
import { ProductGridSkeleton } from '../ui/Skeleton';
import Button from '../ui/Button';

export default function NewArrivals() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['new-arrivals'],
    queryFn: () => productsApi.getNewArrivals().then(r => r.data.data),
  });

  return (
    <section className="page-container py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex items-end justify-between mb-8"
      >
        <div>
          <p className="text-brand-accent text-xs tracking-[0.3em] uppercase mb-1">Fresh Drops</p>
          <h2 className="section-heading">New Arrivals</h2>
        </div>
        <Link to="/new-arrivals"><Button variant="outline" size="sm">View All</Button></Link>
      </motion.div>

      {isLoading ? <ProductGridSkeleton /> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products?.slice(0, 8).map((product, i) => (
            <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
