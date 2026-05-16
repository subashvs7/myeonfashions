<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class AdminNewArrivalController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::select('id', 'name', 'slug', 'base_price', 'sale_price', 'status', 'is_new_arrival', 'created_at')
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%$s%"))
            ->when($request->filter === 'marked', fn($q) => $q->where('is_new_arrival', true))
            ->orderByDesc('created_at')
            ->paginate(20);
        return response()->json(['success' => true, 'data' => $products]);
    }

    public function toggle(int $productId)
    {
        $product = Product::findOrFail($productId);
        $product->update(['is_new_arrival' => !$product->is_new_arrival]);
        return response()->json(['success' => true, 'is_new_arrival' => $product->is_new_arrival]);
    }
}
