import { formatPrice } from '../../utils/formatCurrency';
import { useCartStore } from '../../stores/cartStore';

const IMG_BASE = 'http://localhost:8000/storage/';

export default function OrderSummaryPanel({ shippingCharge = 0 }) {
  const { items, subtotal, coupon, discount } = useCartStore();
  const total = subtotal - discount + shippingCharge;

  return (
    <div className="bg-brand-bg border p-5 space-y-4">
      <h3 className="font-heading text-lg font-semibold text-brand-primary">Order Summary</h3>

      <div className="space-y-3 max-h-60 overflow-y-auto">
        {items.map(item => {
          const img = item.product?.primary_image?.image_path;
          return (
            <div key={item.id} className="flex gap-3">
              <div className="w-12 h-16 bg-gray-100 shrink-0 overflow-hidden">
                {img ? <img src={IMG_BASE + img} alt={item.product?.name} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center text-lg">🥻</div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium line-clamp-2">{item.product?.name}</p>
                {item.variant && <p className="text-xs text-gray-400">{item.variant.size} | {item.variant.color}</p>}
                <p className="text-xs font-medium mt-1">{formatPrice(item.price)} × {item.quantity}</p>
              </div>
              <p className="text-xs font-semibold shrink-0">{formatPrice(item.price * item.quantity)}</p>
            </div>
          );
        })}
      </div>

      <div className="border-t pt-4 space-y-2 text-sm">
        <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
        {discount > 0 && <div className="flex justify-between text-brand-success"><span>Discount ({coupon?.code})</span><span>-{formatPrice(discount)}</span></div>}
        <div className="flex justify-between"><span>Shipping</span><span>{shippingCharge > 0 ? formatPrice(shippingCharge) : <span className="text-brand-success">Free</span>}</span></div>
        <div className="flex justify-between font-bold text-base border-t pt-2">
          <span>Total</span><span className="text-brand-primary">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}
