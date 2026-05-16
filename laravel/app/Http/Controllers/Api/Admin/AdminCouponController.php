<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;

class AdminCouponController extends Controller
{
    public function index()
    {
        return response()->json(['success' => true, 'data' => Coupon::latest()->paginate(20)]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'code'             => 'required|string|unique:coupons|max:30',
            'title'            => 'required|string',
            'description'      => 'nullable|string',
            'type'             => 'required|in:flat,percentage,free_shipping,bogo',
            'value'            => 'required|numeric|min:0',
            'min_order_value'  => 'sometimes|numeric|min:0',
            'max_discount'     => 'nullable|numeric|min:0',
            'usage_limit'      => 'nullable|integer|min:1',
            'usage_per_user'   => 'sometimes|integer|min:1',
            'first_order_only' => 'sometimes|boolean',
            'starts_at'        => 'nullable|date',
            'expires_at'       => 'nullable|date|after:starts_at',
            'is_active'        => 'sometimes|boolean',
        ]);
        $data['code'] = strtoupper($data['code']);
        $coupon = Coupon::create($data);
        return response()->json(['success' => true, 'data' => $coupon], 201);
    }

    public function show(int $id) { return response()->json(['success' => true, 'data' => Coupon::findOrFail($id)]); }

    public function update(Request $request, int $id)
    {
        $coupon = Coupon::findOrFail($id);
        $coupon->update($request->validate([
            'title'            => 'sometimes|string',
            'value'            => 'sometimes|numeric|min:0',
            'min_order_value'  => 'sometimes|numeric|min:0',
            'max_discount'     => 'nullable|numeric',
            'usage_limit'      => 'nullable|integer',
            'expires_at'       => 'nullable|date',
            'is_active'        => 'sometimes|boolean',
        ]));
        return response()->json(['success' => true, 'data' => $coupon]);
    }

    public function destroy(int $id)
    {
        Coupon::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Coupon deleted']);
    }
}
