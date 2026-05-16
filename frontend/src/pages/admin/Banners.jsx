import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const POSITIONS = ['hero', 'category', 'popup', 'strip'];
const EMPTY = {
  title: '', subtitle: '', link: '', button_text: 'Shop Now',
  position: 'hero', sort_order: 0, is_active: true, starts_at: '', expires_at: '',
};

export default function AdminBanners() {
  const qc = useQueryClient();
  const [editing, setEditing]     = useState(null);
  const [adding, setAdding]       = useState(false);
  const [form, setForm]           = useState(EMPTY);
  const [imageFile, setImageFile] = useState(null);

  const { data: banners = [] } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: () => adminApi.getBanners().then(r => r.data.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        if (v === undefined || v === null || v === '') return;
        fd.append(k, typeof v === 'boolean' ? (v ? '1' : '0') : v);
      });
      if (imageFile) fd.append('image', imageFile);
      if (editing) { fd.append('_method', 'PUT'); return adminApi.updateBanner(editing.id, fd); }
      return adminApi.createBanner(fd);
    },
    onSuccess: () => {
      qc.invalidateQueries(['admin-banners']);
      toast.success('Banner saved');
      setEditing(null); setAdding(false); setForm(EMPTY); setImageFile(null);
    },
    onError: () => toast.error('Failed to save banner'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteBanner(id),
    onSuccess: () => { qc.invalidateQueries(['admin-banners']); toast.success('Banner deleted'); },
  });

  const startEdit = (b) => {
    setEditing(b);
    setForm({
      title:       b.title       || '',
      subtitle:    b.subtitle    || '',
      link:        b.link        || '',
      button_text: b.button_text || 'Shop Now',
      position:    b.position,
      sort_order:  b.sort_order  || 0,
      is_active:   b.is_active,
      starts_at:   b.starts_at?.slice(0, 10) || '',
      expires_at:  b.expires_at?.slice(0, 10) || '',
    });
    setImageFile(null);
    setAdding(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const grouped = POSITIONS.reduce((acc, pos) => {
    acc[pos] = banners.filter(b => b.position === pos);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-brand-primary">Banners</h1>
        {!adding && !editing && (
          <Button onClick={() => { setAdding(true); setForm(EMPTY); }} className="flex items-center gap-2">
            <Plus size={16} /> Add Banner
          </Button>
        )}
      </div>

      {(adding || editing) && (
        <div className="bg-white border p-5 mb-6">
          <h3 className="font-medium mb-4">{editing ? 'Edit Banner' : 'New Banner'}</h3>

          {/* Current image preview when editing */}
          {editing?.image_url && !imageFile && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1">Current Image</p>
              <img
                src={editing.image_url}
                alt="current"
                className="h-28 object-cover border"
              />
            </div>
          )}
          {imageFile && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1">New Image Preview</p>
              <img
                src={URL.createObjectURL(imageFile)}
                alt="preview"
                className="h-28 object-cover border"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 max-w-2xl">
            <Input label="Title *" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            <Input label="Subtitle" value={form.subtitle}
              onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} />
            <Input label="Link URL" value={form.link} placeholder="/categories/sarees"
              onChange={e => setForm(f => ({ ...f, link: e.target.value }))} />
            <Input label="Button Text" value={form.button_text} placeholder="Shop Now"
              onChange={e => setForm(f => ({ ...f, button_text: e.target.value }))} />
            <div>
              <label className="block text-sm font-medium mb-1">Position</label>
              <select value={form.position}
                onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                className="w-full border px-3 py-2 text-sm focus:outline-none focus:border-brand-primary">
                {POSITIONS.map(p => (
                  <option key={p} value={p} className="capitalize">{p}</option>
                ))}
              </select>
            </div>
            <Input label="Sort Order" type="number" value={form.sort_order}
              onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} />
            <div>
              <label className="block text-sm font-medium mb-1">
                Image {editing ? '(leave blank to keep current)' : ''}
              </label>
              <input type="file" accept="image/*"
                onChange={e => setImageFile(e.target.files?.[0] || null)}
                className="text-sm text-gray-500" />
            </div>
            <div />
            <Input label="Starts At" type="date" value={form.starts_at}
              onChange={e => setForm(f => ({ ...f, starts_at: e.target.value }))} />
            <Input label="Expires At" type="date" value={form.expires_at}
              onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} />
            <label className="flex items-center gap-2 text-sm cursor-pointer col-span-2">
              <input type="checkbox" checked={form.is_active}
                onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                className="accent-brand-primary" />
              Active (visible to customers)
            </label>
          </div>

          <div className="flex gap-3 mt-4">
            <Button onClick={() => saveMutation.mutate(form)} loading={saveMutation.isPending}>
              Save Banner
            </Button>
            <Button variant="outline" onClick={() => { setEditing(null); setAdding(false); setImageFile(null); }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Banners grouped by position */}
      {POSITIONS.map(pos => (
        grouped[pos]?.length > 0 && (
          <div key={pos} className="mb-8">
            <h3 className="font-semibold capitalize mb-3 text-gray-700 border-b pb-2">
              {pos} <span className="text-xs font-normal text-gray-400">({grouped[pos].length})</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {grouped[pos].map(b => (
                <div key={b.id} className="bg-white border overflow-hidden">
                  {b.image_url
                    ? <img src={b.image_url} alt={b.title} className="w-full h-36 object-cover" />
                    : <div className="w-full h-36 bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
                        <span className="text-white/50 text-xs">No image</span>
                      </div>
                  }
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{b.title || 'Untitled'}</p>
                        {b.subtitle && <p className="text-xs text-gray-500 truncate">{b.subtitle}</p>}
                        {b.link && <p className="text-xs text-brand-secondary truncate">{b.link}</p>}
                      </div>
                      <Badge variant={b.is_active ? 'success' : 'default'} className="ml-2 flex-shrink-0">
                        {b.is_active ? 'Active' : 'Off'}
                      </Badge>
                    </div>
                    {(b.starts_at || b.expires_at) && (
                      <p className="text-xs text-gray-400 mb-2">
                        {b.starts_at ? `From ${b.starts_at.slice(0, 10)}` : ''}
                        {b.starts_at && b.expires_at ? ' → ' : ''}
                        {b.expires_at ? b.expires_at.slice(0, 10) : ''}
                      </p>
                    )}
                    <div className="flex gap-3 pt-2 border-t">
                      <button onClick={() => startEdit(b)}
                        className="text-xs text-brand-secondary hover:underline flex items-center gap-1">
                        <Edit2 size={12} /> Edit
                      </button>
                      <button
                        onClick={() => { if (confirm(`Delete "${b.title}"?`)) deleteMutation.mutate(b.id); }}
                        className="text-xs text-red-500 hover:underline flex items-center gap-1">
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      ))}

      {!banners.length && (
        <p className="text-center text-gray-400 py-12 text-sm">
          No banners yet. Click "Add Banner" to create your first hero slide.
        </p>
      )}
    </div>
  );
}
