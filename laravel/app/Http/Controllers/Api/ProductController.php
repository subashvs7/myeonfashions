<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['primaryImage', 'category'])
            ->active()
            ->when($request->category_id, fn($q) => $q->where('category_id', $request->category_id))
            ->when($request->brand, fn($q) => $q->where('brand', $request->brand))
            ->when($request->min_price, fn($q) => $q->where('base_price', '>=', $request->min_price))
            ->when($request->max_price, fn($q) => $q->where('base_price', '<=', $request->max_price))
            ->when($request->sort === 'price_asc', fn($q) => $q->orderBy('base_price'))
            ->when($request->sort === 'price_desc', fn($q) => $q->orderByDesc('base_price'))
            ->when($request->sort === 'newest', fn($q) => $q->latest())
            ->when($request->sort === 'popular', fn($q) => $q->orderByDesc('sold_count'))
            ->when($request->sort === 'rating', fn($q) => $q->orderByDesc('avg_rating'))
            ->when(!$request->sort, fn($q) => $q->latest());

        $products = $query->paginate($request->per_page ?? 20);
        return response()->json(['success' => true, 'data' => $products]);
    }

    public function show(string $slug)
    {
        $product = Product::with(['images', 'variants', 'category', 'reviews.user'])
            ->where('slug', $slug)->active()->firstOrFail();

        $product->append(['discount_percentage', 'current_price']);
        return response()->json(['success' => true, 'data' => $product]);
    }

    public function featured()
    {
        $products = Product::with('primaryImage')->active()->featured()->take(12)->get();
        return response()->json(['success' => true, 'data' => $products]);
    }

    public function newArrivals()
    {
        $products = Product::with('primaryImage')->active()->newArrival()->latest()->take(12)->get();
        return response()->json(['success' => true, 'data' => $products]);
    }

    public function bestsellers()
    {
        $products = Product::with('primaryImage')->active()->bestseller()->orderByDesc('sold_count')->take(12)->get();
        return response()->json(['success' => true, 'data' => $products]);
    }

    public function related(int $id)
    {
        $product  = Product::findOrFail($id);
        $related  = Product::with('primaryImage')
            ->active()
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $id)
            ->take(8)->get();
        return response()->json(['success' => true, 'data' => $related]);
    }
}
