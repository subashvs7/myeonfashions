<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ShippingZone;
use Illuminate\Http\Request;

class AdminShippingController extends Controller
{
    public function index()
    {
        return response()->json(['success' => true, 'data' => ShippingZone::all()]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'           => 'required|string',
            'description'    => 'nullable|string',
            'states'         => 'nullable|array',
            'pincodes'       => 'nullable|array',
            'flat_rate'      => 'required|numeric|min:0',
            'free_above'     => 'nullable|numeric|min:0',
            'weight_rate'    => 'sometimes|numeric|min:0',
            'estimated_days' => 'required|integer|min:1',
            'is_active'      => 'sometimes|boolean',
        ]);
        return response()->json(['success' => true, 'data' => ShippingZone::create($data)], 201);
    }

    public function show(int $id) { return response()->json(['success' => true, 'data' => ShippingZone::findOrFail($id)]); }

    public function update(Request $request, int $id)
    {
        $zone = ShippingZone::findOrFail($id);
        $zone->update($request->validate([
            'name'           => 'sometimes|string',
            'description'    => 'nullable|string',
            'pincodes'       => 'nullable|array',
            'flat_rate'      => 'sometimes|numeric|min:0',
            'free_above'     => 'nullable|numeric|min:0',
            'estimated_days' => 'sometimes|integer|min:1',
            'is_active'      => 'sometimes|boolean',
        ]));
        return response()->json(['success' => true, 'data' => $zone]);
    }

    public function destroy(int $id)
    {
        ShippingZone::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Zone deleted']);
    }
}
