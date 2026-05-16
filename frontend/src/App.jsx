import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { useCartStore } from './stores/cartStore';
import Layout from './components/layout/Layout';
import AdminLayout from './pages/admin/AdminLayout';
import AccountLayout from './pages/account/AccountLayout';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { PWAProvider } from './contexts/PWAContext';

// Public pages
const Home = lazy(() => import('./pages/Home'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const CartPage = lazy(() => import('./pages/CartPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Auth pages
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));

// Account pages
const MyProfile = lazy(() => import('./pages/account/MyProfile'));
const MyOrders = lazy(() => import('./pages/account/MyOrders'));
const OrderDetail = lazy(() => import('./pages/account/OrderDetail'));
const MyAddresses = lazy(() => import('./pages/account/MyAddresses'));
const MyReturns = lazy(() => import('./pages/account/MyReturns'));

// Admin pages
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const AddProduct = lazy(() => import('./pages/admin/AddProduct'));
const EditProduct = lazy(() => import('./pages/admin/EditProduct'));
const AdminCategories = lazy(() => import('./pages/admin/Categories'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminOrderDetail = lazy(() => import('./pages/admin/AdminOrderDetail'));
const AdminCustomers = lazy(() => import('./pages/admin/Customers'));
const AdminCustomerDetail = lazy(() => import('./pages/admin/CustomerDetail'));
const AdminCoupons = lazy(() => import('./pages/admin/Coupons'));
const AdminInventory = lazy(() => import('./pages/admin/Inventory'));
const AdminShipping = lazy(() => import('./pages/admin/Shipping'));
const AdminReturns = lazy(() => import('./pages/admin/Returns'));
const AdminBanners = lazy(() => import('./pages/admin/Banners'));
const AdminReports = lazy(() => import('./pages/admin/Reports'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const AdminReviews    = lazy(() => import('./pages/admin/Reviews'));
const AdminFlashSales = lazy(() => import('./pages/admin/FlashSales'));
const AdminNewArrivals = lazy(() => import('./pages/admin/NewArrivals'));
const AdminMenuManager = lazy(() => import('./pages/admin/MenuManager'));
const AdminFooterManager = lazy(() => import('./pages/admin/FooterManager'));
const AdminHeaderManager = lazy(() => import('./pages/admin/HeaderManager'));

const Fallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

export default function App() {
  const { init, initialized } = useAuthStore();

  useEffect(() => {
    init().then(() => {
      if (useAuthStore.getState().isAuthenticated) {
        useCartStore.getState().fetchCart();
      }
    });
  }, []);

  if (!initialized) return <Fallback />;

  return (
    <PWAProvider>
    <BrowserRouter>
      <Suspense fallback={<Fallback />}>
        <Routes>
          {/* Storefront */}
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="categories/:slug" element={<CategoryPage />} />
            <Route path="products" element={<CategoryPage />} />
            <Route path="products/:slug" element={<ProductDetail />} />
            <Route path="cart" element={<CartPage />} />
            <Route path="wishlist" element={<WishlistPage />} />
            <Route path="search" element={<SearchResults />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="order-success/:id" element={<OrderSuccess />} />

            {/* Auth */}
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="forgot-password" element={<ForgotPassword />} />

            {/* Account (protected via AccountLayout) */}
            <Route path="account" element={<AccountLayout />}>
              <Route index element={<MyProfile />} />
              <Route path="profile" element={<MyProfile />} />
              <Route path="orders" element={<MyOrders />} />
              <Route path="orders/:id" element={<OrderDetail />} />
              <Route path="addresses" element={<MyAddresses />} />
              <Route path="returns" element={<MyReturns />} />
            </Route>
          </Route>

          {/* Admin (standalone layout, no storefront chrome) */}
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/new" element={<AddProduct />} />
            <Route path="products/:id/edit" element={<EditProduct />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:id" element={<AdminOrderDetail />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="customers/:id" element={<AdminCustomerDetail />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="shipping" element={<AdminShipping />} />
            <Route path="returns" element={<AdminReturns />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="reviews" element={<AdminReviews />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="flash-sales"    element={<AdminFlashSales />} />
            <Route path="new-arrivals"   element={<AdminNewArrivals />} />
            <Route path="menu-manager"   element={<AdminMenuManager />} />
            <Route path="footer-manager" element={<AdminFooterManager />} />
            <Route path="header-manager" element={<AdminHeaderManager />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
    </PWAProvider>
  );
}
