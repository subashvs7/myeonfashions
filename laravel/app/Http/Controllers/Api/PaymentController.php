<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Services\RazorpayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    public function __construct(private RazorpayService $razorpay) {}

    public function createOrder(Request $request)
    {
        $data  = $request->validate(['order_id' => 'required|integer|exists:orders,id']);
        $order = Order::where('user_id', $request->user()->id)->findOrFail($data['order_id']);

        if ($order->payment_status === 'paid') {
            return response()->json(['success' => false, 'message' => 'Already paid'], 422);
        }

        try {
            $rzpData = $this->razorpay->createOrder($order);
        } catch (\Exception $e) {
            Log::error('Razorpay createOrder failed', ['order_id' => $order->id, 'error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Payment gateway error: ' . $e->getMessage()], 502);
        }
        return response()->json(['success' => true, 'data' => $rzpData]);
    }

    public function verify(Request $request)
    {
        $data = $request->validate([
            'razorpay_order_id'   => 'required|string',
            'razorpay_payment_id' => 'required|string',
            'razorpay_signature'  => 'required|string',
            'order_id'            => 'required|integer|exists:orders,id',
        ]);

        $valid = $this->razorpay->verifyPayment(
            $data['razorpay_order_id'],
            $data['razorpay_payment_id'],
            $data['razorpay_signature']
        );

        if (!$valid) {
            return response()->json(['success' => false, 'message' => 'Payment verification failed'], 422);
        }

        $order = Order::findOrFail($data['order_id']);
        $order->update(['payment_status' => 'paid', 'status' => 'confirmed']);

        Payment::where('order_id', $order->id)->update([
            'razorpay_payment_id' => $data['razorpay_payment_id'],
            'razorpay_signature'  => $data['razorpay_signature'],
            'status'              => 'paid',
        ]);

        return response()->json(['success' => true, 'data' => $order->fresh()]);
    }

    public function retry(Request $request, int $orderId)
    {
        $order = Order::where('user_id', $request->user()->id)
                      ->where('payment_status', 'failed')
                      ->findOrFail($orderId);

        $rzpData = $this->razorpay->createOrder($order);
        return response()->json(['success' => true, 'data' => $rzpData]);
    }

    public function webhook(Request $request)
    {
        $body      = $request->getContent();
        $signature = $request->header('X-Razorpay-Signature', '');

        if (!$this->razorpay->verifyWebhookSignature($body, $signature)) {
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        $event = json_decode($body, true);
        if ($event['event'] === 'payment.captured') {
            $rzpOrderId = $event['payload']['payment']['entity']['order_id'];
            $payment    = Payment::where('razorpay_order_id', $rzpOrderId)->first();
            if ($payment) {
                $payment->order->update(['payment_status' => 'paid', 'status' => 'confirmed']);
                $payment->update(['status' => 'paid']);
            }
        }
        return response()->json(['status' => 'ok']);
    }
}
