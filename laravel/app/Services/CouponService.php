<?php
namespace App\Services;

use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Models\Order;
use App\Models\User;

class CouponService
{
    public function validate(string $code, User $user, float $subtotal): Coupon
    {
        $coupon = Coupon::where('code', strtoupper($code))->where('is_active', true)->first();
        if (!$coupon) abort(422, 'Invalid coupon code');
        if ($coupon->expires_at && $coupon->expires_at->isPast()) abort(422, 'Coupon has expired');
        if ($coupon->starts_at && $coupon->starts_at->isFuture()) abort(422, 'Coupon is not yet active');
        if ($coupon->usage_limit && $coupon->used_count >= $coupon->usage_limit) abort(422, 'Coupon usage limit reached');
        if ($subtotal < $coupon->min_order_value) abort(422, "Minimum order ₹{$coupon->min_order_value} required");

        $userUsages = CouponUsage::where('coupon_id', $coupon->id)->where('user_id', $user->id)->count();
        if ($userUsages >= $coupon->usage_per_user) abort(422, 'You have already used this coupon');

        if ($coupon->first_order_only) {
            $hasPaid = Order::where('user_id', $user->id)->where('payment_status', 'paid')->exists();
            if ($hasPaid) abort(422, 'This coupon is for first orders only');
        }
        return $coupon;
    }

    public function calculateDiscount(Coupon $coupon, float $subtotal): float
    {
        $discount = match($coupon->type) {
            'flat'         => (float) $coupon->value,
            'percentage'   => ($subtotal * (float)$coupon->value) / 100,
            'free_shipping' => 0,
            default        => 0,
        };

        if ($coupon->max_discount && $discount > (float)$coupon->max_discount) {
            $discount = (float)$coupon->max_discount;
        }
        return min($discount, $subtotal);
    }

    public function recordUsage(Coupon $coupon, User $user, Order $order, float $discount): void
    {
        CouponUsage::create([
            'coupon_id'       => $coupon->id,
            'user_id'         => $user->id,
            'order_id'        => $order->id,
            'discount_amount' => $discount,
        ]);
        $coupon->increment('used_count');
    }
}
