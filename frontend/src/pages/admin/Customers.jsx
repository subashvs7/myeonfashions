import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import { formatPrice } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Search, Ban, CheckCircle, Trash2, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_TABS = [
  { label: 'All',     value: '' },
  { label: 'Active',  value: 'true' },
  { label: 'Blocked', value: 'false' },
];

export default function AdminCustomers() {
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState('');
  const [page, setPage]             = useState(1);
  const [deleteId, setDeleteId]     = useState(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', search, statusFilter, page],
    queryFn: () =>
      adminApi.getCustomers({
        search,
        page,
        per_page: 20,
        ...(statusFilter !== '' ? { is_active: statusFilter } : {}),
      }).then(r => r.data.data),
  });

  const customers = data?.data || [];
  const meta = { last_page: data?.last_page || 1, current_page: data?.current_page || 1, total: data?.total || 0 };

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => adminApi.updateCustomer(id, { is_active }),
    onSuccess: () => {
      qc.invalidateQueries(['admin-customers']);
      toast.success('Customer updated');
    },
    onError: () => toast.error('Update failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteCustomer(id),
    onSuccess: () => {
      setDeleteId(null);
      qc.invalidateQueries(['admin-customers']);
      toast.success('Customer deleted');
    },
    onError: () => toast.error('Delete failed'),
  });

  const handleSearch = (e) => { setSearch(e.target.value); setPage(1); };
  const handleStatus = (val) => { setStatus(val); setPage(1); };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-brand-primary mb-6">Customers</h1>

      {/* Filters */}
      <div className="bg-white border p-4 mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={handleSearch}
            placeholder="Search by name, email or phone..."
            className="w-full pl-9 pr-3 py-2 border text-sm focus:outline-none focus:border-brand-primary"
          />
        </div>

        <div className="flex gap-1 border p-0.5 rounded">
          {STATUS_TABS.map(t => (
            <button
              key={t.value}
              onClick={() => handleStatus(t.value)}
              className={`px-3 py-1.5 text-xs rounded transition-colors ${
                statusFilter === t.value
                  ? 'bg-brand-primary text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {meta.total > 0 && (
          <span className="text-xs text-gray-400 ml-auto">{meta.total} customer{meta.total !== 1 ? 's' : ''}</span>
        )}
      </div>

      <div className="bg-white border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-xs uppercase text-gray-500">
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Joined</th>
                <th className="px-4 py-3 font-medium">Orders</th>
                <th className="px-4 py-3 font-medium">Total Spent</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.phone || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(c.created_at)}</td>
                  <td className="px-4 py-3">{c.orders_count || 0}</td>
                  <td className="px-4 py-3 font-medium">{formatPrice(c.total_spent || 0)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={c.is_active ? 'success' : 'danger'}>
                      {c.is_active ? 'Active' : 'Blocked'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {deleteId === c.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => deleteMutation.mutate(c.id)}
                          disabled={deleteMutation.isPending}
                          className="text-xs bg-red-500 text-white px-2 py-1 hover:bg-red-600 disabled:opacity-50 transition-colors"
                        >
                          {deleteMutation.isPending ? '…' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => setDeleteId(null)}
                          className="text-xs text-gray-500 px-2 py-1 border hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Link to={`/admin/customers/${c.id}`} title="View detail">
                          <Eye size={14} className="text-brand-secondary hover:text-brand-primary transition-colors" />
                        </Link>
                        <button
                          title={c.is_active ? 'Block customer' : 'Unblock customer'}
                          disabled={toggleMutation.isPending}
                          onClick={() => toggleMutation.mutate({ id: c.id, is_active: !c.is_active })}
                          className="disabled:opacity-40 transition-colors"
                        >
                          {c.is_active
                            ? <Ban size={14} className="text-orange-400 hover:text-orange-600" />
                            : <CheckCircle size={14} className="text-green-500 hover:text-green-700" />}
                        </button>
                        <button
                          title="Delete account"
                          onClick={() => setDeleteId(c.id)}
                          className="transition-colors"
                        >
                          <Trash2 size={14} className="text-red-400 hover:text-red-600" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {!customers.length && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                    No customers found
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
