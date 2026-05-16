import { formatPrice } from '../../utils/formatCurrency';

export default function FreeShippingBar({ subtotal, threshold = 999 }) {
  const remaining = threshold - subtotal;
  const pct       = Math.min((subtotal / threshold) * 100, 100);

  if (subtotal >= threshold) {
    return <p className="text-xs text-brand-success font-medium text-center py-2">🎉 You've unlocked free shipping!</p>;
  }
  return (
    <div className="text-xs text-center py-2 space-y-1.5">
      <p className="text-gray-600">Add <strong>{formatPrice(remaining)}</strong> more for free shipping</p>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-brand-success rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
