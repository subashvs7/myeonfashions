import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import MobileNav from './MobileNav';
import MobileBottomBar from './MobileBottomBar';
import PWAInstallPrompt from '../PWAInstallPrompt';
import { configApi } from '../../api/config';

const STORAGE_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace('/api', '');

export default function Layout() {
  const { data: cfg } = useQuery({
    queryKey: ['public-config'],
    queryFn: () => configApi.get().then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

  // Apply favicon from admin settings dynamically
  useEffect(() => {
    if (!cfg?.['app.favicon']) return;
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = `${STORAGE_BASE}/storage/${cfg['app.favicon']}`;
  }, [cfg?.['app.favicon']]);

  return (
    <>
      <Header />
      <MobileNav />
      <CartDrawer />
      <main>
        <Outlet />
      </main>
      <MobileBottomBar />
      <Footer />
      <PWAInstallPrompt />
    </>
  );
}
