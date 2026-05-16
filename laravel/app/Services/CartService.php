<?php
namespace App\Services;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\ProductVariant;

class CartService
{
    public function getOrCreateCart($userId = null, $sessionId = null): Cart
    {
        if ($userId) return Cart::firstOrCreate(['user_id' => $userId]);
        return Cart::firstOrCreate(['session_id' => $sessionId]);
    }

    public function addItem(Cart $cart, int $productId, ?int $variantId, int $qty): Cart
    {
        $product = Product::findOrFail($productId);
        $price   = $product->current_price;

        if ($variantId) {
            $variant = ProductVariant::findOrFail($variantId);
            $price   = $variant->sale_price ?? $variant->price;
            if ($variant->stock < $qty) abort(422, 'Insufficient stock');
        }

        $existing = $cart->items()
            ->where('product_id', $productId)
            ->where('variant_id', $variantId)
            ->first();

        if ($existing) {
            $existing->increment('quantity', $qty);
        } else {
            CartItem::create([
                'cart_id'    => $cart->id,
                'product_id' => $productId,
                'variant_id' => $variantId,
                'quantity'   => $qty,
                'price'      => $price,
            ]);
        }
        return $cart->fresh(['items.product.primaryImage', 'items.variant']);
    }

    public function getCartData(Cart $cart): array
    {
        $cart->load('items.product.primaryImage', 'items.product.images', 'items.variant');
        $subtotal = (float)$cart->items->sum(fn($i) => $i->price * $i->quantity);
        return [
            'items'      => $cart->items,
            'subtotal'   => $subtotal,
            'total'      => $subtotal,
            'item_count' => (int)$cart->items->sum('quantity'),
        ];
    }

    public function mergeGuestCart(Cart $guestCart, Cart $userCart): void
    {
        foreach ($guestCart->items as $item) {
            $existing = $userCart->items()
                ->where('product_id', $item->product_id)
                ->where('variant_id', $item->variant_id)
                ->first();

            if ($existing) {
                $existing->increment('quantity', $item->quantity);
            } else {
                $item->update(['cart_id' => $userCart->id]);
            }
        }
        $guestCart->delete();
    }
}
