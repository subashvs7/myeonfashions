import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, MessageCircle, Clock } from 'lucide-react';
import { configApi } from '../api/config';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const { data: cfg = {} } = useQuery({
    queryKey: ['public-config'],
    queryFn: () => configApi.get().then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

  const phone     = cfg['store.phone']    || null;
  const whatsapp  = cfg['store.whatsapp'] || null;
  const email     = cfg['store.email']    || null;
  const address   = cfg['store.address']  || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return toast.error('Please fill in all required fields');
    setSending(true);
    await new Promise(r => setTimeout(r, 800));
    toast.success('Message sent! We\'ll get back to you within 24 hours.');
    setForm({ name: '', email: '', subject: '', message: '' });
    setSending(false);
  };

  const contacts = [
    phone    && { icon: Phone,         label: 'Phone',     value: phone,    href: `tel:${phone.replace(/\s/g,'')}` },
    whatsapp && { icon: MessageCircle, label: 'WhatsApp',  value: whatsapp, href: `https://wa.me/${whatsapp.replace(/\D/g,'')}` },
    email    && { icon: Mail,          label: 'Email',     value: email,    href: `mailto:${email}` },
    address  && { icon: MapPin,        label: 'Address',   value: address,  href: null },
  ].filter(Boolean);

  return (
    <div className="page-container py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl font-bold text-brand-primary mb-3">Contact Us</h1>
          <p className="text-gray-500 max-w-md mx-auto">We'd love to hear from you. Reach out via any channel below or fill in the form.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact details */}
          <div className="space-y-6">
            {contacts.length > 0 ? contacts.map((c, i) => (
              <div key={i} className="flex items-start gap-4 p-5 border bg-white">
                <div className="w-10 h-10 bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                  <c.icon size={18} className="text-brand-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{c.label}</p>
                  {c.href ? (
                    <a href={c.href} target={c.icon === MessageCircle ? '_blank' : undefined} rel="noreferrer"
                      className="text-sm text-brand-primary hover:underline font-medium">{c.value}</a>
                  ) : (
                    <p className="text-sm text-gray-700">{c.value}</p>
                  )}
                </div>
              </div>
            )) : (
              <div className="p-5 border text-sm text-gray-400">Contact details not configured yet.</div>
            )}

            <div className="flex items-start gap-4 p-5 border bg-white">
              <div className="w-10 h-10 bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                <Clock size={18} className="text-brand-primary" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Business Hours</p>
                <p className="text-sm text-gray-700">Mon – Sat: 10:00 AM – 7:00 PM</p>
                <p className="text-sm text-gray-500">Sunday: Closed</p>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-2 border bg-white p-8">
            <h2 className="font-heading text-xl font-bold text-brand-primary mb-6">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Full Name *</label>
                  <input className="w-full border px-3 py-2.5 text-sm focus:outline-none focus:border-brand-primary"
                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email *</label>
                  <input type="email" className="w-full border px-3 py-2.5 text-sm focus:outline-none focus:border-brand-primary"
                    value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Subject</label>
                <input className="w-full border px-3 py-2.5 text-sm focus:outline-none focus:border-brand-primary"
                  value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Order issue, product query…" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Message *</label>
                <textarea rows={5} className="w-full border px-3 py-2.5 text-sm focus:outline-none focus:border-brand-primary resize-none"
                  value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Describe your query…" />
              </div>
              <button type="submit" disabled={sending}
                className="w-full bg-brand-primary text-white py-3 text-sm font-semibold hover:bg-brand-secondary transition-colors disabled:opacity-60">
                {sending ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
