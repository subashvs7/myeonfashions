<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ShippingService;

class ShippingController extends Controller
{
    public function __construct(private ShippingService $shippingService) {}

    public function checkPincode(string $pincode)
    {
        $result = $this->shippingService->checkPincode($pincode);
        return response()->json(['success' => true, 'data' => $result]);
    }
}
