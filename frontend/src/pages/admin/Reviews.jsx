import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { formatDate } from '../../utils/formatDate';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Star, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_TABS = [
  { value: '',         label: 'All' },
  { value: 'pending',  label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

const STATUS_VARIANT = { approved: 'success', rejected: 'danger', pending: 'warning' };

function StarDisplay({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={12} className={i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'} />
      ))}
    </div>
  );
}

export default function AdminReviews() {
  const qc = useQueryClient();
  const [status, setStatus] = useState('pending');
  const [page, setPage]     = useState(1);
  const [deleteId, setDeleteId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews', status, page],
    queryFn: () =>
      adminApi.getReviews({ status: status || undefined, page, per_page: 20 }).then(r => r.data.data),
  });

  const reviews = data?.data || [];
  const meta    = { last_page: data?.last_page || 1, current_page: data?.current_page || 1, total: data?.total || 0 };

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => adminApi.updateReview(id, { status }),
    onSuccess: () => { qc.invalidateQueries(['admin-reviews']); toast.success('Review updated'); },
    onError: () => toast.error('Update failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteReview(id),
    onSuccess: () => { setDeleteId(null); qc.invalidateQueries(['admin-reviews']); toast.success('Review deleted'); },
    onError: () => toast.error('Delete failed'),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-brand-primary">Reviews</h1>
        {meta.total > 0 && <span className="text-sm text-gray-400">{meta.total} reviews</span>}
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-white border p-1 mb-4 w-fit">
        {STATUS_TABS.map(t => (
          <button
            key={t.value}
            onClick={() => { setStatus(t.value); setPage(1); }}
            className={`px-4 py-1.5 text-xs rounded transition-colors ${
              status === t.value ? 'bg-brand-primary text-white' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading…</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-xs uppercase text-gray-500">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium">Review</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {reviews.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 align-top">
                  <td className="px-4 py-3 font-medium max-w-[140px]">
                    <p className="truncate">{r.product?.name || '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <p className="font-medium text-xs">{r.user?.name || '—'}</p>
                    <p className="text-gray-400 text-xs truncate">{r.user?.email}</p>
                  </td>
                  <td className="px-4 py-3"><StarDisplay rating={r.rating} /></td>
                  <td className="px-4 py-3 max-w-[260px]">
                    {r.title && <p className="font-medium text-xs mb-0.5">{r.title}</p>}
                    <p className="text-xs text-gray-500 line-clamp-2">{r.body}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{formatDate(r.created_at)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[r.status] || 'default'}>{r.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    {deleteId === r.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => deleteMutation.mutate(r.id)}
                          disabled={deleteMutation.isPending}
                          className="text-xs bg-red-500 text-white px-2 py-1 hover:bg-red-600 disabled:opacity-50"
                        >
                          {deleteMutation.isPending ? '…' : 'Confirm'}
                        </button>
                        <button onClick={() => setDeleteId(null)} className="text-xs text-gray-400 px-2 py-1 border hover:bg-gray-50">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {r.status !== 'approved' && (
                          <button
                            title="Approve"
                            onClick={() => statusMutation.mutate({ id: r.id, status: 'approved' })}
                            disabled={statusMutation.isPending}
                            className="text-green-500 hover:text-green-700 disabled:opacity-40 transition-colors"
                          >
                            <CheckCircle size={15} />
                          </button>
                        )}
                        {r.status !== 'rejected' && (
                          <button
                            title="Reject"
                            onClick={() => statusMutation.mutate({ id: r.id, status: 'rejected' })}
                            disabled={statusMutation.isPending}
                            className="text-orange-400 hover:text-orange-600 disabled:opacity-40 transition-colors"
                          >
                            <XCircle size={15} />
                          </button>
                        )}
                        <button
                          title="Delete"
                          onClick={() => setDeleteId(r.id)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {!reviews.length && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                    No reviews found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {meta.last_page > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between text-sm">
            <span className="text-gray-500">Page {meta.current_page} of {meta.last_page}</span>
            <div className="flex gap-2">
              <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
              <Button variant="outline" disabled={page === meta.last_page} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
