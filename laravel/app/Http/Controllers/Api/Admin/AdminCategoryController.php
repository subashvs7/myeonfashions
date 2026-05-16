<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminCategoryController extends Controller
{
    public function index()
    {
        $categories = Category::with([
            'children' => function ($q) {
                $q->withCount('products')
                  ->orderBy('sort_order')
                  ->with(['children' => function ($q2) {
                      $q2->withCount('products')->orderBy('sort_order');
                  }]);
            },
        ])
        ->withCount('products')
        // null covers proper inserts; 0 covers older rows where empty-string was coerced to 0
        ->where(fn($q) => $q->whereNull('parent_id')->orWhere('parent_id', 0))
        ->orderBy('sort_order')
        ->get();

        return response()->json(['success' => true, 'data' => $categories]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'             => 'required|string|max:100',
            'parent_id'        => 'nullable|integer|exists:categories,id',
            'description'      => 'nullable|string',
            'banner_color'     => 'sometimes|string|max:7',
            'sort_order'       => 'sometimes|integer',
            'is_active'        => 'sometimes|boolean',
            'show_in_menu'     => 'sometimes|boolean',
            'meta_title'       => 'nullable|string',
            'meta_description' => 'nullable|string',
        ]);
        $data['slug']      = Str::slug($data['name']);
        $data['parent_id'] = !empty($data['parent_id']) ? (int) $data['parent_id'] : null;
        $category = Category::create($data);

        if ($request->hasFile('image')) {
            $category->update(['image' => $request->file('image')->store("categories", 'public')]);
        }
        return response()->json(['success' => true, 'data' => $category], 201);
    }

    public function show(int $id)
    {
        return response()->json(['success' => true, 'data' => Category::with('children')->findOrFail($id)]);
    }

    public function update(Request $request, int $id)
    {
        $category = Category::findOrFail($id);
        $data = $request->validate([
            'name'         => 'sometimes|string|max:100',
            'parent_id'    => 'nullable|integer|exists:categories,id',
            'description'  => 'nullable|string',
            'banner_color' => 'sometimes|string|max:7',
            'sort_order'   => 'sometimes|integer',
            'is_active'    => 'sometimes|boolean',
            'show_in_menu' => 'sometimes|boolean',
        ]);
        if (isset($data['name']))      $data['slug']      = Str::slug($data['name']);
        if (array_key_exists('parent_id', $data)) {
            $data['parent_id'] = !empty($data['parent_id']) ? (int) $data['parent_id'] : null;
        }
        $category->update($data);
        return response()->json(['success' => true, 'data' => $category]);
    }

    public function destroy(int $id)
    {
        Category::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Category deleted']);
    }

    public function reorder(Request $request)
    {
        $data = $request->validate(['items' => 'required|array', 'items.*.id' => 'required|integer', 'items.*.sort_order' => 'required|integer']);
        foreach ($data['items'] as $item) {
            Category::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }
        return response()->json(['success' => true, 'message' => 'Reordered']);
    }
}
