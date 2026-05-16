import { motion } from 'framer-motion';

const Section = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="font-heading text-xl font-bold text-brand-primary mb-3">{title}</h2>
    <div className="text-sm text-gray-600 space-y-2 leading-relaxed">{children}</div>
  </div>
);

export default function PrivacyPage() {
  return (
    <div className="page-container py-12 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-10">
          <h1 className="font-heading text-4xl font-bold text-brand-primary mb-2">Privacy Policy</h1>
          <p className="text-xs text-gray-400">Last updated: January 2025</p>
        </div>

        <Section title="1. Information We Collect">
          <p>We collect information you provide directly: name, email address, phone number, delivery address, and payment information when you place an order.</p>
          <p>We also automatically collect device information, IP address, browser type, and browsing behaviour on our website through cookies and similar technologies.</p>
        </Section>

        <Section title="2. How We Use Your Information">
          <p>We use your personal information to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Process and fulfil your orders</li>
            <li>Send order confirmations, shipping updates, and invoices</li>
            <li>Respond to customer service enquiries</li>
            <li>Send promotional communications (only with your consent)</li>
            <li>Improve our website and product offerings</li>
            <li>Comply with legal obligations</li>
          </ul>
        </Section>

        <Section title="3. Sharing Your Information">
          <p>We do not sell or rent your personal data to third parties. We share data only with:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Payment processors</strong> (Razorpay) to complete transactions</li>
            <li><strong>Courier partners</strong> to deliver your orders</li>
            <li><strong>Service providers</strong> who help us operate the platform</li>
            <li><strong>Legal authorities</strong> when required by law</li>
          </ul>
        </Section>

        <Section title="4. Cookies">
          <p>We use cookies to keep you signed in, remember your cart, and understand how visitors use our site. You can disable cookies in your browser settings, but some features may not work correctly.</p>
        </Section>

        <Section title="5. Data Security">
          <p>We use industry-standard SSL encryption for all data transmission. Payment information is processed by Razorpay and is never stored on our servers.</p>
        </Section>

        <Section title="6. Your Rights">
          <p>You have the right to access, correct, or delete your personal data at any time. Log in to your account or contact us to make a request.</p>
        </Section>

        <Section title="7. Retention">
          <p>We retain your data for as long as your account is active or as needed to fulfil orders and comply with legal obligations (typically 5 years for transaction records under GST law).</p>
        </Section>

        <Section title="8. Contact">
          <p>For privacy-related queries, please use the <a href="/contact" className="text-brand-primary hover:underline">Contact Us</a> page. We respond within 72 hours.</p>
        </Section>
      </motion.div>
    </div>
  );
}
