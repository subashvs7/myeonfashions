import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Ruler, Share2, ShieldCheck, RotateCcw, Truck } from 'lucide-react';
import { productsApi } from '../api/products';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { formatPrice } from '../utils/formatCurrency';
import ProductGallery from '../components/product/ProductGallery';
import VariantSelector from '../components/product/VariantSelector';
import PincodeChecker from '../components/product/PincodeChecker';
import ReviewSummary from '../components/product/ReviewSummary';
import ReviewList from '../components/product/ReviewList';
import ReviewForm from '../components/product/ReviewForm';
import SizeChart from '../components/product/SizeChart';
import ProductGrid from '../components/product/ProductGrid';
import Breadcrumb from '../components/ui/Breadcrumb';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function ProductDetail() {
  const { slug } = useParams();
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [qty, setQty]                         = useState(1);
  const [sizeChartOpen, setSizeChartOpen]     = useState(false);
  const [adding, setAdding]                   = useState(false);
  const { addItem } = useCartStore();
  const { toggle, isWishlisted } = useWishlistStore();
  const [, setViewed] = useLocalStorage('recently_viewed', []);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productsApi.getOne(slug).then(r => r.data.data),
  });

  const { data: related } = useQuery({
    queryKey: ['related', product?.id],
    queryFn: () => productsApi.getRelated(product.id).then(r => r.data.data),
    enabled: !!product?.id,
  });

  useEffect(() => {
    if (product) {
      setViewed(prev => {
        const filtered = prev.filter(p => p.id !== product.id);
        return [product, ...filtered].slice(0, 10);
      });
    }
  }, [product, setViewed]);

  if (isLoading) return <div className="flex justify-center py-24"><LoadingSpinner size="lg"/></div>;
  if (!product) return null;

  const currentPrice   = selectedVariant ? (selectedVariant.sale_price || selectedVariant.price) : (product.sale_price || product.base_price);
  const originalPrice  = selectedVariant ? selectedVariant.price : product.base_price;
  const hasDiscount    = currentPrice < originalPrice;
  const discountPct    = hasDiscount ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;
  const inStock        = selectedVariant ? selectedVariant.stock > 0 : product.total_stock > 0;

  const handleAddToCart = async () => {
    if (product.has_variants && !selectedVariant) { return; }
    setAdding(true);
    await addItem(product.id, selectedVariant?.id || null, qty);
    setAdding(false);
  };

  return (
    <div className="page-container py-8">
      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: product.category?.name, href: `/categories/${product.category?.slug}` },
        { label: product.name },
      ]} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-6">
        {/* Gallery */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <ProductGallery images={product.images} />
        </motion.div>

        {/* Info */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{product.brand}</p>
            <h1 className="font-heading text-3xl font-semibold text-brand-primary leading-tight">{product.name}</h1>
            <ReviewSummary avgRating={product.avg_rating} reviewCount={product.review_count} />
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="font-heading text-3xl font-bold text-brand-primary">{formatPrice(currentPrice)}</span>
            {hasDiscount && (
              <>
                <span className="text-lg text-gray-400 line-through">{formatPrice(originalPrice)}</span>
                <Badge variant="error">-{discountPct}%</Badge>
              </>
            )}
          </div>

          {product.short_description && <p className="text-sm text-gray-600 leading-relaxed">{product.short_description}</p>}

          {/* Variants */}
          {product.has_variants && product.variants?.length > 0 && (
            <VariantSelector variants={product.variants} selectedVariant={selectedVariant} onSelect={setSelectedVariant} />
          )}

          {/* Qty + actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center border">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-gray-100">−</button>
              <span className="px-4 py-2 text-sm font-medium">{qty}</span>
              <button onClick={() => setQty(q => Math.min(10, q + 1))} className="px-3 py-2 hover:bg-gray-100">+</button>
            </div>
            <Button onClick={handleAddToCart} loading={adding} disabled={!inStock || (product.has_variants && !selectedVariant)} className="flex-1 flex items-center gap-2">
              <ShoppingBag size={16}/> {inStock ? 'Add to Bag' : 'Out of Stock'}
            </Button>
            <button onClick={() => toggle(product.id)} className="border p-2.5 hover:bg-brand-error hover:text-white hover:border-brand-error transition-colors">
              <Heart size={18} className={isWishlisted(product.id) ? 'fill-brand-error text-brand-error' : ''} />
            </button>
          </div>

          {product.has_variants && !selectedVariant && (
            <p className="text-xs text-brand-error">Please select size and color</p>
          )}

          {/* Size chart */}
          <button onClick={() => setSizeChartOpen(true)} className="flex items-center gap-1 text-xs text-brand-secondary underline">
            <Ruler size={12}/> View Size Guide
          </button>

          {/* Features */}
          <div className="grid grid-cols-3 gap-3 py-4 border-t border-b">
            {[{ icon: ShieldCheck, text: 'Authentic' }, { icon: RotateCcw, text: '15-Day Return' }, { icon: Truck, text: 'Free Ship >₹999' }].map(({ icon: Icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-1 text-center">
                <Icon size={20} className="text-brand-primary" />
                <span className="text-xs text-gray-600">{text}</span>
              </div>
            ))}
          </div>

          {/* Product details */}
          <div className="space-y-2 text-sm">
            {product.fabric && <div className="flex gap-3"><span className="text-gray-400 w-28">Fabric</span><span>{product.fabric}</span></div>}
            {product.care_instructions && <div className="flex gap-3"><span className="text-gray-400 w-28">Care</span><span>{product.care_instructions}</span></div>}
            {product.country_of_origin && <div className="flex gap-3"><span className="text-gray-400 w-28">Origin</span><span>{product.country_of_origin}</span></div>}
            {product.sku && <div className="flex gap-3"><span className="text-gray-400 w-28">SKU</span><span className="text-gray-500">{product.sku}</span></div>}
          </div>

          <PincodeChecker />
        </motion.div>
      </div>

      {/* Description & Reviews */}
      <div className="mt-16 space-y-12">
        {product.description && (
          <section>
            <h2 className="section-heading mb-4">Product Description</h2>
            <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: product.description }} />
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-heading">Customer Reviews</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2"><ReviewList productId={product.id} /></div>
            <div><ReviewForm productId={product.id} /></div>
          </div>
        </section>
      </div>

      {/* Related */}
      {related?.length > 0 && (
        <section className="mt-16">
          <h2 className="section-heading mb-6">You Might Also Like</h2>
          <ProductGrid products={related} />
        </section>
      )}

      <SizeChart isOpen={sizeChartOpen} onClose={() => setSizeChartOpen(false)} />
    </div>
  );
}
