import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../../api/orders';
import { formatPrice } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { ArrowLeft, Package, MapPin, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

const STATUS_STEPS = ['confirmed','processing','packed','shipped','out_for_delivery','delivered'];
const STATUS_VARIANT = {
  pending:'warning', confirmed:'info', processing:'info', packed:'info',
  shipped:'info', out_for_delivery:'info', delivered:'success',
  cancelled:'danger', returned:'default',
};

export default function OrderDetail() {
  const { id } = useParams();
  const [cancelling, setCancelling] = useState(false);

  const { data: order, isLoading, refetch } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getOne(id).then(r => r.data.data),
  });

  const handleCancel = async () => {
    if (!confirm('Cancel this order?')) return;
    setCancelling(true);
    try {
      await ordersApi.cancel(id);
      toast.success('Order cancelled successfully');
      refetch();
    } catch { toast.error('Could not cancel order'); }
    finally { setCancelling(false); }
  };

  if (isLoading) return <div className="h-96 bg-gray-100 animate-pulse" />;
  if (!order) return <p className="text-gray-500">Order not found.</p>;

  const stepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/account/orders" className="text-gray-400 hover:text-brand-primary">
          <ArrowLeft size={20} />
        </Link>
        <h2 className="font-heading text-2xl font-bold text-brand-primary">Order #{order.order_number}</h2>
        <Badge variant={STATUS_VARIANT[order.status] || 'default'}>{order.status_label || order.status}</Badge>
      </div>

      {/* Progress tracker */}
      {!['cancelled','returned','pending'].includes(order.status) && (
        <div className="border p-5 mb-6">
          <div className="flex justify-between relative">
            <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-200 z-0" />
            <div className="absolute top-3 left-0 h-0.5 bg-brand-primary z-0 transition-all"
              style={{ width: `${stepIndex > 0 ? (stepIndex / (STATUS_STEPS.length - 1)) * 100 : 0}%` }} />
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex flex-col items-center relative z-10">
                <div className={`w-6 h-6 flex items-center justify-center text-xs font-bold ${i <= stepIndex ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {i < stepIndex ? '✓' : i + 1}
                </div>
                <span className="text-[10px] text-gray-500 mt-1 hidden sm:block capitalize">{step.replace('_',' ')}</span>
              </div>
            ))}
          </div>
          {order.tracking_number && (
            <p className="text-xs text-gray-500 mt-4">Tracking: <strong>{order.tracking_number}</strong>
              {order.courier_name && ` via ${order.courier_name}`}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Delivery address */}
        <div className="border p-5">
          <h3 className="font-medium flex items-center gap-2 mb-3"><MapPin size={16}/> Delivery Address</h3>
          {order.address && (
            <div className="text-sm text-gray-600 space-y-0.5">
              <p className="font-medium text-gray-800">{order.address.full_name}</p>
              <p>{order.address.address_line1}{order.address.address_line2 ? `, ${order.address.address_line2}` : ''}</p>
              <p>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
              <p>Phone: {order.address.phone}</p>
            </div>
          )}
        </div>

        {/* Payment */}
        <div className="border p-5">
          <h3 className="font-medium flex items-center gap-2 mb-3"><CreditCard size={16}/> Payment</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex justify-between"><span>Method</span><span className="capitalize">{order.payment_method?.replace('_',' ')}</span></div>
            <div className="flex justify-between"><span>Status</span>
              <span className={order.payment_status === 'paid' ? 'text-brand-success' : 'text-yellow-600'}>
                {order.payment_status}
              </span>
            </div>
            {order.created_at && <div className="flex justify-between"><span>Placed</span><span>{formatDate(order.created_at)}</span></div>}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="border p-5 mb-6">
        <h3 className="font-medium flex items-center gap-2 mb-4"><Package size={16}/> Items</h3>
        <div className="space-y-4">
          {order.items?.map(item => (
            <div key={item.id} className="flex gap-4">
              {item.product_image && (
                <img src={item.product_image} alt={item.product_name} className="w-16 h-20 object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{item.product_name}</p>
                {(item.size || item.color) && (
                  <p className="text-xs text-gray-500">{[item.size, item.color].filter(Boolean).join(' / ')}</p>
                )}
                <p className="text-xs text-gray-500">Qty: {item.quantity} × {formatPrice(item.price)}</p>
              </div>
              <span className="font-medium text-sm">{formatPrice(item.total)}</span>
            </div>
          ))}
        </div>

        <div className="border-t mt-4 pt-4 space-y-2 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
          {order.discount > 0 && <div className="flex justify-between text-brand-success"><span>Discount</span><span>-{formatPrice(order.discount)}</span></div>}
          <div className="flex justify-between"><span>Shipping</span><span>{order.shipping_charge > 0 ? formatPrice(order.shipping_charge) : 'Free'}</span></div>
          <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span className="text-brand-primary">{formatPrice(order.total)}</span></div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {order.status === 'pending' && (
          <Button variant="outline" loading={cancelling} onClick={handleCancel} className="text-red-600 border-red-300 hover:bg-red-50">
            Cancel Order
          </Button>
        )}
        {order.status === 'delivered' && (
          <Link to={`/account/returns?order=${id}`}>
            <Button variant="outline">Request Return</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
