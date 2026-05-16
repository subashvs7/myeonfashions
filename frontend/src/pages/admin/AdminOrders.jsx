import { useState, Fragment } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import { formatPrice } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Search, CheckCircle, Package, Truck, Download, Eye, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// Pipeline stages — mirrors Swiggy/Zomato dispatch flow
const PIPELINE = [
  { key: '',                 label: 'All',            color: 'gray' },
  { key: 'pending',          label: 'New Orders',     color: 'yellow',  action: 'Accept',   actionStatus: 'confirmed',  icon: CheckCircle },
  { key: 'confirmed',        label: 'To Pack',        color: 'blue',    action: 'Packed',   actionStatus: 'packed',     icon: Package },
  { key: 'packed',           label: 'Ready to Ship',  color: 'purple',  action: 'Dispatch', actionStatus: 'shipped',    icon: Truck },
  { key: 'shipped',          label: 'In Transit',     color: 'indigo' },
  { key: 'out_for_delivery', label: 'Out for Delivery', color: 'orange' },
  { key: 'delivered',        label: 'Delivered',      color: 'green' },
  { key: 'cancelled',        label: 'Cancelled',      color: 'red' },
];

const STATUS_VARIANT = {
  pending: 'warning', confirmed: 'info', processing: 'info', packed: 'info',
  shipped: 'info', out_for_delivery: 'info', delivered: 'success',
  cancelled: 'danger', returned: 'default',
};

const STAGE_COLOR = {
  yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  blue:   'bg-blue-50 text-blue-700 border-blue-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  green:  'bg-green-50 text-green-700 border-green-200',
  red:    'bg-red-50 text-red-700 border-red-200',
  gray:   'bg-gray-50 text-gray-700 border-gray-200',
};

function WhatsAppLink({ order }) {
  const addr = order.shipping_address || {};
  const phone = (order.user?.phone || addr.phone || '').replace(/\D/g, '');
  if (!phone) return null;
  const msg = encodeURIComponent(
    `Hi ${order.user?.name || 'Customer'}, your order #${order.order_number} has been confirmed. We'll keep you updated! — Myeon Casuals`
  );
  return (
    <a
      href={`https://wa.me/${phone}?text=${msg}`}
      target="_blank"
      rel="noopener noreferrer"
      title="Send WhatsApp"
      className="text-green-500 hover:text-green-700 transition-colors"
    >
      <MessageCircle size={14} />
    </a>
  );
}

