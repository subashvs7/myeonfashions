import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import MobileNav from './MobileNav';
import MobileBottomBar from './MobileBottomBar';

export default function Layout() {
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
    </>
  );
}
