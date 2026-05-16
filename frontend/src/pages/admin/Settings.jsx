import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import Button from '../../components/ui/Button';
import {
  Settings2, CreditCard, Mail, Store, Upload, Eye, EyeOff,
  CheckCircle, AlertTriangle, Globe, Palette,
} from 'lucide-react';
import toast from 'react-hot-toast';

const STORAGE_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';

const TABS = [
  { id: 'general',  label: 'General',  icon: Settings2 },
  { id: 'payment',  label: 'Payment',  icon: CreditCard },
  { id: 'email',    label: 'Email',    icon: Mail },
  { id: 'store',    label: 'Store Info', icon: Store },
];

// ── Small shared components ──────────────────────────────────────────────────

function FieldRow({ label, hint, children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 py-4 border-b last:border-b-0">
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
      </div>
      <div className="md:col-span-2">{children}</div>
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text', disabled }) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full border px-3 py-2 text-sm focus:outline-none focus:border-brand-primary disabled:bg-gray-50 disabled:text-gray-400"
    />
  );
}

function Toggle({ checked, onChange, disabled, label, sublabel }) {
  return (
    <label className={`flex items-start gap-3 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <div className="relative mt-0.5">
        <input
          type="checkbox"
          className="sr-only"
          checked={!!checked}
          onChange={e => !disabled && onChange(e.target.checked)}
          disabled={disabled}
        />
        <div className={`w-10 h-6 rounded-full transition-colors ${checked ? 'bg-brand-primary' : 'bg-gray-200'}`} />
        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {sublabel && <p className="text-xs text-gray-400">{sublabel}</p>}
      </div>
    </label>
  );
}

function PasswordInput({ value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border px-3 py-2 pr-9 text-sm focus:outline-none focus:border-brand-primary"
      />
      <button type="button" onClick={() => setShow(s => !s)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
}

function SelectInput({ value, onChange, options }) {
  return (
    <select
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      className="w-full border px-3 py-2 text-sm focus:outline-none focus:border-brand-primary bg-white"
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// ── Tab panels ───────────────────────────────────────────────────────────────

function GeneralTab({ form, setField, logoMutation, faviconMutation }) {
  const logoRef    = useRef();
  const faviconRef = useRef();

  const logoUrl = form['app.logo']
    ? `${STORAGE_BASE}/storage/${form['app.logo']}`
    : null;

  return (
    <div>
      <FieldRow label="App Name" hint="Displayed throughout the admin panel and emails">
        <TextInput value={form['app.name']} onChange={v => setField('app.name', v)} placeholder="Myeon Casuals" />
      </FieldRow>

      <FieldRow label="Tagline" hint="Short brand tagline shown on homepage">
        <TextInput value={form['app.tagline']} onChange={v => setField('app.tagline', v)} placeholder="Style That Speaks" />
      </FieldRow>

      <FieldRow label="Logo" hint="PNG or SVG, max 2 MB. Recommended: 200×60 px">
        <div className="flex items-center gap-4">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-12 border object-contain bg-gray-50 px-2" />
          ) : (
            <div className="h-12 w-32 border bg-gray-50 flex items-center justify-center text-gray-300 text-xs">No logo</div>
          )}
          <div>
            <input ref={logoRef} type="file" accept="image/*" className="hidden"
              onChange={e => e.target.files[0] && logoMutation.mutate(e.target.files[0])} />
            <button onClick={() => logoRef.current.click()}
              disabled={logoMutation.isPending}
              className="flex items-center gap-1.5 text-xs border px-3 py-1.5 hover:bg-gray-50 transition-colors disabled:opacity-50">
              <Upload size={12} />
              {logoMutation.isPending ? 'Uploading…' : 'Upload Logo'}
            </button>
          </div>
        </div>
      </FieldRow>

      <FieldRow label="Favicon" hint="PNG or ICO, max 512 KB. 32×32 px recommended">
        <div className="flex items-center gap-4">
          {form['app.favicon'] ? (
            <img src={`${STORAGE_BASE}/storage/${form['app.favicon']}`} alt="Favicon" className="h-8 w-8 border object-contain" />
          ) : (
            <div className="h-8 w-8 border bg-gray-50 flex items-center justify-center text-gray-300 text-xs">—</div>
          )}
          <div>
            <input ref={faviconRef} type="file" accept=".png,.ico,.svg" className="hidden"
              onChange={e => e.target.files[0] && faviconMutation.mutate(e.target.files[0])} />
            <button onClick={() => faviconRef.current.click()}
              disabled={faviconMutation.isPending}
              className="flex items-center gap-1.5 text-xs border px-3 py-1.5 hover:bg-gray-50 transition-colors disabled:opacity-50">
              <Upload size={12} />
              {faviconMutation.isPending ? 'Uploading…' : 'Upload Favicon'}
            </button>
          </div>
        </div>
      </FieldRow>

      <FieldRow label="Currency" hint="3-letter ISO code (e.g. INR, USD)">
        <div className="flex gap-3">
          <TextInput value={form['app.currency']} onChange={v => setField('app.currency', v)} placeholder="INR" />
          <TextInput value={form['app.currency_symbol']} onChange={v => setField('app.currency_symbol', v)} placeholder="₹" />
        </div>
        <p className="text-xs text-gray-400 mt-1">Currency code &amp; symbol</p>
      </FieldRow>

      <FieldRow label="Maintenance Mode" hint="Puts the storefront in maintenance mode for visitors">
        <Toggle
          checked={form['app.maintenance_mode'] === '1'}
          onChange={v => setField('app.maintenance_mode', v ? '1' : '0')}
          label="Enable maintenance mode"
          sublabel="Admin can still access the site"
        />
        {form['app.maintenance_mode'] === '1' && (
          <div className="mt-2 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2">
            <AlertTriangle size={12} /> Storefront is currently in maintenance mode
          </div>
        )}
      </FieldRow>
    </div>
  );
}

function PaymentTab({ form, setField }) {
  return (
    <div>
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-xs text-blue-700 flex items-start gap-2">
        <Globe size={13} className="mt-0.5 shrink-0" />
        <span>Online payment (Razorpay) is active. Cash on Delivery can be enabled when ready.</span>
      </div>

      <FieldRow label="Online Payment" hint="Razorpay — customers pay at checkout">
        <Toggle
          checked={form['payment.online_enabled'] === '1'}
          onChange={v => setField('payment.online_enabled', v ? '1' : '0')}
          label="Enable online payment"
          sublabel="Razorpay payment gateway"
        />
      </FieldRow>

      <FieldRow label="Cash on Delivery" hint="Enable once logistics is ready">
        <Toggle
          checked={form['payment.cod_enabled'] === '1'}
          onChange={v => setField('payment.cod_enabled', v ? '1' : '0')}
          label="Enable Cash on Delivery"
          sublabel="Customers pay when the order is delivered"
        />
        {form['payment.cod_enabled'] !== '1' && (
          <p className="text-xs text-gray-400 mt-1.5">COD is currently disabled. Toggle to enable when ready.</p>
        )}
      </FieldRow>

      <FieldRow label="Minimum Order Amount" hint="Minimum cart value to place an order (0 = no minimum)">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm">{form['app.currency_symbol'] || '₹'}</span>
          <TextInput value={form['payment.min_order_amount']} onChange={v => setField('payment.min_order_amount', v)} placeholder="0" type="number" />
        </div>
      </FieldRow>

      <div className="mt-6 mb-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Razorpay Credentials</p>
      </div>

      <FieldRow label="Key ID" hint="Your Razorpay API key ID (public)">
        <TextInput
          value={form['payment.razorpay_key_id']}
          onChange={v => setField('payment.razorpay_key_id', v)}
          placeholder="rzp_live_..."
        />
      </FieldRow>

      <FieldRow label="Key Secret" hint="Your Razorpay secret key — never share this">
        <PasswordInput
          value={form['payment.razorpay_key_secret']}
          onChange={v => setField('payment.razorpay_key_secret', v)}
          placeholder="Enter to update secret"
        />
        <p className="text-xs text-gray-400 mt-1">Leave as-is to keep the existing secret unchanged.</p>
      </FieldRow>

      <div className="mt-4 p-3 bg-gray-50 border text-xs text-gray-500 space-y-1">
        <p className="font-medium text-gray-600">How to get your Razorpay keys:</p>
        <p>1. Log in to your Razorpay Dashboard</p>
        <p>2. Go to Settings → API Keys</p>
        <p>3. Generate a new key pair (Test / Live)</p>
        <p>4. Copy the Key ID and Key Secret above</p>
      </div>
    </div>
  );
}

function EmailTab({ form, setField }) {
  const mailerOptions = [
    { value: 'smtp',     label: 'SMTP' },
    { value: 'sendmail', label: 'Sendmail' },
    { value: 'log',      label: 'Log (development only)' },
    { value: 'mailgun',  label: 'Mailgun' },
  ];

  const encryptionOptions = [
    { value: 'tls',  label: 'TLS (recommended)' },
    { value: 'ssl',  label: 'SSL' },
    { value: '',     label: 'None' },
  ];

  const isSMTP = !form['email.mailer'] || form['email.mailer'] === 'smtp';

  return (
    <div>
      <FieldRow label="Mail Driver" hint="How outgoing emails are sent">
        <SelectInput value={form['email.mailer']} onChange={v => setField('email.mailer', v)} options={mailerOptions} />
        {form['email.mailer'] === 'log' && (
          <p className="text-xs text-amber-600 mt-1">Log driver only writes emails to laravel.log. Use SMTP for production.</p>
        )}
      </FieldRow>

      <FieldRow label="From Name" hint="Name shown in recipient's inbox">
        <TextInput value={form['email.from_name']} onChange={v => setField('email.from_name', v)} placeholder="Myeon Casuals" />
      </FieldRow>

      <FieldRow label="From Address" hint="The sender email address">
        <TextInput value={form['email.from_address']} onChange={v => setField('email.from_address', v)} placeholder="no-reply@Myeon Casuals.com" type="email" />
      </FieldRow>

      {isSMTP && (
        <>
          <div className="mt-6 mb-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">SMTP Server</p>
          </div>

          <FieldRow label="Host" hint="SMTP server hostname">
            <TextInput value={form['email.host']} onChange={v => setField('email.host', v)} placeholder="smtp.gmail.com" />
          </FieldRow>

          <FieldRow label="Port" hint="Usually 587 (TLS) or 465 (SSL)">
            <TextInput value={form['email.port']} onChange={v => setField('email.port', v)} placeholder="587" type="number" />
          </FieldRow>

          <FieldRow label="Encryption">
            <SelectInput value={form['email.encryption']} onChange={v => setField('email.encryption', v)} options={encryptionOptions} />
          </FieldRow>

          <FieldRow label="Username" hint="SMTP login (usually your email address)">
            <TextInput value={form['email.username']} onChange={v => setField('email.username', v)} placeholder="you@gmail.com" />
          </FieldRow>

          <FieldRow label="Password" hint="SMTP password or App Password">
            <PasswordInput
              value={form['email.password']}
              onChange={v => setField('email.password', v)}
              placeholder="Enter to update password"
            />
            <p className="text-xs text-gray-400 mt-1">Leave as-is to keep the existing password unchanged.</p>
          </FieldRow>
        </>
      )}

      <div className="mt-4 p-3 bg-gray-50 border text-xs text-gray-500 space-y-1">
        <p className="font-medium text-gray-600">Gmail App Password setup:</p>
        <p>1. Enable 2-Step Verification on your Google account</p>
        <p>2. Go to Google Account → Security → App Passwords</p>
        <p>3. Generate a password for "Mail" and paste it above</p>
        <p>4. Use smtp.gmail.com / port 587 / TLS</p>
      </div>
    </div>
  );
}

function StoreTab({ form, setField }) {
  return (
    <div>
      <FieldRow label="Store Email" hint="Public contact email shown to customers">
        <TextInput value={form['store.email']} onChange={v => setField('store.email', v)} placeholder="hello@Myeon Casuals.com" type="email" />
      </FieldRow>

      <FieldRow label="Phone" hint="Customer support phone number">
        <TextInput value={form['store.phone']} onChange={v => setField('store.phone', v)} placeholder="+91 98765 43210" />
      </FieldRow>

      <FieldRow label="WhatsApp" hint="WhatsApp number for customer support (with country code)">
        <TextInput value={form['store.whatsapp']} onChange={v => setField('store.whatsapp', v)} placeholder="+91 98765 43210" />
      </FieldRow>

      <FieldRow label="Address" hint="Physical store or registered address">
        <textarea
          value={form['store.address'] ?? ''}
          onChange={e => setField('store.address', e.target.value)}
          placeholder="123, MG Road, Bangalore, Karnataka — 560001"
          rows={3}
          className="w-full border px-3 py-2 text-sm focus:outline-none focus:border-brand-primary resize-none"
        />
      </FieldRow>

      <div className="mt-6 mb-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Social Media</p>
      </div>

      <FieldRow label="Facebook" hint="Full URL of your Facebook page">
        <TextInput value={form['store.facebook']} onChange={v => setField('store.facebook', v)} placeholder="https://facebook.com/Myeon Casuals" />
      </FieldRow>

      <FieldRow label="Instagram" hint="Full URL of your Instagram profile">
        <TextInput value={form['store.instagram']} onChange={v => setField('store.instagram', v)} placeholder="https://instagram.com/Myeon Casuals" />
      </FieldRow>

      <FieldRow label="Twitter / X" hint="Full URL of your Twitter/X profile">
        <TextInput value={form['store.twitter']} onChange={v => setField('store.twitter', v)} placeholder="https://twitter.com/Myeon Casuals" />
      </FieldRow>
    </div>
  );
}

// ── Main Settings Page ───────────────────────────────────────────────────────

export default function AdminSettings() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const [form, setForm] = useState({});
  const [dirty, setDirty] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => adminApi.getSettings().then(r => r.data.data),
  });

  useEffect(() => {
    if (settings) { setForm(settings); setDirty(false); }
  }, [settings]);

  const setField = (key, value) => {
    setForm(f => ({ ...f, [key]: value }));
    setDirty(true);
  };

  const saveMutation = useMutation({
    mutationFn: () => adminApi.updateSettings(form),
    onSuccess: () => {
      qc.invalidateQueries(['admin-settings']);
      qc.invalidateQueries(['public-config']);
      toast.success('Settings saved successfully');
      setDirty(false);
    },
    onError: () => toast.error('Failed to save settings'),
  });

  const logoMutation = useMutation({
    mutationFn: (file) => adminApi.uploadLogo(file),
    onSuccess: (res) => {
      setField('app.logo', res.data.data.path);
      toast.success('Logo uploaded');
    },
    onError: () => toast.error('Logo upload failed'),
  });

  const faviconMutation = useMutation({
    mutationFn: (file) => adminApi.uploadFavicon(file),
    onSuccess: (res) => {
      setField('app.favicon', res.data.data.path);
      toast.success('Favicon uploaded');
    },
    onError: () => toast.error('Favicon upload failed'),
  });

  if (isLoading) return <div className="p-12 text-center text-gray-400">Loading settings…</div>;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-brand-primary">Settings</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your store configuration</p>
        </div>
        <div className="flex items-center gap-3">
          {dirty && <span className="text-xs text-amber-600 flex items-center gap-1"><AlertTriangle size={12} /> Unsaved changes</span>}
          <Button
            onClick={() => saveMutation.mutate()}
            loading={saveMutation.isPending}
            disabled={!dirty}
          >
            {saveMutation.isPending ? 'Saving…' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {saveMutation.isSuccess && !dirty && (
        <div className="mb-4 flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 px-4 py-2">
          <CheckCircle size={14} /> Settings saved successfully
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <div className="w-44 flex-shrink-0">
          <nav className="bg-white border space-y-0.5 p-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm rounded transition-colors text-left ${
                  activeTab === id
                    ? 'bg-brand-primary text-white font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={15} className="shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        <div className="flex-1 bg-white border p-6 min-h-[500px]">
          {activeTab === 'general' && (
            <GeneralTab form={form} setField={setField} logoMutation={logoMutation} faviconMutation={faviconMutation} />
          )}
          {activeTab === 'payment' && (
            <PaymentTab form={form} setField={setField} />
          )}
          {activeTab === 'email' && (
            <EmailTab form={form} setField={setField} />
          )}
          {activeTab === 'store' && (
            <StoreTab form={form} setField={setField} />
          )}
        </div>
      </div>
    </div>
  );
}
