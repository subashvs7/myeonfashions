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
            ->whereNull('parent_id')
            ->with(['children' => fn($q) => $q->orderBy('position')])
            ->orderBy('position')
            ->get();
        return response()->json(['success' => true, 'data' => $items]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'label'     => 'required|string|max:100',
            'url'       => 'required|string|max:255',
            'parent_id' => 'nullable|exists:menu_items,id',
            'location'  => 'required|in:header,footer',
            'target'    => 'required|in:_self,_blank',
            'position'  => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);
        $item = MenuItem::create($data);
        return response()->json(['success' => true, 'data' => $item], 201);
    }

    public function update(Request $request, $id)
    {
        $item = MenuItem::findOrFail($id);
        $data = $request->validate([
            'label'     => 'sometimes|nullable|string|max:100',
            'url'       => 'sometimes|nullable|string|max:255',
            'parent_id' => 'nullable|exists:menu_items,id',
            'location'  => 'sometimes|nullable|in:header,footer',
            'target'    => 'sometimes|nullable|in:_self,_blank',
            'position'  => 'sometimes|nullable|integer',
            'is_active' => 'sometimes|nullable|boolean',
        ]);
        $item->update($data);
        return response()->json(['success' => true, 'data' => $item]);
    }

    public function destroy($id)
    {
        MenuItem::findOrFail($id)->delete();
        return response()->json(['success' => true]);
    }

    public function reorder(Request $request)
    {
        foreach ((array) $request->items as $item) {
            MenuItem::where('id', $item['id'])->update(['position' => $item['position']]);
        }
        return response()->json(['success' => true]);
    }
}
