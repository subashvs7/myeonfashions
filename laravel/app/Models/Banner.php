<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Banner extends Model
{
    protected $fillable = [
        'title','subtitle','image','mobile_image','link',
        'button_text','position','sort_order','starts_at','expires_at','is_active'
    ];
    protected $casts = [
        'is_active'  => 'boolean',
        'starts_at'  => 'datetime',
        'expires_at' => 'datetime',
    ];
    protected $appends = ['image_url'];

    public function getImageUrlAttribute(): ?string
    {
        return $this->image ? '/storage/' . $this->image : null;
    }

    public function scopeActive($q)          { return $q->where('is_active', true); }
    public function scopeForPosition($q, $p) { return $q->where('position', $p); }
}
