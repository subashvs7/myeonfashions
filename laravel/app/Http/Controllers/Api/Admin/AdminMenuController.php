<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\MenuItem;
use Illuminate\Http\Request;

class AdminMenuController extends Controller
{
    public function index(Request $request)
    {
        $location = $request->get('location', 'header');
        $items = MenuItem::where('location', $location)
            ->with('children')
            ->whereNull('parent_id')
            ->orderBy('position')
            ->get();
        return response()->json(['success' => true, 'data' => $items]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'label'     => 'required|string|max:80',
            'url'       => 'required|string|max:255',
            'parent_id' => 'nullable|exists:menu_items,id',
            'location'  => 'sometimes|in:header,footer',
            'target'    => 'sometimes|in:_self,_blank',
            'position'  => 'sometimes|integer',
            'is_active' => 'sometimes|boolean',
        ]);
        return response()->json(['success' => true, 'data' => MenuItem::create($data)], 201);
    }

    public function update(Request $request, int $id)
    {
        $item = MenuItem::findOrFail($id);
        $data = $request->validate([
            'label'     => 'sometimes|string|max:80',
            'url'       => 'sometimes|string|max:255',
            'parent_id' => 'nullable|exists:menu_items,id',
            'location'  => 'sometimes|in:header,footer',
            'target'    => 'sometimes|in:_self,_blank',
            'position'  => 'sometimes|integer',
            'is_active' => 'sometimes|boolean',
        ]);
        $item->update($data);
        return response()->json(['success' => true, 'data' => $item]);
    }

    public function destroy(int $id)
    {
        MenuItem::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Menu item deleted']);
    }

    public function reorder(Request $request)
    {
        foreach ($request->validate(['items' => 'required|array'])['items'] as $item) {
            MenuItem::where('id', $item['id'])->update(['position' => $item['position']]);
        }
        return response()->json(['success' => true]);
    }
}
