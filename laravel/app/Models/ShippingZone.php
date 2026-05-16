<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShippingZone extends Model
{
    protected $fillable = [
        'name','description','states','pincodes','flat_rate',
        'free_above','weight_rate','estimated_days','is_active'
    ];
    protected $casts = [
        'states'      => 'array',
        'pincodes'    => 'array',
        'is_active'   => 'boolean',
        'flat_rate'   => 'decimal:2',
        'free_above'  => 'decimal:2',
        'weight_rate' => 'decimal:2',
    ];

    public function scopeActive($q) { return $q->where('is_active', true); }
}
