import { Link, useLocation } from 'react-router-dom';
import { Home, Grid, Heart, ShoppingBag, User } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';

export default function MobileBottomBar() {
  const { pathname } = useLocation();
  const { itemCount, openCart } = useCartStore();

  const links = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/categories/sarees', label: 'Shop', icon: Grid },
    { to: '/wishlist', label: 'Wishlist', icon: Heart },
    { to: '/account/orders', label: 'Orders', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-30 md:hidden">
      <div className="flex items-center">
        {links.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs transition-colors ${pathname === to ? 'text-brand-primary' : 'text-gray-500'}`}>
            <Icon size={20}/>
            {label}
          </Link>
        ))}
        <button onClick={openCart} className="flex-1 flex flex-col items-center gap-0.5 py-2 text-xs text-gray-500 relative">
          <div className="relative">
            <ShoppingBag size={20}/>
            {itemCount > 0 && <span className="absolute -top-2 -right-2 bg-brand-accent text-white text-xs w-4 h-4 flex items-center justify-center">{itemCount}</span>}
          </div>
          Bag
        </button>
      </div>
    </nav>
  );
}
