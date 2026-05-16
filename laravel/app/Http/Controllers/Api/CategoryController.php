<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::active()->inMenu()->topLevel()
            ->with(['children' => function ($q) {
                $q->active()->inMenu()->orderBy('sort_order')
                  ->with(['children' => fn($q2) => $q2->active()->inMenu()->orderBy('sort_order')]);
            }])
            ->orderBy('sort_order')->get();
        return response()->json(['success' => true, 'data' => $categories]);
    }

    public function show(string $slug)
    {
        $category = Category::where('slug', $slug)->active()->with('children', 'parent')->firstOrFail();
        return response()->json(['success' => true, 'data' => $category]);
    }

    public function products(Request $request, string $slug)
    {
        $category = Category::where('slug', $slug)->active()->firstOrFail();

        $categoryId = (int) $category->getAttribute('id');
        $childIds   = $category->children()->pluck('id')->push($categoryId);

        $minPrice = $request->input('min_price');
        $maxPrice = $request->input('max_price');
        $brand    = $request->input('brand');
        $sort     = $request->input('sort');
        $perPage  = (int) $request->input('per_page', 20);

        $products = Product::with('primaryImage')
            ->active()
            ->whereIn('category_id', $childIds)
            ->when($minPrice,           fn($q) => $q->where('base_price', '>=', $minPrice))
            ->when($maxPrice,           fn($q) => $q->where('base_price', '<=', $maxPrice))
            ->when($brand,              fn($q) => $q->where('brand', $brand))
            ->when($sort === 'price_asc',  fn($q) => $q->orderBy('base_price'))
            ->when($sort === 'price_desc', fn($q) => $q->orderByDesc('base_price'))
            ->when($sort === 'newest',     fn($q) => $q->latest())
            ->when($sort === 'popular',    fn($q) => $q->orderByDesc('sold_count'))
            ->when(!$sort,              fn($q) => $q->latest())
            ->paginate($perPage);

        return response()->json(['success' => true, 'data' => $products, 'category' => $category]);
    }
}
