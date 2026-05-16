import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { LayoutTemplate, Megaphone, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const DEFAULTS = {
  announcement_bar_enabled: false,
  announcement_bar_text: '',
  announcement_bar_color: 'bg-brand-primary',
  announcement_bar_link: '',
  announcement_bar_link_text: '',
  header_sticky: true,
  header_show_search: true,
};

const COLOR_OPTIONS = [
  { value: 'bg-brand-primary', label: 'Brand (Default)', cls: 'bg-indigo-700' },
  { value: 'bg-black',         label: 'Black',            cls: 'bg-black' },
  { value: 'bg-red-600',       label: 'Red',              cls: 'bg-red-600' },
  { value: 'bg-green-700',     label: 'Green',            cls: 'bg-green-700' },
  { value: 'bg-blue-700',      label: 'Blue',             cls: 'bg-blue-700' },
  { value: 'bg-yellow-500',    label: 'Yellow',           cls: 'bg-yellow-500' },
  { value: 'bg-pink-600',      label: 'Pink',             cls: 'bg-pink-600' },
];

export default function HeaderManager() {
  const qc = useQueryClient();
  const [form, setForm] = useState(DEFAULTS);
  const [saved, setSaved] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const { data, isLoading } = useQuery({ queryKey: ['header-settings'], queryFn: adminApi.getHeaderSettings });

  useEffect(() => {
    if (data?.data?.data) {
      const remote = data.data.data;
      setForm({
        announcement_bar_enabled:   remote.announcement_bar_enabled   ?? DEFAULTS.announcement_bar_enabled,
        announcement_bar_text:      remote.announcement_bar_text      ?? DEFAULTS.announcement_bar_text,
        announcement_bar_color:     remote.announcement_bar_color     ?? DEFAULTS.announcement_bar_color,
        announcement_bar_link:      remote.announcement_bar_link      ?? DEFAULTS.announcement_bar_link,
        announcement_bar_link_text: remote.announcement_bar_link_text ?? DEFAULTS.announcement_bar_link_text,
        header_sticky:              remote.header_sticky              ?? DEFAULTS.header_sticky,
        header_show_search:         remote.header_show_search         ?? DEFAULTS.header_show_search,
      });
    }
  }, [data]);

  const save = useMutation({
    mutationFn: adminApi.updateHeaderSettings,
    onSuccess: () => {
      qc.invalidateQueries(['header-settings']);
      toast.success('Header settings saved');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  if (isLoading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><LayoutTemplate size={20} /> Header Manager</h1>
        <p className="text-sm text-gray-500 mt-0.5">Configure announcement bar and header behaviour</p>
      </div>

      {/* Announcement Bar */}
      <div className="bg-white border rounded-xl shadow-sm p-5 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Megaphone size={18} className="text-orange-500" />
          <h2 className="font-semibold text-gray-900">Announcement Bar</h2>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <div onClick={() => set('announcement_bar_enabled', !form.announcement_bar_enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.announcement_bar_enabled ? 'bg-brand-primary' : 'bg-gray-200'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.announcement_bar_enabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </div>
          <span className="text-sm font-medium text-gray-700">Enable Announcement Bar</span>
        </label>

        <div className={`space-y-3 ${!form.announcement_bar_enabled ? 'opacity-50 pointer-events-none' : ''}`}>
          {/* Preview */}
          {form.announcement_bar_text && (
            <div className={`${form.announcement_bar_color} text-white text-center text-xs py-2 px-4 rounded-lg`}>
              {form.announcement_bar_text}
              {form.announcement_bar_link_text && (
                <span className="ml-2 underline">{form.announcement_bar_link_text}</span>
              )}
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-gray-600">Announcement Text *</label>
            <input className="mt-1 w-full border rounded px-3 py-2 text-sm"
              value={form.announcement_bar_text || ''}
              onChange={e => set('announcement_bar_text', e.target.value)}
              placeholder="Free shipping on orders above ₹999! 🎉" />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 block mb-2">Bar Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_OPTIONS.map(c => (
                <button key={c.value} onClick={() => set('announcement_bar_color', c.value)}
                  title={c.label}
                  className={`w-8 h-8 rounded-full ${c.cls} border-2 transition-all ${
                    form.announcement_bar_color === c.value ? 'border-gray-900 scale-110' : 'border-transparent'
                  }`} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600">Link URL (optional)</label>
              <input className="mt-1 w-full border rounded px-3 py-2 text-sm"
                value={form.announcement_bar_link || ''}
                onChange={e => set('announcement_bar_link', e.target.value)}
                placeholder="/sale or https://..." />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600">Link Text (optional)</label>
              <input className="mt-1 w-full border rounded px-3 py-2 text-sm"
                value={form.announcement_bar_link_text || ''}
                onChange={e => set('announcement_bar_link_text', e.target.value)}
                placeholder="Shop Now →" />
            </div>
          </div>
        </div>
      </div>

      {/* Header Behaviour */}
      <div className="bg-white border rounded-xl shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Header Behaviour</h2>

        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <p className="text-sm font-medium text-gray-700">Sticky Header</p>
            <p className="text-xs text-gray-400">Header stays visible when scrolling down</p>
          </div>
          <div onClick={() => set('header_sticky', !form.header_sticky)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.header_sticky ? 'bg-brand-primary' : 'bg-gray-200'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.header_sticky ? 'translate-x-6' : 'translate-x-1'}`} />
          </div>
        </label>

        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <p className="text-sm font-medium text-gray-700">Show Search Bar</p>
            <p className="text-xs text-gray-400">Display search box in the header</p>
          </div>
          <div onClick={() => set('header_show_search', !form.header_show_search)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.header_show_search ? 'bg-brand-primary' : 'bg-gray-200'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${form.header_show_search ? 'translate-x-6' : 'translate-x-1'}`} />
          </div>
        </label>
      </div>

      <button onClick={() => save.mutate(form)} disabled={save.isLoading}
        className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-60">
        <Save size={16} />
        {save.isLoading ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
      </button>
    </div>
  );
}
