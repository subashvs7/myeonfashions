import { motion } from 'framer-motion';

export default function CategoryBanner({ category }) {
  return (
    <div className="relative h-48 md:h-64 flex items-center overflow-hidden"
      style={{ backgroundColor: category?.banner_color || '#2D1B69' }}>
      {category?.banner_image && (
        <img src={`/storage/${category.banner_image}`} className="absolute inset-0 w-full h-full object-cover opacity-40" alt="" />
      )}
      <div className="relative page-container text-white">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs tracking-[0.3em] uppercase mb-2 text-white/70">{category?.parent?.name || 'Collections'}</p>
          <h1 className="font-heading text-4xl md:text-5xl font-bold">{category?.name}</h1>
          {category?.description && <p className="mt-2 text-sm text-white/80 max-w-md">{category.description}</p>}
        </motion.div>
      </div>
    </div>
  );
}
