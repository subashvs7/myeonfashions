<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'order_number','user_id','subtotal','discount','shipping_charge',
        'tax','total','coupon_code','address_id','shipping_address',
        'status','payment_method','payment_status','tracking_number',
        'tracking_url','courier_name','notes','delivered_at'
    ];

    protected $casts = [
        'shipping_address' => 'array',
        'delivered_at'     => 'datetime',
        'subtotal'         => 'decimal:2',
        'discount'         => 'decimal:2',
        'total'            => 'decimal:2',
    ];

    public function user()           { return $this->belongsTo(User::class); }
    public function items()          { return $this->hasMany(OrderItem::class); }
    public function payment()        { return $this->hasOne(Payment::class); }
    public function address()        { return $this->belongsTo(Address::class); }
    public function returnRequests() { return $this->hasMany(ReturnRequest::class); }

    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'pending'          => 'Order Placed',
            'confirmed'        => 'Confirmed',
            'processing'       => 'Processing',
            'packed'           => 'Packed',
            'shipped'          => 'Shipped',
            'out_for_delivery' => 'Out for Delivery',
            'delivered'        => 'Delivered',
            'cancelled'        => 'Cancelled',
            'return_requested' => 'Return Requested',
            'returned'         => 'Returned',
            default            => ucfirst($this->status),
        };
    }
}
