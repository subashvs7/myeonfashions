import Modal from '../ui/Modal';
import { formatPrice } from '../../utils/formatCurrency';
import Button from '../ui/Button';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../stores/cartStore';
import { useState } from 'react';

const IMG_BASE = 'http://localhost:8000/storage/';

export default function QuickViewModal({ product, isOpen, onClose }) {
  const { addItem } = useCartStore();
  const [adding, setAdding] = useState(false);

  if (!product) return null;
  const image = product.primary_image?.image_path || product.images?.[0]?.image_path;

  const handleAdd = async () => {
    setAdding(true);
    await addItem(product.id, null, 1);
    setAdding(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="aspect-[3/4] bg-gray-50 overflow-hidden">
          {image ? <img src={IMG_BASE + image} alt={product.name} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-6xl">🥻</div>}
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">{product.brand}</p>
            <h3 className="font-heading text-2xl font-semibold text-brand-primary">{product.name}</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-brand-primary">{formatPrice(product.sale_price || product.base_price)}</span>
            {product.sale_price && <span className="text-sm text-gray-400 line-through">{formatPrice(product.base_price)}</span>}
          </div>
          {product.short_description && <p className="text-sm text-gray-600 leading-relaxed">{product.short_description}</p>}
          <div className="flex gap-3 pt-2">
            {!product.has_variants && <Button onClick={handleAdd} loading={adding} className="flex-1">Add to Bag</Button>}
            <Link to={`/products/${product.slug}`} onClick={onClose}><Button variant="outline">View Details</Button></Link>
          </div>
        </div>
      </div>
    </Modal>
  );
}
