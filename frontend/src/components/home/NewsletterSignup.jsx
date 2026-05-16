import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    toast.success('Thank you for subscribing!');
    setEmail('');
  };
  return (
    <section className="bg-brand-primary py-16">
      <div className="page-container text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-brand-accent text-xs tracking-[0.3em] uppercase mb-3 font-medium">Stay in Style</p>
          <h2 className="font-heading text-4xl font-bold text-white mb-2">Join the Myeon Casuals Circle</h2>
          <p className="text-gray-300 text-sm mb-8 max-w-sm mx-auto">Get exclusive early access to new arrivals, festive collections & special discounts.</p>
          <form onSubmit={handleSubmit} className="flex max-w-md mx-auto gap-0">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Your email address" required
              className="flex-1 px-4 py-3 text-sm bg-white outline-none text-brand-text" />
            <button type="submit"
              className="bg-brand-accent text-white px-6 py-3 text-sm tracking-widest uppercase font-medium hover:opacity-90 transition-opacity">
              Subscribe
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
