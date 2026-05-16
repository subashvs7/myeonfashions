import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function EditorialBanner() {
  const blocks = [
    { title: 'Silk Sarees', subtitle: 'Timeless Elegance', link: '/categories/sarees', bg: '#2D1B69', accent: '#F59E0B' },
    { title: 'Bridal Edit', subtitle: 'Your Perfect Day', link: '/categories/lehengas', bg: '#7C3AED', accent: '#FAFAF8' },
    { title: 'Daily Wear', subtitle: 'Comfort & Style', link: '/categories/kurtas', bg: '#1E40AF', accent: '#F59E0B' },
  ];

  return (
    <section className="page-container py-16">
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {blocks.map((block, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.15 }}
            whileHover={{ y: -4 }}
          >
            <Link to={block.link}
              className="block relative overflow-hidden group"
              style={{ backgroundColor: block.bg, minHeight: 280 }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative p-8 flex flex-col justify-end h-full" style={{ minHeight: 280 }}>
                <p className="text-xs tracking-[0.3em] uppercase mb-2 font-medium" style={{ color: block.accent }}>{block.subtitle}</p>
                <h3 className="font-heading text-3xl font-bold text-white">{block.title}</h3>
                <span className="mt-4 text-xs tracking-widest uppercase text-white/70 group-hover:text-white transition-colors">
                  Explore →
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
