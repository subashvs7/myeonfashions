<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;

class AdminBannerController extends Controller
{
    public function index()
    {
        return response()->json(['success' => true, 'data' => Banner::orderBy('sort_order')->get()]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'       => 'required|string',
            'subtitle'    => 'nullable|string',
            'link'        => 'nullable|string',
            'button_text' => 'nullable|string',
            'position'    => 'required|in:hero,category,popup,strip',
            'sort_order'  => 'sometimes|integer',
            'starts_at'   => 'nullable|date',
            'expires_at'  => 'nullable|date',
            'is_active'   => 'sometimes|boolean',
        ]);
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('banners', 'public');
        }
        if ($request->hasFile('mobile_image')) {
            $data['mobile_image'] = $request->file('mobile_image')->store('banners', 'public');
        }
        return response()->json(['success' => true, 'data' => Banner::create($data)], 201);
    }

    public function show(int $id) { return response()->json(['success' => true, 'data' => Banner::findOrFail($id)]); }

    public function update(Request $request, int $id)
    {
        $banner = Banner::findOrFail($id);
        $data   = $request->validate([
            'title'       => 'sometimes|string',
            'subtitle'    => 'nullable|string',
            'link'        => 'nullable|string',
            'button_text' => 'nullable|string',
            'position'    => 'sometimes|in:hero,category,popup,strip',
            'sort_order'  => 'sometimes|integer',
            'starts_at'   => 'nullable|date',
            'expires_at'  => 'nullable|date',
            'is_active'   => 'sometimes|boolean',
        ]);
        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('banners', 'public');
        }
        if ($request->hasFile('mobile_image')) {
            $data['mobile_image'] = $request->file('mobile_image')->store('banners', 'public');
        }
        $banner->update($data);
        return response()->json(['success' => true, 'data' => $banner]);
    }

    public function destroy(int $id)
    {
        Banner::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Banner deleted']);
    }

    public function reorder(Request $request)
    {
        foreach ($request->validate(['items' => 'required|array'])['items'] as $item) {
            Banner::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }
        return response()->json(['success' => true]);
    }
}
