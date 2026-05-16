<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CouponService;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    public function __construct(private CouponService $couponService) {}

    public function apply(Request $request)
    {
        $data = $request->validate([
            'code'     => 'required|string',
            'subtotal' => 'required|numeric|min:0',
        ]);

        try {
            $coupon   = $this->couponService->validate($data['code'], $request->user(), $data['subtotal']);
            $discount = $this->couponService->calculateDiscount($coupon, $data['subtotal']);
            return response()->json(['success' => true, 'data' => [
                'coupon'   => $coupon,
                'discount' => $discount,
            ]]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }
    }

    public function remove()
    {
        return response()->json(['success' => true, 'message' => 'Coupon removed']);
    }
}
