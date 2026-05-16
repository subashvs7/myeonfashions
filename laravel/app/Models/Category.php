<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Category extends Model
{
    protected $fillable = [
        'name','slug','parent_id','description','image','banner_image',
        'banner_color','icon','meta_title','meta_description',
        'sort_order','is_active','show_in_menu'
    ];

    protected $casts = ['is_active' => 'boolean', 'show_in_menu' => 'boolean'];

    protected static function boot()
    {
        parent::boot();
        static::creating(function ($cat) {
            if (empty($cat->slug)) $cat->slug = Str::slug($cat->name);
        });
    }

    public function parent()   { return $this->belongsTo(Category::class, 'parent_id'); }
    public function children() { return $this->hasMany(Category::class, 'parent_id'); }
    public function products() { return $this->hasMany(Product::class); }

    public function scopeActive($q)    { return $q->where('is_active', true); }
    public function scopeInMenu($q)    { return $q->where('show_in_menu', true); }
    public function scopeTopLevel($q)  { return $q->where(fn($q2) => $q2->whereNull('parent_id')->orWhere('parent_id', 0)); }
}
