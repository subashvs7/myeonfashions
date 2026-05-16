import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../stores/cartStore';
import { useAuthStore } from '../../stores/authStore';
import { formatPrice } from '../../utils/formatCurrency';
import CartItem from '../cart/CartItem';
import Button from '../ui/Button';
import EmptyState from '../ui/EmptyState';

export default function CartDrawer() {
  const { isOpen, closeCart, items, subtotal, itemCount, fetchCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Only fetch when drawer opens with no items — addItem already sets cart with fresh data
    if (isOpen && isAuthenticated && items.length === 0) fetchCart();
  }, [isOpen, isAuthenticated]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50" onClick={closeCart} />
          <motion.aside
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="font-heading text-xl font-semibold text-brand-primary">
                Your Bag ({itemCount})
              </h2>
              <button onClick={closeCart} className="p-1 hover:text-brand-error"><X size={22}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {items.length === 0 ? (
                <EmptyState icon={ShoppingBag} title="Your bag is empty" description="Add items to continue shopping" />
              ) : (
                items.map((item) => <CartItem key={item.id} item={item} compact />)
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t p-5 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <p className="text-xs text-gray-400">Shipping & taxes calculated at checkout</p>
                <Link to="/cart" onClick={closeCart}>
                  <Button className="w-full">View Cart</Button>
                </Link>
                <Link to="/checkout" onClick={closeCart}>
                  <Button variant="accent" className="w-full mt-2">Checkout</Button>
                </Link>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
