import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-brand-primary text-white mt-16">
      <div className="page-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-heading text-3xl font-bold">Myeon Casuals <span className="text-brand-accent">Fashion</span></h3>
            <p className="text-sm text-gray-300 leading-relaxed">Style That Speaks. Premium Indian ethnic wear crafted for the modern woman.</p>
            <div className="flex gap-4">
              {['IG', 'FB', 'YT'].map((label, i) => (
                <a key={i} href="#" aria-label={label} className="w-9 h-9 bg-white/10 flex items-center justify-center hover:bg-brand-accent transition-colors text-xs font-bold">
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-medium uppercase tracking-wider mb-6 text-brand-accent">Quick Links</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              {[
                { to: '/categories/sarees', label: 'Sarees' },
                { to: '/categories/kurtas', label: 'Kurtas' },
                { to: '/categories/lehengas', label: 'Lehengas' },
                { to: '/new-arrivals', label: 'New Arrivals' },
                { to: '/sale', label: 'Sale' },
              ].map(item => (
                <li key={item.to}><Link to={item.to} className="hover:text-brand-accent transition-colors">{item.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-medium uppercase tracking-wider mb-6 text-brand-accent">Help</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              {[
                { to: '/account/orders', label: 'Track Order' },
                { to: '/returns', label: 'Returns & Exchanges' },
                { to: '/size-guide', label: 'Size Guide' },
                { to: '/faq', label: 'FAQ' },
                { to: '/contact', label: 'Contact Us' },
              ].map(item => (
                <li key={item.to}><Link to={item.to} className="hover:text-brand-accent transition-colors">{item.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-medium uppercase tracking-wider mb-6 text-brand-accent">Contact</h4>
            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex gap-3"><MapPin size={16} className="mt-0.5 shrink-0 text-brand-accent"/><span>Myeon Casuals, Chennai, Tamil Nadu 600001</span></li>
              <li className="flex gap-3"><Phone size={16} className="text-brand-accent shrink-0"/><a href="tel:+919876543210" className="hover:text-brand-accent">+91 98765 43210</a></li>
              <li className="flex gap-3"><Mail size={16} className="text-brand-accent shrink-0"/><a href="mailto:hello@Myeon Casualsfashion.com" className="hover:text-brand-accent">hello@Myeon Casualsfashion.com</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="page-container py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} Myeon Casuals. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
