import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { formatPrice } from '../../utils/formatCurrency';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import Badge from '../ui/Badge';
import StarRating from '../ui/StarRating';

const IMG_BASE = 'http://localhost:8000/storage/';

export default function ProductCard({ product, darkMode = false }) {
  const [hovered, setHovered] = useState(false);
  const { addItem } = useCartStore();
  const { toggle, isWishlisted } = useWishlistStore();
  const wishlisted = isWishlisted(product.id);

  const images  = product.images || [];
  const primary = product.primary_image?.image_path || images[0]?.image_path;
  const hover   = images[1]?.image_path;
  const discount = product.discount_percentage || (product.sale_price ? Math.round(((product.base_price - product.sale_price) / product.base_price) * 100) : 0);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.has_variants) addItem(product.id, null, 1);
  };

  return (
    <motion.div
      className={`group relative ${darkMode ? 'bg-white/5 text-white' : 'bg-white'}`}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <Link to={`/products/${product.slug}`}>
        {/* Image */}
        <div className="product-card-image relative overflow-hidden">
          {primary ? (
            <img
              src={IMG_BASE + primary}
              alt={product.name}
              className={`w-full h-full object-cover transition-all duration-500 ${hovered && hover ? 'opacity-0' : 'opacity-100'}`}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-4xl">🥻</div>
          )}

          {hover && (
            <img src={IMG_BASE + hover} alt={product.name}
              className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${hovered ? 'opacity-100' : 'opacity-0'}`} />
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount > 0 && <Badge variant="error">-{discount}%</Badge>}
            {product.is_new_arrival && <Badge variant="success">New</Badge>}
            {product.is_bestseller && <Badge variant="accent">Hot</Badge>}
          </div>

          {/* Actions overlay */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 10 }}
            className="absolute bottom-3 left-0 right-0 px-3 flex gap-2"
          >
            {!product.has_variants && (
              <button onClick={handleQuickAdd}
                className="flex-1 bg-brand-primary text-white py-2 text-xs tracking-wider uppercase flex items-center justify-center gap-1 hover:bg-brand-secondary transition-colors">
                <ShoppingBag size={12}/> Add
              </button>
            )}
            <span className="bg-white text-brand-primary p-2 hover:bg-brand-primary hover:text-white transition-colors cursor-pointer">
              <Eye size={14}/>
            </span>
          </motion.div>
        </div>

        {/* Info */}
        <div className="pt-3 pb-1 px-0.5">
          <p className="text-xs text-gray-400 mb-1">{product.brand}</p>
          <h3 className={`text-sm font-medium leading-tight line-clamp-2 mb-2 ${darkMode ? 'text-white' : 'text-brand-text'}`}>{product.name}</h3>
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${darkMode ? 'text-brand-accent' : 'text-brand-primary'}`}>
              {formatPrice(product.sale_price || product.base_price)}
            </span>
            {product.sale_price && (
              <span className="text-xs text-gray-400 line-through">{formatPrice(product.base_price)}</span>
            )}
          </div>
          {product.avg_rating > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <StarRating rating={product.avg_rating} size={12}/>
              <span className="text-xs text-gray-400">({product.review_count})</span>
            </div>
          )}
        </div>
      </Link>

      {/* Wishlist btn */}
      <button onClick={(e) => { e.preventDefault(); toggle(product.id); }}
        className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white shadow hover:scale-110 transition-transform">
        <Heart size={14} className={wishlisted ? 'fill-brand-error text-brand-error' : 'text-gray-400'} />
      </button>
    </motion.div>
  );
}
