import { NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  LayoutDashboard, Package, Grid, ShoppingBag, Users,
  Tag, BarChart2, Truck, RotateCcw, Image, Warehouse,
  LogOut, ChevronRight, Settings, Star, Bell,
  Zap, Sparkles, Menu, Link, LayoutTemplate,
} from 'lucide-react';
import { useState } from 'react';

const NAV_GROUPS = [
  {
    label: 'Main',
    items: [
      { to: '/admin',           icon: LayoutDashboard, label: 'Dashboard', end: true },
    ],
  },
  {
    label: 'Catalog',
    items: [
      { to: '/admin/products',   icon: Package,   label: 'Products' },
      { to: '/admin/categories', icon: Grid,      label: 'Categories' },
      { to: '/admin/inventory',  icon: Warehouse, label: 'Inventory' },
    ],
  },
  {
    label: 'Sales',
    items: [
      { to: '/admin/orders',    icon: ShoppingBag, label: 'Orders' },
      { to: '/admin/customers', icon: Users,       label: 'Customers' },
      { to: '/admin/returns',   icon: RotateCcw,   label: 'Returns' },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { to: '/admin/flash-sales',  icon: Zap,      label: 'Flash Sales' },
      { to: '/admin/new-arrivals', icon: Sparkles,  label: 'New Arrivals' },
      { to: '/admin/coupons',      icon: Tag,       label: 'Coupons' },
      { to: '/admin/banners',      icon: Image,     label: 'Banners' },
      { to: '/admin/reviews',      icon: Star,      label: 'Reviews' },
      { to: '/admin/reports',      icon: BarChart2, label: 'Reports' },
    ],
  },
  {
    label: 'Configuration',
    items: [
      { to: '/admin/header-manager', icon: LayoutTemplate, label: 'Header' },
      { to: '/admin/menu-manager',   icon: Menu,           label: 'Menu' },
      { to: '/admin/footer-manager', icon: Link,           label: 'Footer' },
      { to: '/admin/shipping',       icon: Truck,          label: 'Shipping' },
      { to: '/admin/settings',       icon: Settings,       label: 'Settings' },
    ],
  },
];

function NavItem({ to, icon: Icon, label, end, collapsed }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2 text-sm rounded-sm mx-1 transition-colors ${
          isActive
            ? 'bg-white/20 text-white font-medium'
            : 'text-white/75 hover:bg-white/10 hover:text-white'
        }`
      }
    >
      <Icon size={16} className="flex-shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}

export default function AdminLayout() {
  const { user, logout, initialized } = useAuthStore();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  if (!initialized) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'A';

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`bg-brand-primary text-white flex flex-col flex-shrink-0 transition-all duration-200 ${
          collapsed ? 'w-14' : 'w-56'
        }`}
      >
        {/* Logo / Brand */}
        <div className={`flex items-center border-b border-white/10 h-14 flex-shrink-0 ${collapsed ? 'justify-center px-0' : 'px-4 gap-2'}`}>
          {!collapsed && (
            <span className="font-heading font-bold text-sm tracking-wide flex-1 truncate">
              Myeon Casuals Admin
            </span>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="text-white/60 hover:text-white transition-colors"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            <ChevronRight size={16} className={`transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
          {NAV_GROUPS.map(group => (
            <div key={group.label} className="mb-3">
              {!collapsed && (
                <p className="px-5 pb-1 text-[10px] font-semibold uppercase tracking-widest text-white/35">
                  {group.label}
                </p>
              )}
              {group.items.map(item => (
                <NavItem key={item.to} {...item} collapsed={collapsed} />
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/10 p-3 space-y-1 flex-shrink-0">
          {!collapsed && (
            <div className="flex items-center gap-2 px-1 mb-2">
              <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-white truncate">{user.name}</p>
                <p className="text-[10px] text-white/50 truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 text-white/60 hover:text-white text-sm transition-colors w-full px-1 py-1"
          >
            <LogOut size={15} className="flex-shrink-0" />
            {!collapsed && 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b h-14 px-6 flex items-center justify-between flex-shrink-0">
          <div />
          <div className="flex items-center gap-4">
            <button className="relative text-gray-400 hover:text-gray-600 transition-colors">
              <Bell size={18} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-xs font-bold">
                {initials}
              </div>
              <span className="text-sm font-medium text-gray-700">{user.name}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
