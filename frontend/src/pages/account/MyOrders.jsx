import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ordersApi } from '../../api/orders';
import { formatPrice } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { Package } from 'lucide-react';

const STATUS_VARIANT = {
  pending: 'warning', confirmed: 'info', processing: 'info',
  packed: 'info', shipped: 'info', out_for_delivery: 'info',
  delivered: 'success', cancelled: 'danger', returned: 'default',
};

export default function MyOrders() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => ordersApi.getAll().then(r => r.data.data.data),
  });

  if (isLoading) return (
    <div className="space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-28 bg-gray-100 animate-pulse" />)}
    </div>
  );

  if (!data?.length) return (
    <EmptyState icon={Package} title="No orders yet" description="When you place orders, they'll appear here."
      action={<Link to="/products" className="btn-primary">Shop Now</Link>} />
  );

  return (
    <div>
      <h2 className="font-heading text-2xl font-bold text-brand-primary mb-6">My Orders</h2>
      <div className="space-y-4">
        {data.map(order => (
          <div key={order.id} className="border p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-medium text-sm">#{order.order_number}</p>
                <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
              </div>
              <Badge variant={STATUS_VARIANT[order.status] || 'default'}>
                {order.status_label || order.status}
              </Badge>
            </div>

            <div className="space-y-1 mb-3">
              {order.items?.slice(0, 2).map(item => (
                <p key={item.id} className="text-sm text-gray-600">
                  {item.product_name} × {item.quantity}
                </p>
              ))}
              {order.items?.length > 2 && (
                <p className="text-xs text-gray-400">+{order.items.length - 2} more items</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t">
              <span className="font-semibold text-brand-primary">{formatPrice(order.total)}</span>
              <Link to={`/account/orders/${order.id}`} className="text-sm text-brand-secondary hover:underline font-medium">
                View Details →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
