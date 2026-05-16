<?php
namespace App\Services;

use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Address;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class OrderService
{
    public function __construct(
        private CouponService $couponService,
        private ShippingService $shippingService
    ) {}

    public function createOrder(array $data, User $user): Order
    {
        return DB::transaction(function () use ($data, $user) {
            $cart = Cart::with('items.product', 'items.variant')
                        ->where('user_id', $user->id)->firstOrFail();

            if ($cart->items->isEmpty()) abort(422, 'Cart is empty');

            $address  = Address::where('user_id', $user->id)->findOrFail($data['address_id']);
            $subtotal = (float)$cart->items->sum(fn($i) => $i->price * $i->quantity);
            $discount = 0;
            $coupon   = null;

            if (!empty($data['coupon_code'])) {
                $coupon   = $this->couponService->validate($data['coupon_code'], $user, $subtotal);
                $discount = $this->couponService->calculateDiscount($coupon, $subtotal);
            }

            $afterDiscount  = $subtotal - $discount;
            $shippingCharge = $this->shippingService->calculate($address->pincode, $afterDiscount);
            $total          = $afterDiscount + $shippingCharge;

            $order = Order::create([
                'order_number'     => 'DF' . date('Ymd') . strtoupper(substr(uniqid(), -6)),
                'user_id'          => $user->id,
                'subtotal'         => $subtotal,
                'discount'         => $discount,
                'shipping_charge'  => $shippingCharge,
                'total'            => $total,
                'coupon_code'      => $coupon?->code,
                'address_id'       => $address->id,
                'shipping_address' => $address->toArray(),
                'payment_method'   => $data['payment_method'],
                'status'           => 'pending',
                'payment_status'   => 'pending',
            ]);

            foreach ($cart->items as $item) {
                OrderItem::create([
                    'order_id'     => $order->id,
                    'product_id'   => $item->product_id,
                    'variant_id'   => $item->variant_id,
                    'product_name' => $item->product->name,
                    'variant_info' => $item->variant
                        ? implode(' | ', array_filter([
                            $item->variant->size  ? 'Size: '  . $item->variant->size  : null,
                            $item->variant->color ? 'Color: ' . $item->variant->color : null,
                          ]))
                        : null,
                    'product_image' => $item->product->primaryImage?->image_path,
                    'quantity'      => $item->quantity,
                    'price'         => $item->price,
                    'cost_price'    => $item->product->cost_price ?? null,
                    'total'         => $item->price * $item->quantity,
                ]);

                if ($item->variant_id) {
                    ProductVariant::where('id', $item->variant_id)->decrement('stock', $item->quantity);
                }
                Product::where('id', $item->product_id)
                    ->decrement('total_stock', $item->quantity);
                Product::where('id', $item->product_id)
                    ->increment('sold_count', $item->quantity);
            }

            if ($coupon) {
                $this->couponService->recordUsage($coupon, $user, $order, $discount);
            }

            $cart->items()->delete();
            return $order->fresh(['items', 'payment']);
        });
    }
}
