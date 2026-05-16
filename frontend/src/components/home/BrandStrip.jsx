import { motion } from 'framer-motion';
import { ShieldCheck, Truck, RotateCcw, Star } from 'lucide-react';

const FEATURES = [
  { icon: ShieldCheck, title: '100% Authentic', desc: 'Genuine products, quality assured' },
  { icon: Truck, title: 'Fast Delivery', desc: 'Pan India delivery in 3-7 days' },
  { icon: RotateCcw, title: 'Easy Returns', desc: '15-day hassle-free returns' },
  { icon: Star, title: 'Premium Quality', desc: 'Handpicked, premium ethnic wear' },
];

export default function BrandStrip() {
  return (
    <section className="border-y border-gray-100 py-10 bg-white">
      <div className="page-container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center bg-brand-primary/10 shrink-0">
                <f.icon size={20} className="text-brand-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-text">{f.title}</p>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
