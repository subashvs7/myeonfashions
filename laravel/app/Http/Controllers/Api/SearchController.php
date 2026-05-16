<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $q = $request->validate(['q' => 'required|string|min:2'])['q'];

        $products = Product::with('primaryImage')
            ->active()
            ->where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                      ->orWhere('brand', 'like', "%{$q}%")
                      ->orWhere('tags', 'like', "%{$q}%");
            })
            ->paginate(20);

        return response()->json(['success' => true, 'data' => $products]);
    }

    public function suggestions(Request $request)
    {
        $q = $request->get('q', '');
        if (strlen($q) < 2) return response()->json(['success' => true, 'data' => []]);

        $suggestions = Product::active()
            ->where('name', 'like', "%{$q}%")
            ->select('id', 'name', 'slug')
            ->take(8)->get();

        return response()->json(['success' => true, 'data' => $suggestions]);
    }
}
