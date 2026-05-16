<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'order_id','razorpay_order_id','razorpay_payment_id','razorpay_signature',
        'amount','currency','status','method','gateway_response'
    ];
    protected $casts = ['amount' => 'decimal:2', 'gateway_response' => 'array'];

    public function order() { return $this->belongsTo(Order::class); }
}
