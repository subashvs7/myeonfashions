import { motion } from 'framer-motion';

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center gap-4"
    >
      {Icon && <Icon size={56} className="text-gray-300" />}
      <h3 className="font-heading text-2xl font-semibold text-brand-primary">{title}</h3>
      {description && <p className="text-gray-500 max-w-sm">{description}</p>}
      {action}
    </motion.div>
  );
}
