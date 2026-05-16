import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { returnsApi } from '../../api/returns';
import { formatPrice } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { RotateCcw, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_VARIANT = { pending:'warning', approved:'info', rejected:'danger', completed:'success' };

export default function MyReturns() {
  const [params] = useSearchParams();
  const orderId = params.get('order');
  const [showForm, setShowForm] = useState(!!orderId);
  const [form, setForm] = useState({ order_id: orderId || '', reason: '', details: '' });
  const qc = useQueryClient();

  const { data: returns = [], isLoading } = useQuery({
    queryKey: ['my-returns'],
    queryFn: () => returnsApi.getAll().then(r => r.data.data),
  });

  const mutation = useMutation({
    mutationFn: (data) => returnsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries(['my-returns']);
      setShowForm(false);
      setForm({ order_id: '', reason: '', details: '' });
      toast.success('Return request submitted!');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to submit return'),
  });

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.order_id || !form.reason) return;
    mutation.mutate(form);
  };

  if (isLoading) return <div className="h-48 bg-gray-100 animate-pulse" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-2xl font-bold text-brand-primary">Returns</h2>
        {!showForm && (
          <Button variant="outline" onClick={() => setShowForm(true)} className="flex items-center gap-2">
            <Plus size={16} /> New Request
          </Button>
        )}
      </div>

      {showForm && (
        <div className="border p-5 mb-6">
          <h3 className="font-medium mb-4">Submit Return Request</h3>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Order ID</label>
              <input value={form.order_id} onChange={e => setForm(f => ({ ...f, order_id: e.target.value }))}
                placeholder="Enter order ID" required
                className="w-full border px-3 py-2 text-sm focus:outline-none focus:border-brand-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Reason</label>
              <select value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} required
                className="w-full border px-3 py-2 text-sm focus:outline-none focus:border-brand-primary">
                <option value="">Select reason</option>
                <option value="wrong_item">Wrong item received</option>
                <option value="damaged">Item damaged</option>
                <option value="not_as_described">Not as described</option>
                <option value="size_issue">Size issue</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Details</label>
              <textarea value={form.details} onChange={e => setForm(f => ({ ...f, details: e.target.value }))}
                rows={3} placeholder="Describe the issue..."
                className="w-full border px-3 py-2 text-sm focus:outline-none focus:border-brand-primary resize-none" />
            </div>
            <div className="flex gap-3">
              <Button type="submit" loading={mutation.isPending}>Submit Request</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {!returns.length && !showForm ? (
        <EmptyState icon={RotateCcw} title="No return requests" description="Return requests you submit will appear here." />
      ) : (
        <div className="space-y-4">
          {returns.map(r => (
            <div key={r.id} className="border p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-sm">Return #{r.id}</p>
                  <p className="text-xs text-gray-500">Order #{r.order?.order_number} · {formatDate(r.created_at)}</p>
                </div>
                <Badge variant={STATUS_VARIANT[r.status] || 'default'}>{r.status}</Badge>
              </div>
              <p className="text-sm text-gray-600 capitalize">{r.reason?.replace('_', ' ')}</p>
              {r.details && <p className="text-xs text-gray-400 mt-1">{r.details}</p>}
              {r.admin_note && (
                <div className="mt-2 p-2 bg-gray-50 text-xs text-gray-600">
                  <strong>Note:</strong> {r.admin_note}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
