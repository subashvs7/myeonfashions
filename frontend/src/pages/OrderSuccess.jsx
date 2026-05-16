import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../api/orders';
import { motion } from 'framer-motion';
import { CheckCircle, Package } from 'lucide-react';
import { formatPrice } from '../utils/formatCurrency';
import Button from '../components/ui/Button';

export default function OrderSuccess() {
  const { id } = useParams();
  const { data: order } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getOne(id).then(r => r.data.data),
  });

  return (
    <div className="page-container py-16 text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-brand-success/10 flex items-center justify-center mx-auto mb-6">
        <CheckCircle size={40} className="text-brand-success" />
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h1 className="font-heading text-4xl font-bold text-brand-primary mb-2">Order Placed!</h1>
        <p className="text-gray-600 mb-1">Thank you for shopping with Myeon Casuals</p>
        {order && <p className="text-sm text-gray-500 mb-8">Order ID: <strong>{order.order_number}</strong></p>}

        {order && (
          <div className="border max-w-md mx-auto p-5 mb-8 text-left space-y-3">
            <h3 className="font-medium flex items-center gap-2"><Package size={16}/> Order Summary</h3>
            {order.items?.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{item.product_name} × {item.quantity}</span>
                <span>{formatPrice(item.total)}</span>
              </div>
            ))}
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Total</span><span className="text-brand-primary">{formatPrice(order.total)}</span>
            </div>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <Link to="/account/orders"><Button>Track Order</Button></Link>
          <Link to="/"><Button variant="outline">Continue Shopping</Button></Link>
        </div>
      </motion.div>
    </div>
  );
}
