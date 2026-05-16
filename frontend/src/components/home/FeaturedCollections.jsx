import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../../api/products';
import ProductCard from '../product/ProductCard';
import { Skeleton } from '../ui/Skeleton';

export default function FeaturedCollections() {
  const { data: products, isLoading } = useQuery({
    queryKey: ['featured'],
    queryFn: () => productsApi.getFeatured().then(r => r.data.data),
  });

  return (
    <section className="page-container py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="text-center mb-12">
        <p className="text-brand-accent text-xs tracking-[0.3em] uppercase mb-2">Handpicked for You</p>
        <h2 className="section-heading">Featured Collections</h2>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4]" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products?.slice(0, 4).map((product, i) => (
            <motion.div key={product.id} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
