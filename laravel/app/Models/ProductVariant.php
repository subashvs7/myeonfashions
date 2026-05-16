<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductVariant extends Model
{
    protected $fillable = [
        'product_id','size','color','color_hex','sku',
        'price','sale_price','stock','image','is_active'
    ];

    protected $casts = ['is_active' => 'boolean', 'price' => 'decimal:2', 'sale_price' => 'decimal:2'];

    public function product() { return $this->belongsTo(Product::class); }

    public function getCurrentPriceAttribute(): float
    {
        return (float)($this->sale_price ?? $this->price);
    }

    public function scopeActive($q)  { return $q->where('is_active', true); }
    public function scopeInStock($q) { return $q->where('stock', '>', 0); }
}
