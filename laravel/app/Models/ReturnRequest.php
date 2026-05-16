<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReturnRequest extends Model
{
    protected $fillable = [
        'order_id','order_item_id','user_id','reason',
        'description','images','status','refund_amount','admin_notes','resolved_at'
    ];
    protected $casts = [
        'images'        => 'array',
        'refund_amount' => 'decimal:2',
        'resolved_at'   => 'datetime',
    ];

    public function order()     { return $this->belongsTo(Order::class); }
    public function orderItem() { return $this->belongsTo(OrderItem::class); }
    public function user()      { return $this->belongsTo(User::class); }
}
