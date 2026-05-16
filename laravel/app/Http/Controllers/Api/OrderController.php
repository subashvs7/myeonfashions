<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Setting;
use App\Services\OrderService;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(private OrderService $orderService) {}

    public function index(Request $request)
    {
        $orders = Order::with('items')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate(10);
        return response()->json(['success' => true, 'data' => $orders]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'address_id'     => 'required|integer|exists:addresses,id',
            'payment_method' => 'required|in:razorpay,cod',
            'coupon_code'    => 'nullable|string',
            'notes'          => 'nullable|string',
        ]);

        // Guard disabled payment methods
        if ($data['payment_method'] === 'cod' && Setting::getValue('payment.cod_enabled', '0') !== '1') {
            return response()->json(['success' => false, 'message' => 'Cash on Delivery is not available.'], 422);
        }
        if ($data['payment_method'] === 'razorpay' && Setting::getValue('payment.online_enabled', '1') !== '1') {
            return response()->json(['success' => false, 'message' => 'Online payment is currently unavailable.'], 422);
        }

        try {
            $order = $this->orderService->createOrder($data, $request->user());
            return response()->json(['success' => true, 'data' => $order], 201);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 422);
        }
    }

    public function show(Request $request, int $id)
    {
        $order = Order::with(['items', 'payment', 'address', 'returnRequests'])
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);
        return response()->json(['success' => true, 'data' => $order]);
    }

    public function cancel(Request $request, int $id)
    {
        $order = Order::where('user_id', $request->user()->id)->findOrFail($id);
        if (!in_array($order->status, ['pending', 'confirmed'])) {
            return response()->json(['success' => false, 'message' => 'Order cannot be cancelled'], 422);
        }
        $order->update(['status' => 'cancelled']);
        return response()->json(['success' => true, 'message' => 'Order cancelled']);
    }

    public function invoice(Request $request, int $id)
    {
        $order = Order::with(['items', 'user'])
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);
        return response()->json(['success' => true, 'data' => $order]);
    }
}
