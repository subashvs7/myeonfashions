import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { configApi, footerApi } from '../../api/config';

const DEFAULT_SECTIONS = [
  {
    id: '__quick',
    title: 'Quick Links',
    links: [
      { id: 1, label: 'Sarees',       url: '/categories/sarees',   is_active: true },
      { id: 2, label: 'Kurtas',       url: '/categories/kurtas',   is_active: true },
      { id: 3, label: 'Lehengas',     url: '/categories/lehengas', is_active: true },
      { id: 4, label: 'New Arrivals', url: '/new-arrivals',        is_active: true },
      { id: 5, label: 'Sale',         url: '/sale',                is_active: true },
    ],
  },
  {
    id: '__help',
    title: 'Help',
    links: [
      { id: 6,  label: 'Track Order',          url: '/account/orders', is_active: true },
      { id: 7,  label: 'Returns & Exchanges',  url: '/returns',        is_active: true },
      { id: 8,  label: 'Size Guide',           url: '/size-guide',     is_active: true },
      { id: 9,  label: 'FAQ',                  url: '/faq',            is_active: true },
      { id: 10, label: 'Contact Us',           url: '/contact',        is_active: true },
    ],
  },
];

export default function Footer() {
  const { data: cfg = {} } = useQuery({
    queryKey: ['public-config'],
    queryFn: () => configApi.get().then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

  const { data: rawSections = [] } = useQuery({
    queryKey: ['footer-sections-public'],
    queryFn: () => footerApi.getSections().then(r => r.data.data ?? []),
    staleTime: 5 * 60 * 1000,
  });

  const storeName = cfg['app.name'] || 'Myeon Casuals';
  const tagline   = cfg['app.tagline'] || 'Style That Speaks. Premium Indian ethnic wear crafted for the modern woman.';
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

  // Use admin-managed sections if any exist, otherwise fall back to defaults
  const activeSections = rawSections.filter(s => s.is_active);
  const sections = activeSections.length > 0 ? activeSections : DEFAULT_SECTIONS;

  return (
    <footer className="bg-brand-primary text-white mt-16">
      <div className="page-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-heading text-3xl font-bold">
              {storeName} <span className="text-brand-accent">Fashion</span>
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed">{tagline}</p>
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

          {/* Dynamic sections (max 2 shown in middle columns) */}
          {sections.slice(0, 2).map(section => (
            <div key={section.id}>
              <h4 className="font-medium uppercase tracking-wider mb-6 text-brand-accent">{section.title}</h4>
              <ul className="space-y-3 text-sm text-gray-300">
                {section.links.filter(l => l.is_active !== false).map(link => (
                  <li key={link.id}>
                    {link.open_in_new_tab ? (
                      <a href={link.url} target="_blank" rel="noreferrer"
                        className="hover:text-brand-accent transition-colors">{link.label}</a>
                    ) : (
                      <Link to={link.url} className="hover:text-brand-accent transition-colors">{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

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
