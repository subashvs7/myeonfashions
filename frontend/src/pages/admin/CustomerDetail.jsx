import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { formatPrice } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { ArrowLeft, ShoppingBag, MapPin, Trash2, Ban, CheckCircle, Mail, Phone, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const ORDER_VARIANT = {
  pending: 'warning', confirmed: 'info', processing: 'info',
  packed: 'info', shipped: 'info', out_for_delivery: 'info',
  delivered: 'success', cancelled: 'danger', returned: 'default',
};

export default function AdminCustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: customer, isLoading } = useQuery({
    queryKey: ['admin-customer', id],
    queryFn: () => adminApi.getCustomer(id).then(r => r.data.data),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => adminApi.updateCustomer(id, data),
    onSuccess: (res) => {
      qc.setQueryData(['admin-customer', id], res.data.data);
      qc.invalidateQueries(['admin-customers']);
      toast.success('Customer updated');
    },
    onError: () => toast.error('Update failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => adminApi.deleteCustomer(id),
    onSuccess: () => {
      toast.success('Customer account deleted');
      qc.invalidateQueries(['admin-customers']);
      navigate('/admin/customers');
    },
    onError: () => toast.error('Delete failed'),
  });

  if (isLoading) return <div className="p-12 text-center text-gray-400">Loading...</div>;
  if (!customer) return <div className="p-12 text-center text-gray-400">Customer not found</div>;

  const initials = customer.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  const avgOrder = customer.orders_count > 0
    ? (customer.total_spent || 0) / customer.orders_count
    : 0;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin/customers')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-heading text-2xl font-bold text-brand-primary">{customer.name}</h1>
            <p className="text-sm text-gray-400">Customer ID #{customer.id}</p>
          </div>
        </div>
        <Badge variant={customer.is_active ? 'success' : 'danger'}>
          {customer.is_active ? 'Active' : 'Blocked'}
        </Badge>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Orders', value: customer.orders_count || 0 },
          { label: 'Total Spent', value: formatPrice(customer.total_spent || 0) },
          { label: 'Avg Order Value', value: formatPrice(avgOrder) },
        ].map(stat => (
          <div key={stat.label} className="bg-white border p-4 text-center">
            <p className="text-2xl font-bold text-brand-primary">{stat.value}</p>
            <p className="text-xs text-gray-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="space-y-4">
          {/* Profile */}
          <div className="bg-white border p-5">
            <h3 className="font-medium text-sm mb-4 text-gray-500 uppercase tracking-wide">Profile</h3>
            <div className="flex flex-col items-center mb-5">
              <div className="w-16 h-16 bg-brand-primary/10 flex items-center justify-center text-brand-primary text-xl font-bold overflow-hidden">
                {customer.avatar
                  ? <img src={customer.avatar} alt={customer.name} className="w-full h-full object-cover" />
                  : initials}
              </div>
              <p className="font-semibold mt-3">{customer.name}</p>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail size={14} className="text-gray-400 shrink-0" />
                <span className="truncate">{customer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={14} className="text-gray-400 shrink-0" />
                <span>{customer.phone || '—'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={14} className="text-gray-400 shrink-0" />
                <span>Joined {formatDate(customer.created_at)}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Gender</span>
                <span className="capitalize">{customer.gender || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email verified</span>
                <span>{customer.email_verified_at ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Phone verified</span>
                <span>{customer.phone_verified_at ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white border p-5 space-y-3">
            <h3 className="font-medium text-sm mb-3 text-gray-500 uppercase tracking-wide">Actions</h3>
            <Button
              variant={customer.is_active ? 'outline' : 'primary'}
              className="w-full flex items-center justify-center gap-2"
              loading={updateMutation.isPending}
              onClick={() => updateMutation.mutate({ is_active: !customer.is_active })}
            >
              {customer.is_active
                ? <><Ban size={14} /> Block Customer</>
                : <><CheckCircle size={14} /> Unblock Customer</>}
            </Button>

            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-full flex items-center justify-center gap-2 text-sm text-red-500 border border-red-200 py-2 hover:bg-red-50 transition-colors">
                <Trash2 size={14} /> Delete Account
              </button>
            ) : (
              <div className="border border-red-200 bg-red-50 p-3 space-y-2">
                <p className="text-xs text-red-700 font-medium">Delete this customer account? This cannot be undone.</p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 !py-1.5 text-xs" onClick={() => setConfirmDelete(false)}>Cancel</Button>
                  <button
                    onClick={() => deleteMutation.mutate()}
                    disabled={deleteMutation.isPending}
                    className="flex-1 text-xs bg-red-500 text-white py-1.5 hover:bg-red-600 disabled:opacity-50 transition-colors">
                    {deleteMutation.isPending ? 'Deleting…' : 'Yes, Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Orders */}
          <div className="bg-white border">
            <div className="px-5 py-3 border-b flex items-center gap-2">
              <ShoppingBag size={16} className="text-brand-primary" />
              <h3 className="font-medium">Recent Orders</h3>
              <span className="ml-auto text-xs text-gray-400">{customer.orders_count} total</span>
            </div>
            {customer.orders?.length ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-xs text-gray-500 uppercase">
                      <th className="px-4 py-2 font-medium">Order #</th>
                      <th className="px-4 py-2 font-medium">Date</th>
                      <th className="px-4 py-2 font-medium">Status</th>
                      <th className="px-4 py-2 font-medium">Payment</th>
                      <th className="px-4 py-2 font-medium">Total</th>
                      <th className="px-4 py-2 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {customer.orders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">#{order.order_number}</td>
                        <td className="px-4 py-3 text-gray-500">{formatDate(order.created_at)}</td>
                        <td className="px-4 py-3">
                          <Badge variant={ORDER_VARIANT[order.status] || 'default'}>{order.status}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={order.payment_status === 'paid' ? 'success' : 'warning'}>
                            {order.payment_status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 font-medium">{formatPrice(order.total)}</td>
                        <td className="px-4 py-3">
                          <Link to={`/admin/orders/${order.id}`} className="text-xs text-brand-secondary hover:underline">View</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="px-5 py-10 text-center text-gray-400 text-sm">No orders yet</p>
            )}
          </div>

          {/* Addresses */}
          <div className="bg-white border">
            <div className="px-5 py-3 border-b flex items-center gap-2">
              <MapPin size={16} className="text-brand-primary" />
              <h3 className="font-medium">Saved Addresses</h3>
              <span className="ml-auto text-xs text-gray-400">{customer.addresses?.length || 0} saved</span>
            </div>
            {customer.addresses?.length ? (
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                {customer.addresses.map(addr => (
                  <div key={addr.id} className={`border p-3 text-sm ${addr.is_default ? 'border-brand-primary bg-brand-primary/5' : ''}`}>
                    {addr.is_default && (
                      <span className="text-xs text-brand-primary font-semibold block mb-1">Default</span>
                    )}
                    <p className="font-medium">{addr.full_name}</p>
                    <p className="text-gray-500">{addr.address_line1}</p>
                    {addr.address_line2 && <p className="text-gray-500">{addr.address_line2}</p>}
                    <p className="text-gray-500">{addr.city}, {addr.state} — {addr.pincode}</p>
                    <p className="text-gray-500 mt-1">{addr.phone}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="px-5 py-10 text-center text-gray-400 text-sm">No addresses saved</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
