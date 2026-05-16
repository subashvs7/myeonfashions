import { useState } from 'react';
import { Tag, X } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { couponsApi } from '../../api/coupons';
import { useCartStore } from '../../stores/cartStore';
import toast from 'react-hot-toast';
import { formatPrice } from '../../utils/formatCurrency';

export default function CouponInput({ subtotal }) {
  const [code, setCode] = useState('');
  const { coupon, discount, applyCoupon, removeCoupon } = useCartStore();

  const { mutate: apply, isPending } = useMutation({
    mutationFn: () => couponsApi.apply(code, subtotal),
    onSuccess: (res) => {
      applyCoupon(res.data.data.coupon, res.data.data.discount);
      toast.success(`Coupon applied! You save ${formatPrice(res.data.data.discount)}`);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Invalid coupon'),
  });

  if (coupon) {
    return (
      <div className="flex items-center justify-between bg-brand-success/10 border border-brand-success px-3 py-2">
        <div className="flex items-center gap-2">
          <Tag size={14} className="text-brand-success"/>
          <span className="text-sm font-medium text-brand-success">{coupon.code}</span>
          <span className="text-xs text-gray-500">-{formatPrice(discount)}</span>
        </div>
        <button onClick={removeCoupon} className="text-gray-400 hover:text-brand-error"><X size={16}/></button>
      </div>
    );
  }

  return (
    <div className="flex gap-0">
      <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="Enter coupon code" className="flex-1 border px-3 py-2 text-sm outline-none focus:border-brand-primary uppercase" />
      <button onClick={() => code && apply()} disabled={!code || isPending}
        className="bg-brand-primary text-white px-4 py-2 text-sm disabled:opacity-50 hover:bg-brand-secondary transition-colors">
        {isPending ? '...' : 'Apply'}
      </button>
    </div>
  );
}
