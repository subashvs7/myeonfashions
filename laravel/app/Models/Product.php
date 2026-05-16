<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name','slug','category_id','short_description','description',
        'base_price','sale_price','cost_price','sku','barcode','brand',
        'fabric','care_instructions','country_of_origin','weight','tags',
        'meta_title','meta_description','is_featured','is_new_arrival',
        'is_bestseller','has_variants','status','stock_alert_qty',
        'total_stock','sold_count','avg_rating','review_count','size_chart_image'
    ];

    protected $casts = [
        'is_featured'    => 'boolean',
        'is_new_arrival' => 'boolean',
        'is_bestseller'  => 'boolean',
        'has_variants'   => 'boolean',
        'base_price'     => 'decimal:2',
        'sale_price'     => 'decimal:2',
        'avg_rating'     => 'decimal:2',
    ];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($product) {
            if (empty($product->slug)) $product->slug = Str::slug($product->name);
        });
    }

    public function category()     { return $this->belongsTo(Category::class); }
    public function variants()     { return $this->hasMany(ProductVariant::class); }
    public function images()       { return $this->hasMany(ProductImage::class)->orderBy('sort_order'); }
    public function reviews()      { return $this->hasMany(Review::class)->where('status','approved'); }
    public function primaryImage() { return $this->hasOne(ProductImage::class)->where('is_primary', true); }

    public function getDiscountPercentageAttribute(): int
    {
        if ($this->sale_price && $this->base_price > 0) {
            return round((($this->base_price - $this->sale_price) / $this->base_price) * 100);
        }
        return 0;
    }

    public function getCurrentPriceAttribute(): float
    {
        return (float)($this->sale_price ?? $this->base_price);
    }

    public function scopeActive($q)      { return $q->where('status', 'active'); }
    public function scopeFeatured($q)    { return $q->where('is_featured', true); }
    public function scopeNewArrival($q)  { return $q->where('is_new_arrival', true); }
    public function scopeBestseller($q)  { return $q->where('is_bestseller', true); }
}
