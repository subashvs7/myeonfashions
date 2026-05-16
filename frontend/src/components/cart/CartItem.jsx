import { Minus, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../stores/cartStore';
import { formatPrice } from '../../utils/formatCurrency';

const IMG_BASE = 'http://localhost:8000/storage/';

export default function CartItem({ item, compact = false }) {
  const { updateItem, removeItem } = useCartStore();
  const image = item.product?.primary_image?.image_path || item.product?.images?.[0]?.image_path;

  return (
    <div className={`flex gap-3 ${compact ? '' : 'py-4 border-b'}`}>
      <Link to={`/products/${item.product?.slug}`} className={`shrink-0 overflow-hidden bg-gray-100 ${compact ? 'w-16 h-20' : 'w-20 h-28'}`}>
        {image
          ? <img src={IMG_BASE + image} alt={item.product?.name} className="w-full h-full object-cover"/>
          : <div className="w-full h-full flex items-center justify-center text-2xl">🥻</div>
        }
      </Link>

      <div className="flex-1 min-w-0">
        <Link to={`/products/${item.product?.slug}`} className="text-sm font-medium line-clamp-2 hover:text-brand-primary transition-colors">
          {item.product?.name}
        </Link>
        {item.variant && (
          <p className="text-xs text-gray-500 mt-0.5">
            {[item.variant.size && `Size: ${item.variant.size}`, item.variant.color && `Color: ${item.variant.color}`].filter(Boolean).join(' | ')}
          </p>
        )}
        <p className="text-sm font-semibold text-brand-primary mt-1">{formatPrice(item.price)}</p>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center border">
            <button onClick={() => updateItem(item.id, item.quantity - 1)} disabled={item.quantity <= 1}
              className="p-1 hover:bg-gray-100 disabled:opacity-40"><Minus size={12}/></button>
            <span className="px-3 text-sm">{item.quantity}</span>
            <button onClick={() => updateItem(item.id, item.quantity + 1)} className="p-1 hover:bg-gray-100"><Plus size={12}/></button>
          </div>
          <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-brand-error transition-colors">
            <Trash2 size={16}/>
          </button>
        </div>
      </div>
    </div>
  );
}
