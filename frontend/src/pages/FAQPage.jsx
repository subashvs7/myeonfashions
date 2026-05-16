import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const FAQS = [
  {
    category: 'Orders & Payment',
    items: [
      { q: 'How do I place an order?', a: 'Browse our catalogue, add items to your cart, and proceed to checkout. You\'ll need to create an account or log in to complete the purchase.' },
      { q: 'What payment methods do you accept?', a: 'We accept UPI, debit/credit cards, net banking via Razorpay, and Cash on Delivery (where available).' },
      { q: 'Can I modify or cancel my order?', a: 'Orders can be cancelled within 1 hour of placement from your My Orders page. After that, contact us immediately and we\'ll try to help.' },
      { q: 'Will I receive an invoice?', a: 'Yes. A GST invoice is available to download from your My Orders page once the order is confirmed.' },
    ],
  },
  {
    category: 'Shipping & Delivery',
    items: [
      { q: 'How long does delivery take?', a: 'Standard delivery takes 5–7 business days. Express delivery (where available) takes 2–3 business days.' },
      { q: 'Do you offer free shipping?', a: 'Yes! Orders above ₹999 qualify for free shipping. Orders below that attract a flat shipping fee shown at checkout.' },
      { q: 'Can I track my order?', a: 'Yes. Once your order ships, you\'ll receive a tracking number via SMS/email. You can also track it from My Orders.' },
      { q: 'Do you deliver outside India?', a: 'Currently we only ship within India. International shipping is coming soon.' },
    ],
  },
  {
    category: 'Returns & Exchanges',
    items: [
      { q: 'What is your return policy?', a: 'We offer a 7-day return and exchange policy. Items must be unworn, unwashed, with original tags and packaging. See our Returns page for full details.' },
      { q: 'How do I initiate a return?', a: 'Log in to your account, go to My Orders, select the order, and click "Request Return". Our team will review and approve within 48 hours.' },
      { q: 'When will I get my refund?', a: 'Refunds are processed within 5–7 business days after we receive and inspect the returned item. It may take an additional 3–5 days to reflect in your bank account.' },
      { q: 'Can I exchange for a different size or colour?', a: 'Yes, exchanges are subject to stock availability. Raise a return request and select "Exchange" as the reason.' },
    ],
  },
  {
    category: 'Products & Sizing',
    items: [
      { q: 'How do I choose the right size?', a: 'Refer to our Size Guide for detailed measurements. Each product also has a size chart in the product details section.' },
      { q: 'Are the colours accurate in photos?', a: 'We photograph products in natural light to represent colours as accurately as possible. Minor variations may occur due to screen settings and fabric dye lots.' },
      { q: 'Do you offer customisation?', a: 'At this time, we do not offer customisation. All products are available in the listed sizes and colours only.' },
      { q: 'How should I care for my garment?', a: 'Care instructions are printed on the garment label and also listed in the product description. Most ethnic wear is recommended for dry cleaning or gentle hand wash.' },
    ],
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b last:border-b-0">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-left gap-4">
        <span className="text-sm font-medium text-gray-800">{q}</span>
        <ChevronDown size={16} className={`text-brand-primary flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            <p className="text-sm text-gray-600 pb-4 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
  return (
    <div className="page-container py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl font-bold text-brand-primary mb-3">Frequently Asked Questions</h1>
          <p className="text-gray-500 max-w-md mx-auto">Can't find your answer here? <Link to="/contact" className="text-brand-primary hover:underline">Contact us</Link> and we'll help.</p>
        </div>

        <div className="max-w-2xl mx-auto space-y-10">
          {FAQS.map(group => (
            <div key={group.category}>
              <h2 className="font-heading text-lg font-bold text-brand-primary mb-4 pb-2 border-b-2 border-brand-accent inline-block">
                {group.category}
              </h2>
              <div className="bg-white border">
                {group.items.map((item, i) => <FAQItem key={i} {...item} />)}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
