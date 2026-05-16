import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle, XCircle, RotateCcw, RefreshCw, Truck, CreditCard } from 'lucide-react';

const Step = ({ n, title, desc }) => (
  <div className="flex gap-4">
    <div className="w-8 h-8 bg-brand-primary text-white flex items-center justify-center font-bold text-sm flex-shrink-0">{n}</div>
    <div>
      <p className="font-semibold text-gray-800 text-sm">{title}</p>
      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
    </div>
  </div>
);

export default function ReturnsPage() {
  const eligible = [
    'Item received is damaged or defective',
    'Wrong product or size delivered',
    'Item is significantly different from the description',
    'Unworn, unwashed items within 7 days of delivery',
  ];

  const notEligible = [
    'Items returned after 7 days of delivery',
    'Worn, washed, or altered garments',
    'Items without original tags and packaging',
    'Customised or made-to-order products',
    'Undergarments and innerwear (hygiene reasons)',
    'Sale or clearance items marked "non-returnable"',
  ];

  return (
    <div className="page-container py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl font-bold text-brand-primary mb-3">Returns & Exchanges</h1>
          <p className="text-gray-500 max-w-lg mx-auto">We want you to love every piece you receive. If something isn't right, we'll make it right.</p>
        </div>

        {/* Key highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          {[
            { icon: RotateCcw, title: '7-Day Returns', desc: 'Return eligible items within 7 days of delivery' },
            { icon: RefreshCw, title: 'Easy Exchanges', desc: 'Swap for a different size or colour, subject to availability' },
            { icon: CreditCard, title: 'Full Refund', desc: 'Refund to original payment method within 5–7 business days' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center border p-6 bg-white">
              <div className="w-12 h-12 bg-brand-primary/10 flex items-center justify-center mx-auto mb-3">
                <Icon size={22} className="text-brand-primary" />
              </div>
              <p className="font-semibold text-gray-800 text-sm mb-1">{title}</p>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          {/* Eligible */}
          <div className="border bg-white p-6">
            <h2 className="font-heading text-lg font-bold text-brand-primary mb-4 flex items-center gap-2">
              <CheckCircle size={18} className="text-green-500" /> Eligible for Return
            </h2>
            <ul className="space-y-2">
              {eligible.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Not eligible */}
          <div className="border bg-white p-6">
            <h2 className="font-heading text-lg font-bold text-brand-primary mb-4 flex items-center gap-2">
              <XCircle size={18} className="text-red-400" /> Not Eligible
            </h2>
            <ul className="space-y-2">
              {notEligible.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <XCircle size={14} className="text-red-400 mt-0.5 flex-shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* How to return */}
        <div className="border bg-white p-8 mb-10">
          <h2 className="font-heading text-xl font-bold text-brand-primary mb-6">How to Initiate a Return</h2>
          <div className="space-y-5">
            <Step n="1" title="Log in to your account" desc="Go to My Orders and find the order you want to return." />
            <Step n="2" title="Request a return" desc="Click 'Request Return', select the item(s), and choose the reason (Return / Exchange)." />
            <Step n="3" title="Wait for approval" desc="Our team reviews your request within 48 hours and sends a pickup confirmation." />
            <Step n="4" title="Pack & hand over" desc="Pack the item securely in its original packaging with all tags. Hand it to the pickup agent." />
            <Step n="5" title="Refund or exchange" desc="Once received and inspected (1–2 business days), your refund or exchange is processed." />
          </div>
        </div>

        {/* Pickup & shipping */}
        <div className="border bg-brand-bg p-6 flex items-start gap-4 mb-8">
          <Truck size={24} className="text-brand-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-brand-primary text-sm mb-1">Free Return Pickup</p>
            <p className="text-xs text-gray-600">We arrange a free doorstep pickup for all approved returns. If pickup is unavailable in your area, we'll share a courier address and reimburse shipping up to ₹100.</p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500">
          Still have questions? <Link to="/contact" className="text-brand-primary hover:underline font-medium">Contact our support team</Link> — we reply within 24 hours.
        </p>
      </motion.div>
    </div>
  );
}
