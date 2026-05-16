<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;

class AdminInventoryController extends Controller
{
    public function index(Request $request)
    {
        $variants = ProductVariant::with('product:id,name')
            ->when(
                $request->search,
                fn($q) => $q->whereHas('product', fn($q2) => $q2->where('name', 'like', "%{$request->search}%"))
            )
            ->orderBy('stock')
            ->paginate($request->per_page ?? 25);

        return response()->json(['success' => true, 'data' => $variants]);
    }

    public function updateStock(Request $request, int $id)
    {
        $data    = $request->validate(['stock' => 'required|integer|min:0']);
        $variant = ProductVariant::findOrFail($id);
        $variant->update(['stock' => $data['stock']]);

        $total = ProductVariant::where('product_id', $variant->product_id)->sum('stock');
        Product::where('id', $variant->product_id)->update(['total_stock' => $total]);

        return response()->json(['success' => true, 'data' => $variant->load('product:id,name')]);
    }

    public function lowStock()
    {
        $variants = ProductVariant::with('product:id,name')
            ->join('products', 'products.id', '=', 'product_variants.product_id')
            ->whereNull('products.deleted_at')
            ->whereRaw('product_variants.stock <= COALESCE(products.stock_alert_qty, 5)')
            ->select('product_variants.*')
            ->get();

        return response()->json(['success' => true, 'data' => $variants]);
    }
}
