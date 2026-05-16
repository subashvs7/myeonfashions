<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FooterSection extends Model
{
    protected $fillable = ['title', 'position', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function links()
    {
        return $this->hasMany(FooterLink::class)->orderBy('position');
    }
}
