<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Coupon extends Model
{
    protected $fillable = [
        'code','title','description','type','value','min_order_value',
        'max_discount','usage_limit','usage_per_user','used_count',
        'category_id','product_id','first_order_only',
        'starts_at','expires_at','is_active'
    ];

    protected $casts = [
        'is_active'        => 'boolean',
        'first_order_only' => 'boolean',
        'starts_at'        => 'datetime',
        'expires_at'       => 'datetime',
        'value'            => 'decimal:2',
        'min_order_value'  => 'decimal:2',
        'max_discount'     => 'decimal:2',
    ];

    public function isValid(): bool
    {
        if (!$this->is_active) return false;
        if ($this->expires_at && $this->expires_at->isPast()) return false;
        if ($this->starts_at  && $this->starts_at->isFuture()) return false;
        if ($this->usage_limit && $this->used_count >= $this->usage_limit) return false;
        return true;
    }

    public function scopeActive($q)  { return $q->where('is_active', true); }
    public function usages()         { return $this->hasMany(CouponUsage::class); }
}
