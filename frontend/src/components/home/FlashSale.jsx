import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../../api/products';
import ProductCard from '../product/ProductCard';

function Countdown({ target }) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const timer = setInterval(() => {
      const diff = target - Date.now();
      if (diff <= 0) { clearInterval(timer); return; }
      setTimeLeft({ h: Math.floor(diff / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000) });
    }, 1000);
    return () => clearInterval(timer);
  }, [target]);
  return (
    <div className="flex gap-2 text-white">
      {[timeLeft.h, timeLeft.m, timeLeft.s].map((t, i) => (
        <span key={i} className="bg-white/20 px-3 py-1 text-xl font-bold min-w-[3rem] text-center">
          {String(t).padStart(2, '0')}
        </span>
      ))}
    </div>
  );
}

export default function FlashSale() {
  const target = Date.now() + 6 * 3600000;
  const { data: products } = useQuery({ queryKey: ['bestsellers'], queryFn: () => productsApi.getBestsellers().then(r => r.data.data) });

  return (
    <section className="bg-brand-primary py-16">
      <div className="page-container">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
          <div>
            <p className="text-brand-accent text-xs tracking-[0.3em] uppercase mb-1 font-medium">Limited Time</p>
            <h2 className="font-heading text-4xl font-bold text-white">Flash Sale</h2>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-white text-sm">Ends in:</p>
            <Countdown target={target} />
          </div>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products?.slice(0, 4).map((product, i) => (
            <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
              <ProductCard product={product} darkMode />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
