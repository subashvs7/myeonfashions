import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { User, Package, MapPin, RotateCcw, LogOut } from 'lucide-react';

const navLinks = [
  { to: '/account/profile',   icon: User,       label: 'My Profile' },
  { to: '/account/orders',    icon: Package,    label: 'My Orders' },
  { to: '/account/addresses', icon: MapPin,     label: 'Addresses' },
  { to: '/account/returns',   icon: RotateCcw,  label: 'Returns' },
];

export default function AccountLayout() {
  const { user, logout, initialized } = useAuthStore();

  if (!initialized) return null;
  if (!user) return <Navigate to="/login" state={{ from: '/account' }} replace />;

  return (
    <div className="page-container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="border p-5 mb-4">
            <div className="flex items-center gap-3 mb-1">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-12 h-12 object-cover" />
              ) : (
                <div className="w-12 h-12 bg-brand-primary/10 flex items-center justify-center">
                  <User size={20} className="text-brand-primary" />
                </div>
              )}
              <div>
                <p className="font-medium text-sm">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>

          <nav className="border divide-y">
            {navLinks.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 text-sm transition-colors ${isActive ? 'bg-brand-primary text-white' : 'text-gray-700 hover:bg-gray-50'}`
                }>
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
            <button onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors">
              <LogOut size={16} />
              Sign Out
            </button>
          </nav>
        </aside>

        {/* Content */}
        <div className="lg:col-span-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