export default function AdminOrders() {
  const qc = useQueryClient();
  const [activeStage, setActiveStage] = useState('pending');
  const [search, setSearch]           = useState('');
  const [page, setPage]               = useState(1);
  const [dispatchRow, setDispatchRow] = useState(null); // id of order being dispatched
  const [tracking, setTracking]       = useState({ number: '', courier: '', url: '' });

  // Counts per stage for badge display
  const { data: counts = {} } = useQuery({
    queryKey: ['order-status-counts'],
    queryFn: () => adminApi.orderStatusCounts().then(r => r.data.data),
    refetchInterval: 30000,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', activeStage, search, page],
    queryFn: () =>
      adminApi.getOrders({ status: activeStage || undefined, search: search || undefined, page, per_page: 20 })
        .then(r => r.data.data),
  });

  const orders = data?.data || [];
  const meta   = { last_page: data?.last_page || 1, current_page: data?.current_page || 1, total: data?.total || 0 };

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => adminApi.updateOrderStatus(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries(['admin-orders']);
      qc.invalidateQueries(['order-status-counts']);
      toast.success('Order updated');
      setDispatchRow(null);
    },
    onError: () => toast.error('Update failed'),
  });

  const trackingMutation = useMutation({
    mutationFn: ({ id }) => adminApi.addTracking(id, {
      tracking_number: tracking.number,
      courier_name:    tracking.courier,
      tracking_url:    tracking.url || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries(['admin-orders']);
      qc.invalidateQueries(['order-status-counts']);
      toast.success('Dispatched & tracking saved');
      setDispatchRow(null);
      setTracking({ number: '', courier: '', url: '' });
    },
    onError: () => toast.error('Failed to dispatch'),
  });

  const handleManifest = async () => {
    try {
      const res = await adminApi.manifestDownload({ status: activeStage || 'packed' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a   = document.createElement('a');
      a.href    = url;
      a.download = `manifest-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch { toast.error('Manifest download failed'); }
  };

  const currentStage = PIPELINE.find(p => p.key === activeStage);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-brand-primary">Orders</h1>
        <Button variant="outline" onClick={handleManifest} className="flex items-center gap-2 text-sm">
          <Download size={15} /> Download Manifest
        </Button>
      </div>

      {/* Pipeline tabs — Swiggy/Zomato style */}
      <div className="flex gap-1.5 flex-wrap mb-4">
        {PIPELINE.map(stage => {
          const count = stage.key ? (counts[stage.key] || 0) : Object.values(counts).reduce((a, b) => a + b, 0);
          const isActive = activeStage === stage.key;
          return (
            <button
              key={stage.key}
              onClick={() => { setActiveStage(stage.key); setPage(1); setSearch(''); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-full transition-all ${
                isActive
                  ? `${STAGE_COLOR[stage.color]} border font-semibold`
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              {stage.label}
              {count > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/60' : 'bg-gray-100'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="bg-white border p-3 mb-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search order # or customer name..."
            className="w-full pl-9 pr-3 py-2 border text-sm focus:outline-none focus:border-brand-primary"
          />
        </div>
        {meta.total > 0 && (
          <span className="text-xs text-gray-400 ml-auto">{meta.total} order{meta.total !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Orders table */}
      <div className="bg-white border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-xs uppercase text-gray-500">
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Payment</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map(o => (
                <Fragment key={o.id}>
                  <tr className={`hover:bg-gray-50 ${dispatchRow === o.id ? 'bg-purple-50/40' : ''}`}>
                    <td className="px-4 py-3 font-medium">#{o.order_number}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm">{o.user?.name || 'Guest'}</p>
                      <p className="text-xs text-gray-400">{o.user?.phone || '—'}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(o.created_at)}</td>
                    <td className="px-4 py-3 text-gray-600">{o.items_count || 0}</td>
                    <td className="px-4 py-3 font-semibold">{formatPrice(o.total)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={o.payment_status === 'paid' ? 'success' : 'warning'}>
                        {o.payment_status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANT[o.status] || 'default'}>
                        {o.status?.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {/* WhatsApp notify */}
                        <WhatsAppLink order={o} />

                        {/* View detail */}
                        <Link to={`/admin/orders/${o.id}`} title="View detail">
                          <Eye size={14} className="text-brand-secondary hover:text-brand-primary transition-colors" />
                        </Link>

                        {/* Quick action based on current stage */}
                        {currentStage?.action && currentStage?.actionStatus && (
                          o.status === currentStage.key ? (
                            currentStage.key === 'packed' ? (
                              <button
                                onClick={() => { setDispatchRow(dispatchRow === o.id ? null : o.id); setTracking({ number: '', courier: '', url: '' }); }}
                                className="flex items-center gap-1 text-xs bg-brand-primary text-white px-2 py-1 hover:bg-brand-primary/90 transition-colors whitespace-nowrap"
                              >
                                <Truck size={11} /> Dispatch
                              </button>
                            ) : (
                              <button
                                onClick={() => statusMutation.mutate({ id: o.id, status: currentStage.actionStatus })}
                                disabled={statusMutation.isPending}
                                className="flex items-center gap-1 text-xs bg-brand-primary text-white px-2 py-1 hover:bg-brand-primary/90 disabled:opacity-50 transition-colors whitespace-nowrap"
                              >
                                {currentStage.key === 'pending'
                                  ? <><CheckCircle size={11} /> Accept</>
                                  : <><Package size={11} /> Mark Packed</>}
                              </button>
                            )
                          ) : null
                        )}
                        {/* Tracking pill for shipped+ */}
                        {['shipped','out_for_delivery'].includes(o.status) && o.tracking_number && (
                          <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 border border-indigo-100 truncate max-w-[100px]" title={o.tracking_number}>
                            {o.courier_name} {o.tracking_number}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Inline dispatch row */}
                  {dispatchRow === o.id && (
                    <tr className="bg-purple-50/60">
                      <td colSpan={8} className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-medium text-purple-700 mr-1">Enter tracking to dispatch:</span>
                          <input
                            value={tracking.number}
                            onChange={e => setTracking(t => ({ ...t, number: e.target.value }))}
                            placeholder="Tracking number *"
                            className="border px-2 py-1.5 text-xs focus:outline-none focus:border-brand-primary w-40"
                          />
                          <input
                            value={tracking.courier}
                            onChange={e => setTracking(t => ({ ...t, courier: e.target.value }))}
                            placeholder="Courier (e.g. Delhivery) *"
                            className="border px-2 py-1.5 text-xs focus:outline-none focus:border-brand-primary w-44"
                          />
                          <input
                            value={tracking.url}
                            onChange={e => setTracking(t => ({ ...t, url: e.target.value }))}
                            placeholder="Tracking URL (optional)"
                            className="border px-2 py-1.5 text-xs focus:outline-none focus:border-brand-primary w-52"
                          />
                          <button
                            onClick={() => trackingMutation.mutate({ id: o.id })}
                            disabled={!tracking.number || !tracking.courier || trackingMutation.isPending}
                            className="text-xs bg-brand-primary text-white px-3 py-1.5 hover:bg-brand-primary/90 disabled:opacity-50 transition-colors"
                          >
                            {trackingMutation.isPending ? 'Dispatching…' : 'Confirm Dispatch'}
                          </button>
                          <button onClick={() => setDispatchRow(null)} className="text-xs text-gray-400 hover:text-gray-600">
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {!orders.length && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                    No orders in this stage
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
