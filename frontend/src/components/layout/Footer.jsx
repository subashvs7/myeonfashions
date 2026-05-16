import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { configApi } from '../../api/config';

export default function Footer() {
  const { data } = useQuery({
    queryKey: ['public-config'],
    queryFn: configApi.get,
    staleTime: 5 * 60 * 1000,
  });

  const cfg = data?.data?.data ?? {};

  const storeName = cfg['app.name'] || 'Myeon Casuals';
  const address   = cfg['store.address'] || null;
  const phone     = cfg['store.phone'] || null;
  const email     = cfg['store.email'] || null;
  const facebook  = cfg['store.facebook'] || null;
  const instagram = cfg['store.instagram'] || null;
  const twitter   = cfg['store.twitter'] || null;

  const socials = [
    { label: 'IG', href: instagram },
    { label: 'FB', href: facebook },
    { label: 'TW', href: twitter },
  ].filter(s => s.href);

  return (
    <footer className="bg-brand-primary text-white mt-16">
      <div className="page-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-heading text-3xl font-bold">
              {storeName} <span className="text-brand-accent">Fashion</span>
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Style That Speaks. Premium Indian ethnic wear crafted for the modern woman.
            </p>
            {socials.length > 0 && (
              <div className="flex gap-4">
                {socials.map(s => (
                  <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
                    aria-label={s.label}
                    className="w-9 h-9 bg-white/10 flex items-center justify-center hover:bg-brand-accent transition-colors text-xs font-bold">
                    {s.label}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-medium uppercase tracking-wider mb-6 text-brand-accent">Quick Links</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              {[
                { to: '/categories/sarees',   label: 'Sarees' },
                { to: '/categories/kurtas',   label: 'Kurtas' },
                { to: '/categories/lehengas', label: 'Lehengas' },
                { to: '/new-arrivals',        label: 'New Arrivals' },
                { to: '/sale',                label: 'Sale' },
              ].map(item => (
                <li key={item.to}>
                  <Link to={item.to} className="hover:text-brand-accent transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-medium uppercase tracking-wider mb-6 text-brand-accent">Help</h4>
            <ul className="space-y-3 text-sm text-gray-300">
              {[
                { to: '/account/orders', label: 'Track Order' },
                { to: '/returns',        label: 'Returns & Exchanges' },
                { to: '/size-guide',     label: 'Size Guide' },
                { to: '/faq',            label: 'FAQ' },
                { to: '/contact',        label: 'Contact Us' },
              ].map(item => (
                <li key={item.to}>
                  <Link to={item.to} className="hover:text-brand-accent transition-colors">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-medium uppercase tracking-wider mb-6 text-brand-accent">Contact</h4>
            <ul className="space-y-4 text-sm text-gray-300">
              {address && (
                <li className="flex gap-3">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-brand-accent" />
                  <span>{address}</span>
                </li>
              )}
              {phone && (
                <li className="flex gap-3">
                  <Phone size={16} className="text-brand-accent shrink-0" />
                  <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-brand-accent">{phone}</a>
                </li>
              )}
              {email && (
                <li className="flex gap-3">
                  <Mail size={16} className="text-brand-accent shrink-0" />
                  <a href={`mailto:${email}`} className="hover:text-brand-accent">{email}</a>
                </li>
              )}
              {!address && !phone && !email && (
                <li className="text-gray-500 text-xs">Contact details not configured yet.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="page-container py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
          <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
