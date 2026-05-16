import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { formatPrice } from '../../utils/formatCurrency';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY = { name: '', description: '', flat_rate: '', free_above: '', estimated_days: '', is_active: true, pincodes: '' };

export default function AdminShipping() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const { data: zones = [] } = useQuery({
    queryKey: ['admin-shipping'],
    queryFn: () => adminApi.getShipping().then(r => r.data.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editing ? adminApi.updateShipping(editing.id, data) : adminApi.createShipping(data),
    onSuccess: () => { qc.invalidateQueries(['admin-shipping']); toast.success('Zone saved'); setEditing(null); setAdding(false); setForm(EMPTY); },
    onError: () => toast.error('Failed to save zone'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteShipping(id),
    onSuccess: () => { qc.invalidateQueries(['admin-shipping']); toast.success('Zone deleted'); },
  });

  const startEdit = (z) => {
    setEditing(z);
    setForm({ name: z.name, description: z.description || '', flat_rate: z.flat_rate, free_above: z.free_above || '', estimated_days: z.estimated_days || '', is_active: z.is_active, pincodes: z.pincodes?.join(', ') || '' });
    setAdding(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-brand-primary">Shipping Zones</h1>
        {!adding && !editing && (
          <Button onClick={() => { setAdding(true); setForm(EMPTY); }} className="flex items-center gap-2"><Plus size={16} /> Add Zone</Button>
        )}
      </div>

      {(adding || editing) && (
        <div className="bg-white border p-5 mb-6">
          <h3 className="font-medium mb-4">{editing ? 'Edit Zone' : 'New Zone'}</h3>
          <div className="grid grid-cols-2 gap-4 max-w-2xl">
            <Input label="Zone Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            <Input label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            <Input label="Shipping Rate (₹)" type="number" value={form.flat_rate} onChange={e => setForm(f => ({ ...f, flat_rate: e.target.value }))} required />
            <Input label="Free Above (₹)" type="number" value={form.free_above} onChange={e => setForm(f => ({ ...f, free_above: e.target.value }))} />
            <Input label="Estimated Days" type="number" value={form.estimated_days} onChange={e => setForm(f => ({ ...f, estimated_days: e.target.value }))} />
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Pincodes (comma-separated, leave blank for all)</label>
              <textarea value={form.pincodes} onChange={e => setForm(f => ({ ...f, pincodes: e.target.value }))}
                rows={3} placeholder="600001, 600002, 400001..." className="w-full border px-3 py-2 text-sm focus:outline-none focus:border-brand-primary resize-none" />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="accent-brand-primary" /> Active
            </label>
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={() => saveMutation.mutate({ ...form, pincodes: form.pincodes.split(',').map(p => p.trim()).filter(Boolean) })} loading={saveMutation.isPending}>Save</Button>
            <Button variant="outline" onClick={() => { setEditing(null); setAdding(false); }}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {zones.map(z => (
          <div key={z.id} className="bg-white border p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-medium">{z.name}</p>
                {z.description && <p className="text-xs text-gray-500 mt-0.5">{z.description}</p>}
              </div>
              <Badge variant={z.is_active ? 'success' : 'default'}>{z.is_active ? 'Active' : 'Off'}</Badge>
            </div>
            <div className="text-sm text-gray-600 space-y-1 mb-4">
              <div className="flex justify-between"><span>Rate</span><span className="font-medium">{formatPrice(z.flat_rate)}</span></div>
              {z.free_above && <div className="flex justify-between"><span>Free above</span><span className="font-medium">{formatPrice(z.free_above)}</span></div>}
              {z.estimated_days && <div className="flex justify-between"><span>Delivery</span><span>{z.estimated_days} days</span></div>}
              <div className="flex justify-between"><span>Coverage</span><span>{z.pincodes?.length ? `${z.pincodes.length} pincodes` : 'Nationwide'}</span></div>
            </div>
            <div className="flex gap-3 pt-3 border-t">
              <button onClick={() => startEdit(z)} className="text-xs text-brand-secondary hover:underline flex items-center gap-1"><Edit2 size={12} /> Edit</button>
              <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(z.id); }} className="text-xs text-red-500 hover:underline flex items-center gap-1"><Trash2 size={12} /> Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
