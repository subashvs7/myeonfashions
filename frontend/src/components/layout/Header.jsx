import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown, ChevronRight, Bell, Smartphone, Download } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { useUiStore } from '../../stores/uiStore';
import { useScrollPosition } from '../../hooks/useScrollPosition';
import SearchBar from './SearchBar';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '../../api/categories';
import { usePWA } from '../../contexts/PWAContext';

export default function Header() {
  const scrollY   = useScrollPosition();
  const isScrolled = scrollY > 60;
  const { isAuthenticated, user, logout } = useAuthStore();
  const { itemCount, openCart } = useCartStore();
  const { openSearch, openMobileMenu } = useUiStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [iosModalOpen, setIosModalOpen] = useState(false);
  const navigate = useNavigate();
  const { canInstall, isIOS, isInstalled, install } = usePWA();

  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll().then(r => r.data.data),
  });

  const { data: configData } = useQuery({
    queryKey: ['public-config'],
    queryFn: () => import('../../api/config').then(m => m.configApi.get()).then(r => r.data.data),
    staleTime: 2 * 60 * 1000,
  });

  const announcementEnabled = configData?.announcement_bar_enabled ?? true;
  const announcementText    = configData?.announcement_bar_text    || 'FREE SHIPPING ON ORDERS ABOVE ₹999 | USE CODE WELCOME10 FOR 10% OFF';
  const announcementColor   = configData?.announcement_bar_color   || 'bg-brand-primary';
  const announcementLink    = configData?.announcement_bar_link    || null;
  const announcementLinkTxt = configData?.announcement_bar_link_text || null;

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      <motion.header
        className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-brand-bg'}`}
      >
        {/* Top bar */}
        {announcementEnabled && (
        <div className={`${announcementColor} text-white text-xs py-2`}>
          <div className="page-container flex items-center justify-between">
            <span className="hidden sm:block w-40" />
            <span className="tracking-widest text-center">
              {announcementLink ? (
                <a href={announcementLink} className="hover:underline">
                  {announcementText}
                  {announcementLinkTxt && <strong className="ml-2">{announcementLinkTxt}</strong>}
                </a>
              ) : (
                announcementText
              )}
            </span>
            <div className="hidden sm:flex items-center gap-2 w-40 justify-end relative">
              <Smartphone size={12} className="opacity-60 flex-shrink-0" />
              <span className="opacity-60 flex-shrink-0 text-xs">Get App:</span>

              {/* Android: triggers PWA install prompt */}
              <button
                onClick={() => { if (canInstall) install(); }}
                title={canInstall
                  ? 'Tap to install the app on your device'
                  : isInstalled
                    ? 'App already installed'
                    : 'Open this site in Chrome on Android to install'}
                className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 transition-colors flex-shrink-0
                  ${canInstall
                    ? 'bg-brand-accent text-white hover:bg-amber-400 cursor-pointer'
                    : 'border border-white/40 text-white/60 cursor-default'}`}>
                <Download size={10} />
                {isInstalled ? 'Installed' : 'Android'}
              </button>

              {/* iOS: opens step-by-step instruction panel */}
              <button
                onClick={() => setIosModalOpen(o => !o)}
                className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 border border-white/40
                           text-white/70 hover:border-white hover:text-white transition-colors flex-shrink-0">
                iOS
              </button>

              {/* iOS instruction popover */}
              <AnimatePresence>
                {iosModalOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIosModalOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                      className="absolute top-full right-0 mt-2 w-64 bg-white text-brand-text shadow-2xl border z-50 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-sm text-brand-primary">Install on iPhone / iPad</span>
                      <button onClick={() => setIosModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={14} />
                      </button>
                    </div>
                    <ol className="space-y-2.5 text-xs text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-5 h-5 bg-brand-primary text-white text-xs flex items-center justify-center font-bold">1</span>
                        <span>Open this page in <strong>Safari</strong> browser</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-5 h-5 bg-brand-primary text-white text-xs flex items-center justify-center font-bold">2</span>
                        <span>Tap the <strong>Share</strong> icon <span className="inline-block border border-gray-300 px-1 rounded text-[10px]">⎋</span> at the bottom of Safari</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-5 h-5 bg-brand-primary text-white text-xs flex items-center justify-center font-bold">3</span>
                        <span>Scroll down and tap <strong>"Add to Home Screen"</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-5 h-5 bg-brand-primary text-white text-xs flex items-center justify-center font-bold">4</span>
                        <span>Tap <strong>"Add"</strong> — done! The app icon appears on your home screen</span>
                      </li>
                    </ol>
                    <div className="mt-3 pt-3 border-t text-center">
                      <span className="text-[10px] text-gray-400">Works on iPhone 12+ and all iPad models</span>
                    </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        )}

        {/* Main header */}
        <div className="page-container">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Mobile menu */}
            <button className="md:hidden p-2" onClick={openMobileMenu}><Menu size={22}/></button>

            {/* Logo */}
            <Link to="/" className="font-heading text-2xl md:text-3xl font-bold text-brand-primary tracking-tight">
              Myeon Casuals <span className="text-brand-accent">Fashion</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
              {catData?.slice(0, 6).map((cat) => (
                <div key={cat.id} className="relative group">
                  <Link to={`/categories/${cat.slug}`} className="text-sm font-medium tracking-wide hover:text-brand-secondary transition-colors flex items-center gap-1">
                    {cat.name} {cat.children?.length > 0 && <ChevronDown size={14}/>}
                  </Link>
                  {cat.children?.length > 0 && (
                    <div className="absolute top-full left-0 bg-white border shadow-lg min-w-[200px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      {cat.children.map((child) => (
                        <div key={child.id} className="relative group/sub">
                          <Link
                            to={`/categories/${child.slug}`}
                            className="flex items-center justify-between px-4 py-2.5 text-sm font-medium hover:bg-brand-bg hover:text-brand-primary transition-colors border-b border-gray-50"
                          >
                            {child.name}
                            {child.children?.length > 0 && (
                              <ChevronRight size={14} className="text-gray-400 flex-shrink-0 ml-2" />
                            )}
                          </Link>
                          {child.children?.length > 0 && (
                            <div className="absolute left-full top-0 bg-white border shadow-lg min-w-[180px] opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200 z-50">
                              {child.children.map((sub) => (
                                <Link
                                  key={sub.id}
                                  to={`/categories/${sub.slug}`}
                                  className="block px-4 py-2.5 text-sm hover:bg-brand-bg hover:text-brand-primary transition-colors border-b border-gray-50"
                                >
                                  {sub.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              <button onClick={openSearch} className="p-2 hover:text-brand-secondary transition-colors"><Search size={20}/></button>

              {isAuthenticated && (
                <Link to="/wishlist" className="p-2 hover:text-brand-secondary transition-colors hidden sm:block"><Heart size={20}/></Link>
              )}

              <button onClick={openCart} className="p-2 hover:text-brand-secondary transition-colors relative">
                <ShoppingBag size={20}/>
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-accent text-white text-xs w-5 h-5 flex items-center justify-center font-bold">
                    {itemCount}
                  </span>
                )}
              </button>

              {isAuthenticated ? (
                <div className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 p-2">
                    {user?.avatar
                      ? <img src={`${(import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '')}/storage/${user.avatar}`} className="w-7 h-7 rounded-full object-cover" alt={user.name} />
                      : <User size={20} />
                    }
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                        className="absolute right-0 top-full bg-white border shadow-lg min-w-[180px] z-50"
                      >
                        <div className="px-4 py-3 border-b">
                          <p className="text-sm font-medium">{user?.name}</p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>
                        {[
                          { to: '/account/orders', label: 'My Orders' },
                          { to: '/account/profile', label: 'My Profile' },
                          { to: '/account/addresses', label: 'My Addresses' },
                          { to: '/wishlist', label: 'Wishlist' },
                        ].map(item => (
                          <Link key={item.to} to={item.to} onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm hover:bg-brand-bg transition-colors">
                            {item.label}
                          </Link>
                        ))}
                        {user?.role === 'admin' && (
                          <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2.5 text-sm text-brand-secondary hover:bg-brand-bg border-t">
                            Admin Panel
                          </Link>
                        )}
                        <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 text-sm text-brand-error hover:bg-brand-bg border-t transition-colors">
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link to="/login" className="hidden sm:flex items-center gap-1 text-sm font-medium hover:text-brand-secondary transition-colors">
                  <User size={20}/> Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.header>
      <SearchBar />
    </>
  );
}
