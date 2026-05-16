import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="font-heading text-xl font-bold text-brand-primary mb-3">{title}</h2>
    <div className="text-sm text-gray-600 space-y-2 leading-relaxed">{children}</div>
  </div>
);

export default function TermsPage() {
  return (
    <div className="page-container py-12 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-10">
          <h1 className="font-heading text-4xl font-bold text-brand-primary mb-2">Terms of Service</h1>
          <p className="text-xs text-gray-400">Last updated: January 2025</p>
        </div>

        <Section title="1. Acceptance of Terms">
          <p>By accessing or using Myeon Casuals, you agree to be bound by these Terms of Service. If you do not agree, please do not use our website.</p>
        </Section>

        <Section title="2. Products & Pricing">
          <p>All product prices are listed in Indian Rupees (₹) and are inclusive of applicable taxes unless stated otherwise. We reserve the right to change prices at any time without prior notice.</p>
          <p>Product images are for illustrative purposes. Actual colours may vary slightly due to screen display differences and fabric lot variations.</p>
        </Section>

        <Section title="3. Orders & Payment">
          <p>Placing an order constitutes an offer to purchase. We reserve the right to accept or decline any order. You will receive an order confirmation email once payment is successfully processed.</p>
          <p>We accept payments via Razorpay (UPI, debit/credit cards, net banking) and Cash on Delivery (where enabled). All online transactions are encrypted and secure.</p>
        </Section>

        <Section title="4. Shipping & Delivery">
          <p>We ship across India. Delivery timelines are estimates and depend on your location. Delays due to courier issues, natural events, or public holidays are beyond our control.</p>
          <p>Shipping charges, if any, are displayed at checkout before payment.</p>
        </Section>

        <Section title="5. Returns & Exchanges">
          <p>We offer a 7-day return and exchange policy on most items. Products must be unworn, unwashed, and in original packaging with all tags intact. See our <Link to="/returns" className="text-brand-primary hover:underline">Returns Policy</Link> for full details.</p>
        </Section>

        <Section title="6. Intellectual Property">
          <p>All content on this website — including images, text, logos, and design — is owned by Myeon Casuals and protected by copyright law. Unauthorised use is prohibited.</p>
        </Section>

        <Section title="7. Limitation of Liability">
          <p>Myeon Casuals shall not be liable for any indirect, incidental, or consequential damages arising from the use of our products or services. Our maximum liability is limited to the amount paid for the specific order in question.</p>
        </Section>

        <Section title="8. Governing Law">
          <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in India.</p>
        </Section>

        <Section title="9. Contact">
          <p>Questions about these terms? <Link to="/contact" className="text-brand-primary hover:underline">Contact us</Link> and we'll be happy to help.</p>
        </Section>
      </motion.div>
    </div>
  );
}
