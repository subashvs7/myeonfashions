import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUiStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '../../api/categories';
import { configApi } from '../../api/config';

export default function MobileNav() {
  const { mobileMenuOpen, closeMobileMenu } = useUiStore();
  const { isAuthenticated, user } = useAuthStore();
  const [openCats, setOpenCats] = useState({});

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll().then(r => r.data.data),
  });

  const { data: siteConfig } = useQuery({
    queryKey: ['public-config'],
    queryFn: () => configApi.get().then(r => r.data.data),
    staleTime: 5 * 60 * 1000,
  });
  const appName = siteConfig?.['app.name'] || 'Myeon Casuals';

  const toggleCat = (id) => setOpenCats(s => ({ ...s, [id]: !s[id] }));

  return (
    <AnimatePresence>
      {mobileMenuOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 md:hidden" onClick={closeMobileMenu} />
          <motion.aside
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed left-0 top-0 h-full w-72 bg-white z-50 flex flex-col overflow-y-auto"
          >
            <div className="flex items-center justify-between p-5 bg-brand-primary text-white">
              <h2 className="font-heading text-xl font-bold">{appName}</h2>
              <button onClick={closeMobileMenu}><X size={22}/></button>
            </div>

            {isAuthenticated && (
              <div className="px-5 py-4 bg-brand-bg border-b">
                <p className="font-medium text-sm">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            )}

            <nav className="flex-1 py-4">
              <p className="px-5 py-2 text-xs text-gray-400 uppercase tracking-wider">Categories</p>
              {categories?.map((cat) => (
                <div key={cat.id}>
                  <div className="flex items-center">
                    <Link to={`/categories/${cat.slug}`} onClick={closeMobileMenu}
                      className="flex-1 px-5 py-3 text-sm font-medium hover:bg-brand-bg hover:text-brand-primary transition-colors">
                      {cat.name}
                    </Link>
                    {cat.children?.length > 0 && (
                      <button onClick={() => toggleCat(cat.id)}
                        className="px-3 py-3 text-gray-400 hover:text-brand-primary transition-colors">
                        {openCats[cat.id] ? <ChevronDown size={15}/> : <ChevronRight size={15}/>}
                      </button>
                    )}
                  </div>

                  {openCats[cat.id] && cat.children?.map((child) => (
                    <div key={child.id}>
                      <div className="flex items-center bg-gray-50">
                        <Link to={`/categories/${child.slug}`} onClick={closeMobileMenu}
                          className="flex-1 pl-9 pr-3 py-2.5 text-sm text-gray-700 hover:bg-brand-bg hover:text-brand-primary transition-colors">
                          └ {child.name}
                        </Link>
                        {child.children?.length > 0 && (
                          <button onClick={() => toggleCat(child.id)}
                            className="px-3 py-2.5 text-gray-400 hover:text-brand-primary transition-colors">
                            {openCats[child.id] ? <ChevronDown size={13}/> : <ChevronRight size={13}/>}
                          </button>
                        )}
                      </div>

                      {openCats[child.id] && child.children?.map((sub) => (
                        <Link key={sub.id} to={`/categories/${sub.slug}`} onClick={closeMobileMenu}
                          className="block pl-14 pr-3 py-2 text-xs text-gray-500 bg-gray-100 hover:bg-brand-bg hover:text-brand-primary transition-colors">
                          └ {sub.name}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              ))}

              <div className="mt-4 border-t pt-4">
                {isAuthenticated ? (
                  <>
                    <Link to="/account/orders" onClick={closeMobileMenu} className="block px-5 py-3 text-sm hover:bg-brand-bg">My Orders</Link>
                    <Link to="/wishlist" onClick={closeMobileMenu} className="block px-5 py-3 text-sm hover:bg-brand-bg">Wishlist</Link>
                    <Link to="/account/profile" onClick={closeMobileMenu} className="block px-5 py-3 text-sm hover:bg-brand-bg">Profile</Link>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={closeMobileMenu} className="block px-5 py-3 text-sm hover:bg-brand-bg">Login</Link>
                    <Link to="/register" onClick={closeMobileMenu} className="block px-5 py-3 text-sm hover:bg-brand-bg">Register</Link>
                  </>
                )}
              </div>
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
