<?php
namespace App\Services;

use Razorpay\Api\Api;
use App\Models\Order;
use App\Models\Payment;

class RazorpayService
{
    private Api $api;

    public function __construct()
    {
        $this->api = new Api(config('razorpay.key_id'), config('razorpay.key_secret'));
    }

    public function createOrder(Order $order): array
    {
        $rzpOrder = $this->api->order->create([
            'amount'          => (int)($order->total * 100),
            'currency'        => 'INR',
            'receipt'         => $order->order_number,
            'payment_capture' => 1,
            'notes'           => ['order_id' => $order->id],
        ]);

        Payment::create([
            'order_id'          => $order->id,
            'razorpay_order_id' => $rzpOrder->id,
            'amount'            => $order->total,
            'status'            => 'created',
        ]);

        return [
            'razorpay_order_id' => $rzpOrder->id,
            'amount'            => (int)($order->total * 100),
            'key'               => config('razorpay.key_id'),
            'currency'          => 'INR',
            'order_number'      => $order->order_number,
        ];
    }

    public function verifyPayment(string $rzpOrderId, string $paymentId, string $signature): bool
    {
        $expected = hash_hmac('sha256', $rzpOrderId . '|' . $paymentId, config('razorpay.key_secret'));
        return hash_equals($expected, $signature);
    }

    public function refund(string $paymentId, float $amount): object
    {
        return $this->api->payment->fetch($paymentId)->refund(['amount' => (int)($amount * 100)]);
    }

    public function verifyWebhookSignature(string $body, string $signature): bool
    {
        $expected = hash_hmac('sha256', $body, config('razorpay.webhook_secret'));
        return hash_equals($expected, $signature);
    }
}
