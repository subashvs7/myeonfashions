<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request)
    {
        $items = Wishlist::with('product.primaryImage')
            ->where('user_id', $request->user()->id)
            ->latest()->get();
        return response()->json(['success' => true, 'data' => $items]);
    }

    public function toggle(Request $request)
    {
        $data    = $request->validate(['product_id' => 'required|integer|exists:products,id']);
        $userId  = $request->user()->id;
        $existing = Wishlist::where('user_id', $userId)->where('product_id', $data['product_id'])->first();

        if ($existing) {
            $existing->delete();
            return response()->json(['success' => true, 'wishlisted' => false]);
        }

        Wishlist::create(['user_id' => $userId, 'product_id' => $data['product_id']]);
        return response()->json(['success' => true, 'wishlisted' => true]);
    }

    public function ids(Request $request)
    {
        $ids = Wishlist::where('user_id', $request->user()->id)->pluck('product_id');
        return response()->json(['success' => true, 'data' => $ids]);
    }
}
