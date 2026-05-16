import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import CartItem from '../components/cart/CartItem';
import CouponInput from '../components/cart/CouponInput';
import FreeShippingBar from '../components/cart/FreeShippingBar';
import { formatPrice } from '../utils/formatCurrency';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

export default function CartPage() {
  const { items, subtotal, discount, coupon, fetchCart } = useCartStore();

  if (!items.length) {
    return (
      <div className="page-container py-16">
        <EmptyState icon={ShoppingBag} title="Your bag is empty" description="Add some gorgeous ethnic wear to get started"
          action={<Link to="/categories/sarees"><Button>Start Shopping</Button></Link>} />
      </div>
    );
  }

  const total = subtotal - discount;

  return (
    <div className="page-container py-8">
      <h1 className="font-heading text-3xl font-bold text-brand-primary mb-8">Shopping Bag ({items.length})</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-0">
          <FreeShippingBar subtotal={subtotal} />
          {items.map(item => <CartItem key={item.id} item={item} />)}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="border p-5 space-y-4">
            <h3 className="font-heading text-lg font-semibold">Order Summary</h3>

            <CouponInput subtotal={subtotal} />

            <div className="space-y-2 text-sm pt-2">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-brand-success"><span>Coupon ({coupon?.code})</span><span>-{formatPrice(discount)}</span></div>}
              <div className="flex justify-between text-gray-500"><span>Shipping</span><span className="text-brand-success">Calculated at checkout</span></div>
              <div className="flex justify-between font-bold text-base border-t pt-2">
                <span>Total</span><span className="text-brand-primary">{formatPrice(total)}</span>
              </div>
            </div>

            <Link to="/checkout">
              <Button className="w-full flex items-center justify-center gap-2">
                Proceed to Checkout <ArrowRight size={16}/>
              </Button>
            </Link>

            <Link to="/products" className="block text-center text-sm text-gray-500 hover:text-brand-primary transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
