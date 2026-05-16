import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { formatPrice } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { ArrowLeft, MessageCircle, Printer, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_VARIANT = {
  pending: 'warning', confirmed: 'info', processing: 'info', packed: 'info',
  shipped: 'info', out_for_delivery: 'info', delivered: 'success',
  cancelled: 'danger', returned: 'default',
};

// Flow pipeline — left to right
const FLOW = [
  { key: 'pending',          label: 'Order Placed' },
  { key: 'confirmed',        label: 'Accepted' },
  { key: 'packed',           label: 'Packed' },
  { key: 'shipped',          label: 'Dispatched' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered',        label: 'Delivered' },
];

const CANCELLED_STATUSES = ['cancelled', 'returned'];

const STATUSES = ['confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'];

function StatusTimeline({ current }) {
  if (CANCELLED_STATUSES.includes(current)) {
    return (
      <div className="flex items-center gap-2 mb-6 bg-red-50 border border-red-200 px-4 py-3">
        <span className="text-red-600 font-medium text-sm capitalize">Order {current}</span>
      </div>
    );
  }

  const currentIdx = FLOW.findIndex(s => s.key === current);

  return (
    <div className="bg-white border p-5 mb-6">
      <div className="flex items-center">
        {FLOW.map((step, i) => {
          const done    = i < currentIdx;
          const active  = i === currentIdx;
          const pending = i > currentIdx;
          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                  done   ? 'bg-brand-primary border-brand-primary text-white' :
                  active ? 'bg-white border-brand-primary text-brand-primary' :
                           'bg-white border-gray-200 text-gray-300'
                }`}>
                  {done ? <CheckCircle size={14} /> : i + 1}
                </div>
                <span className={`text-[10px] mt-1 whitespace-nowrap font-medium ${
                  done || active ? 'text-brand-primary' : 'text-gray-300'
                }`}>
                  {step.label}
                </span>
              </div>
              {i < FLOW.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 mb-4 ${done ? 'bg-brand-primary' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InvoicePrint({ order }) {
  const handlePrint = () => {
    const addr = order.address || {};
    const html = `
      <!DOCTYPE html><html><head><title>Invoice #${order.order_number}</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 700px; margin: 40px auto; color: #111; font-size: 13px; }
        h1 { font-size: 20px; margin: 0; } .meta { color: #666; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { text-align: left; border-bottom: 2px solid #111; padding: 6px 4px; font-size: 11px; text-transform: uppercase; }
        td { padding: 8px 4px; border-bottom: 1px solid #eee; }
        .totals { margin-top: 16px; text-align: right; }
        .totals p { margin: 4px 0; }
        .brand { font-size: 22px; font-weight: bold; color: #7C3AED; }
        @media print { body { margin: 0; } }
      </style></head><body>
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px">
        <div><div class="brand">Myeon Casuals</div><div class="meta">Tax Invoice</div></div>
        <div style="text-align:right">
          <div class="meta">Invoice #${order.order_number}</div>
          <div class="meta">Date: ${new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:20px">
        <div><strong>Bill To:</strong><br/>${order.user?.name || ''}<br/>${order.user?.email || ''}<br/>${order.user?.phone || ''}</div>
        <div><strong>Ship To:</strong><br/>${addr.full_name || ''}<br/>${addr.address_line1 || ''}, ${addr.city || ''}<br/>${addr.state || ''} — ${addr.pincode || ''}<br/>${addr.phone || ''}</div>
      </div>
      <table>
        <thead><tr><th>#</th><th>Product</th><th>Variant</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
        <tbody>
        ${(order.items || []).map((item, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${item.product_name}</td>
            <td>${item.variant_info || '—'}</td>
            <td>${item.quantity}</td>
            <td>₹${Number(item.price).toFixed(2)}</td>
            <td>₹${Number(item.total).toFixed(2)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
      <div class="totals">
        <p>Subtotal: ₹${Number(order.subtotal || 0).toFixed(2)}</p>
        ${order.discount > 0 ? `<p>Discount: -₹${Number(order.discount).toFixed(2)}</p>` : ''}
        <p>Shipping: ${order.shipping_charge > 0 ? '₹' + Number(order.shipping_charge).toFixed(2) : 'Free'}</p>
        <p style="font-size:15px;font-weight:bold;border-top:2px solid #111;padding-top:6px;margin-top:6px">
          Total: ₹${Number(order.total || 0).toFixed(2)}
        </p>
        <p class="meta">Payment: ${order.payment_method?.replace('_', ' ')} — ${order.payment_status}</p>
      </div>
      <div style="margin-top:40px;text-align:center;color:#999;font-size:11px">Thank you for shopping with Myeon Casuals!</div>
      </body></html>`;

    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.print();
  };

  return (
    <button
      onClick={handlePrint}
      className="flex items-center gap-2 text-sm border px-3 py-2 hover:bg-gray-50 transition-colors"
    >
      <Printer size={14} /> Print Invoice
    </button>
  );
}

export default function AdminOrderDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote]           = useState('');
  const [tracking, setTracking]   = useState({ number: '', courier_name: '', url: '' });

  const { data: order, isLoading } = useQuery({
    queryKey: ['admin-order', id],
    queryFn: () => adminApi.getOrder(id).then(r => r.data.data),
  });

  const statusMutation = useMutation({
    mutationFn: (data) => adminApi.updateOrderStatus(id, data),
    onSuccess: () => { qc.invalidateQueries(['admin-order', id]); qc.invalidateQueries(['admin-orders']); qc.invalidateQueries(['order-status-counts']); toast.success('Status updated'); setNote(''); setNewStatus(''); },
    onError: () => toast.error('Failed to update status'),
  });

  const trackingMutation = useMutation({
    mutationFn: (data) => adminApi.addTracking(id, data),
    onSuccess: () => { qc.invalidateQueries(['admin-order', id]); toast.success('Tracking saved & order shipped'); },
    onError: () => toast.error('Failed to save tracking'),
  });

  if (isLoading) return <div className="h-96 bg-gray-100 animate-pulse rounded" />;
  if (!order) return <p className="text-gray-500">Order not found.</p>;

  // Profit calc (if cost_price available on items)
  const itemsWithCost = (order.items || []).filter(i => i.cost_price != null);
  const totalCost     = itemsWithCost.reduce((s, i) => s + (Number(i.cost_price) * i.quantity), 0);
  const totalRevenue  = itemsWithCost.reduce((s, i) => s + Number(i.total), 0);
  const grossProfit   = totalRevenue - totalCost;
  const hasCostData   = itemsWithCost.length > 0;

  // WhatsApp message for tracking
  const phone = (order.user?.phone || '').replace(/\D/g, '');
  const waMsg = order.tracking_number
    ? encodeURIComponent(`Hi ${order.user?.name || 'Customer'}, your Myeon Casuals order #${order.order_number} has been shipped via ${order.courier_name}. Track: ${order.tracking_number}${order.tracking_url ? ' — ' + order.tracking_url : ''}`)
    : encodeURIComponent(`Hi ${order.user?.name || 'Customer'}, your Myeon Casuals order #${order.order_number} status has been updated to: ${order.status?.replace(/_/g, ' ')}. Thank you!`);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Link to="/admin/orders" className="text-gray-400 hover:text-brand-primary transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="font-heading text-xl font-bold text-brand-primary">Order #{order.order_number}</h1>
        <Badge variant={STATUS_VARIANT[order.status] || 'default'}>{order.status?.replace(/_/g, ' ')}</Badge>
        <div className="ml-auto flex items-center gap-2">
          {phone && (
            <a
              href={`https://wa.me/${phone}?text=${waMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-green-600 border border-green-200 px-3 py-1.5 hover:bg-green-50 transition-colors"
            >
              <MessageCircle size={14} /> WhatsApp
            </a>
          )}
          <InvoicePrint order={order} />
        </div>
      </div>

      {/* Status timeline */}
      <StatusTimeline current={order.status} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white border p-5">
            <h3 className="font-medium mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.items?.map(item => (
                <div key={item.id} className="flex gap-4 py-2 border-b last:border-0">
                  {item.product_image && (
                    <img src={item.product_image} alt="" className="w-14 h-16 object-cover flex-shrink-0 border" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{item.product_name}</p>
                    {item.variant_info && <p className="text-xs text-gray-400">{item.variant_info}</p>}
                    <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                    {item.cost_price != null && (
                      <p className="text-xs text-green-600 mt-0.5">
                        Cost: {formatPrice(item.cost_price)} &nbsp;|&nbsp;
                        Profit: {formatPrice(item.price - item.cost_price)} / unit
                      </p>
                    )}
                  </div>
                  <span className="font-medium text-sm flex-shrink-0">{formatPrice(item.total)}</span>
                </div>
              ))}
            </div>

            {/* Order totals */}
            <div className="pt-3 space-y-1.5 text-sm border-t mt-2">
              <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(order.discount)}</span></div>}
              <div className="flex justify-between"><span className="text-gray-500">Shipping</span><span>{order.shipping_charge > 0 ? formatPrice(order.shipping_charge) : 'Free'}</span></div>
              <div className="flex justify-between font-bold text-base border-t pt-2 mt-1"><span>Total</span><span className="text-brand-primary">{formatPrice(order.total)}</span></div>
            </div>

            {/* Profit summary */}
            {hasCostData && (
              <div className="mt-4 pt-4 border-t bg-green-50 -mx-5 px-5 -mb-5 pb-5">
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">Profit Summary</p>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div><p className="text-xs text-gray-500">Revenue</p><p className="font-bold text-sm">{formatPrice(totalRevenue)}</p></div>
                  <div><p className="text-xs text-gray-500">Cost</p><p className="font-bold text-sm text-red-500">{formatPrice(totalCost)}</p></div>
                  <div><p className="text-xs text-gray-500">Gross Profit</p><p className={`font-bold text-sm ${grossProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>{formatPrice(grossProfit)}</p></div>
                </div>
              </div>
            )}
          </div>

          {/* Update status */}
          <div className="bg-white border p-5">
            <h3 className="font-medium mb-4">Update Status</h3>
            <div className="space-y-3">
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
                className="w-full border px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
              >
                <option value="">Select new status…</option>
                {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s.replace(/_/g, ' ')}</option>)}
              </select>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Internal note (optional)"
                rows={2}
                className="w-full border px-3 py-2 text-sm focus:outline-none focus:border-brand-primary resize-none"
              />
              <Button
                onClick={() => newStatus && statusMutation.mutate({ status: newStatus, note })}
                loading={statusMutation.isPending}
                disabled={!newStatus}
              >
                Update Status
              </Button>
            </div>
          </div>

          {/* Tracking */}
          <div className="bg-white border p-5">
            <h3 className="font-medium mb-4">Tracking Information</h3>
            {order.tracking_number && (
              <div className="mb-3 p-3 bg-indigo-50 border border-indigo-100 text-sm">
                <p className="font-medium text-indigo-700">{order.courier_name} — {order.tracking_number}</p>
                {order.tracking_url && (
                  <a href={order.tracking_url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-indigo-500 hover:underline">{order.tracking_url}</a>
                )}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input
                value={tracking.number}
                onChange={e => setTracking(t => ({ ...t, number: e.target.value }))}
                placeholder="Tracking number"
                className="border px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
              />
              <input
                value={tracking.courier_name}
                onChange={e => setTracking(t => ({ ...t, courier_name: e.target.value }))}
                placeholder="Courier (e.g. Delhivery)"
                className="border px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
              />
            </div>
            <input
              value={tracking.url}
              onChange={e => setTracking(t => ({ ...t, url: e.target.value }))}
              placeholder="Tracking URL (optional)"
              className="w-full border px-3 py-2 text-sm focus:outline-none focus:border-brand-primary mb-3"
            />
            <Button
              variant="outline"
              onClick={() => trackingMutation.mutate({ tracking_number: tracking.number, courier_name: tracking.courier_name, tracking_url: tracking.url || undefined })}
              loading={trackingMutation.isPending}
              disabled={!tracking.number || !tracking.courier_name}
            >
              Save Tracking &amp; Mark Shipped
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Customer */}
          <div className="bg-white border p-5">
            <h3 className="font-medium mb-3">Customer</h3>
            <p className="font-medium text-sm">{order.user?.name}</p>
            <p className="text-sm text-gray-500">{order.user?.email}</p>
            <p className="text-sm text-gray-500">{order.user?.phone}</p>
            <Link to={`/admin/customers/${order.user_id}`}
              className="text-xs text-brand-secondary hover:underline mt-2 block">
              View Profile →
            </Link>
          </div>

          {/* Shipping Address */}
          <div className="bg-white border p-5">
            <h3 className="font-medium mb-3">Shipping Address</h3>
            {order.address ? (
              <div className="text-sm text-gray-600 space-y-0.5">
                <p className="font-medium text-gray-800">{order.address.full_name}</p>
                <p>{order.address.address_line1}</p>
                {order.address.address_line2 && <p>{order.address.address_line2}</p>}
                <p>{order.address.city}, {order.address.state} {order.address.pincode}</p>
                <p className="mt-1">{order.address.phone}</p>
              </div>
            ) : order.shipping_address ? (
              <div className="text-sm text-gray-600 space-y-0.5">
                <p className="font-medium text-gray-800">{order.shipping_address.full_name}</p>
                <p>{order.shipping_address.address_line1}</p>
                <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.pincode}</p>
              </div>
            ) : <p className="text-sm text-gray-400">No address</p>}
          </div>

          {/* Payment */}
          <div className="bg-white border p-5">
            <h3 className="font-medium mb-3">Payment</h3>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="capitalize">{order.payment_method?.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={order.payment_status === 'paid' ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium'}>
                  {order.payment_status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Placed</span>
                <span>{formatDate(order.created_at)}</span>
              </div>
              {order.delivered_at && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivered</span>
                  <span>{formatDate(order.delivered_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-white border p-5">
              <h3 className="font-medium mb-2">Customer Note</h3>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
