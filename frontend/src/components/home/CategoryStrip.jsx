import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '../../api/categories';

export default function CategoryStrip() {
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll().then(r => r.data.data),
  });

  const icons = ['🥻', '👗', '🎀', '👘', '🧣', '👔', '💍'];

  return (
    <section className="page-container py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="section-heading">Shop by Category</h2>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-4">
        {categories?.slice(0, 7).map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.08 }}
          >
            <Link to={`/categories/${cat.slug}`} className="group flex flex-col items-center gap-3">
              <div
                className="w-full aspect-square flex items-center justify-center text-3xl transition-transform group-hover:scale-105"
                style={{ backgroundColor: cat.banner_color + '20', border: `2px solid ${cat.banner_color}30` }}
              >
                <span>{icons[i % icons.length]}</span>
              </div>
              <span className="text-xs font-medium text-center text-brand-text group-hover:text-brand-primary transition-colors">{cat.name}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
