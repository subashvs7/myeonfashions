import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { formatPrice } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY = { code: '', title: '', type: 'percentage', value: '', min_order_value: '', max_discount: '', usage_limit: '', expires_at: '', is_active: true, first_order_only: false };
const TYPES = ['percentage','flat','free_shipping','bogo'];

export default function AdminCoupons() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const { data: coupons = [] } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: () => adminApi.getCoupons().then(r => r.data.data.data),
  });

  const stripped = (obj) => Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== ''));

  const saveMutation = useMutation({
    mutationFn: (data) => editing ? adminApi.updateCoupon(editing.id, stripped(data)) : adminApi.createCoupon(stripped(data)),
    onSuccess: () => { qc.invalidateQueries(['admin-coupons']); toast.success('Coupon saved'); setEditing(null); setAdding(false); setForm(EMPTY); },
    onError: () => toast.error('Failed to save coupon'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteCoupon(id),
    onSuccess: () => { qc.invalidateQueries(['admin-coupons']); toast.success('Coupon deleted'); },
  });

  const startEdit = (c) => {
    setEditing(c);
    setForm({ code: c.code, title: c.title || '', type: c.type, value: c.value || '', min_order_value: c.min_order_value || '', max_discount: c.max_discount || '', usage_limit: c.usage_limit || '', expires_at: c.expires_at?.slice(0,10) || '', is_active: c.is_active, first_order_only: c.first_order_only });
    setAdding(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-brand-primary">Coupons</h1>
        {!adding && !editing && (
          <Button onClick={() => { setAdding(true); setForm(EMPTY); }} className="flex items-center gap-2"><Plus size={16} /> Add Coupon</Button>
        )}
      </div>

      {(adding || editing) && (
        <div className="bg-white border p-5 mb-6">
          <h3 className="font-medium mb-4">{editing ? 'Edit Coupon' : 'New Coupon'}</h3>
          <div className="grid grid-cols-2 gap-4 max-w-2xl">
            <Input label="Code" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} required />
            <Input label="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full border px-3 py-2 text-sm focus:outline-none focus:border-brand-primary">
                {TYPES.map(t => <option key={t} value={t} className="capitalize">{t.replace('_',' ')}</option>)}
              </select>
            </div>
            {form.type !== 'free_shipping' && (
              <Input label={form.type === 'percentage' ? 'Discount %' : 'Flat Amount (₹)'} type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} />
            )}
            <Input label="Min Order Amount (₹)" type="number" value={form.min_order_value} onChange={e => setForm(f => ({ ...f, min_order_value: e.target.value }))} />
            {form.type === 'percentage' && (
              <Input label="Max Discount (₹)" type="number" value={form.max_discount} onChange={e => setForm(f => ({ ...f, max_discount: e.target.value }))} />
            )}
            <Input label="Usage Limit (0 = unlimited)" type="number" value={form.usage_limit} onChange={e => setForm(f => ({ ...f, usage_limit: e.target.value }))} />
            <Input label="Expires At" type="date" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} />
            <div className="col-span-2 flex gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="accent-brand-primary" /> Active
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.first_order_only} onChange={e => setForm(f => ({ ...f, first_order_only: e.target.checked }))} className="accent-brand-primary" /> First Order Only
              </label>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={() => saveMutation.mutate(form)} loading={saveMutation.isPending}>Save</Button>
            <Button variant="outline" onClick={() => { setEditing(null); setAdding(false); }}>Cancel</Button>
          </div>
        </div>
      )}

      <div className="bg-white border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-xs uppercase text-gray-500">
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Value</th>
              <th className="px-4 py-3 font-medium">Uses</th>
              <th className="px-4 py-3 font-medium">Expires</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {coupons.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono font-bold">{c.code}</td>
                <td className="px-4 py-3 capitalize text-gray-600">{c.type.replace('_',' ')}</td>
                <td className="px-4 py-3">
                  {c.type === 'percentage' ? `${c.value}%` : c.type === 'flat' ? formatPrice(c.value) : '—'}
                </td>
                <td className="px-4 py-3 text-gray-500">{c.used_count || 0}{c.usage_limit ? `/${c.usage_limit}` : ''}</td>
                <td className="px-4 py-3 text-gray-500">{c.expires_at ? formatDate(c.expires_at) : 'Never'}</td>
                <td className="px-4 py-3"><Badge variant={c.is_active ? 'success' : 'default'}>{c.is_active ? 'Active' : 'Off'}</Badge></td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => startEdit(c)} className="p-1 text-gray-400 hover:text-brand-primary"><Edit2 size={14} /></button>
                    <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(c.id); }} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {!coupons.length && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No coupons</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
