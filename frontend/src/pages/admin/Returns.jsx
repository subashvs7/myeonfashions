import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { formatDate } from '../../utils/formatDate';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const STATUS_VARIANT = { pending:'warning', approved:'info', rejected:'danger', completed:'success' };
const STATUSES = ['pending','approved','rejected','completed'];

export default function AdminReturns() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [updateForm, setUpdateForm] = useState({ status: '', admin_note: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-returns', statusFilter],
    queryFn: () => adminApi.getReturns({ status: statusFilter }).then(r => r.data.data),
  });

  const mutation = useMutation({
    mutationFn: ({ id, data }) => adminApi.updateReturn(id, data),
    onSuccess: () => { qc.invalidateQueries(['admin-returns']); toast.success('Return updated'); setUpdatingId(null); },
    onError: () => toast.error('Failed to update return'),
  });

  const returns = data?.data || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-brand-primary">Returns</h1>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="border px-3 py-2 text-sm focus:outline-none focus:border-brand-primary">
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        {isLoading ? <div className="h-48 bg-gray-100 animate-pulse" /> : returns.map(r => (
          <div key={r.id} className="bg-white border p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-medium">Return #{r.id}</p>
                <p className="text-sm text-gray-500">Order #{r.order?.order_number} · {r.user?.name}</p>
                <p className="text-xs text-gray-400">{formatDate(r.created_at)}</p>
              </div>
              <Badge variant={STATUS_VARIANT[r.status] || 'default'}>{r.status}</Badge>
            </div>

            <p className="text-sm text-gray-600 mb-1 capitalize"><strong>Reason:</strong> {r.reason?.replace('_',' ')}</p>
            {r.details && <p className="text-sm text-gray-500 mb-3">{r.details}</p>}
            {r.admin_note && <div className="bg-gray-50 p-2 text-xs text-gray-600 mb-3"><strong>Admin Note:</strong> {r.admin_note}</div>}

            {updatingId === r.id ? (
              <div className="border-t pt-3 space-y-3">
                <select value={updateForm.status} onChange={e => setUpdateForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full border px-3 py-2 text-sm focus:outline-none focus:border-brand-primary">
                  <option value="">Select status</option>
                  {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
                <textarea value={updateForm.admin_note} onChange={e => setUpdateForm(f => ({ ...f, admin_note: e.target.value }))}
                  rows={2} placeholder="Add note (optional)" className="w-full border px-3 py-2 text-sm focus:outline-none focus:border-brand-primary resize-none" />
                <div className="flex gap-2">
                  <Button onClick={() => mutation.mutate({ id: r.id, data: updateForm })} loading={mutation.isPending}>Update</Button>
                  <Button variant="outline" onClick={() => setUpdatingId(null)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <button onClick={() => { setUpdatingId(r.id); setUpdateForm({ status: r.status, admin_note: r.admin_note || '' }); }}
                className="text-xs text-brand-secondary hover:underline border-t pt-3 w-full text-left">
                Update Status / Add Note
              </button>
            )}
          </div>
        ))}
        {!isLoading && !returns.length && <p className="text-center text-gray-400 py-12">No returns found</p>}
      </div>
    </div>
  );
}
