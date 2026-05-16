<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Services\CartService;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(private CartService $cartService) {}

    public function show(Request $request)
    {
        $cart = $this->cartService->getOrCreateCart($request->user()->id);
        return response()->json(['success' => true, 'data' => $this->cartService->getCartData($cart)]);
    }

    public function add(Request $request)
    {
        $data = $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'variant_id' => 'nullable|integer|exists:product_variants,id',
            'quantity'   => 'required|integer|min:1|max:10',
        ]);

        $cart = $this->cartService->getOrCreateCart($request->user()->id);
        $this->cartService->addItem($cart, $data['product_id'], $data['variant_id'] ?? null, $data['quantity']);
        return response()->json(['success' => true, 'data' => $this->cartService->getCartData($cart)]);
    }

    public function update(Request $request, int $id)
    {
        $data = $request->validate(['quantity' => 'required|integer|min:1|max:10']);
        $cart = $this->cartService->getOrCreateCart($request->user()->id);
        $item = CartItem::where('cart_id', $cart->id)->findOrFail($id);
        $item->update(['quantity' => $data['quantity']]);
        return response()->json(['success' => true, 'data' => $this->cartService->getCartData($cart)]);
    }

    public function remove(Request $request, int $id)
    {
        $cart = $this->cartService->getOrCreateCart($request->user()->id);
        CartItem::where('cart_id', $cart->id)->findOrFail($id)->delete();
        return response()->json(['success' => true, 'data' => $this->cartService->getCartData($cart)]);
    }

    public function clear(Request $request)
    {
        $cart = $this->cartService->getOrCreateCart($request->user()->id);
        $cart->items()->delete();
        return response()->json(['success' => true, 'message' => 'Cart cleared']);
    }

    public function guestCart(Request $request)
    {
        $data = $request->validate([
            'session_id' => 'required|string',
            'product_id' => 'required|integer|exists:products,id',
            'variant_id' => 'nullable|integer',
            'quantity'   => 'required|integer|min:1',
        ]);

        $cart = $this->cartService->getOrCreateCart(null, $data['session_id']);
        $this->cartService->addItem($cart, $data['product_id'], $data['variant_id'] ?? null, $data['quantity']);
        return response()->json(['success' => true, 'data' => $this->cartService->getCartData($cart)]);
    }

    public function mergeGuestCart(Request $request)
    {
        $data      = $request->validate(['session_id' => 'required|string']);
        $guestCart = Cart::where('session_id', $data['session_id'])->first();

        if ($guestCart) {
            $userCart = $this->cartService->getOrCreateCart($request->user()->id);
            $this->cartService->mergeGuestCart($guestCart, $userCart);
        }

        $cart = $this->cartService->getOrCreateCart($request->user()->id);
        return response()->json(['success' => true, 'data' => $this->cartService->getCartData($cart)]);
    }
}
