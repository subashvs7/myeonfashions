<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FooterLink extends Model
{
    protected $fillable = ['footer_section_id', 'label', 'url', 'open_in_new_tab', 'position', 'is_active'];

    protected $casts = ['is_active' => 'boolean', 'open_in_new_tab' => 'boolean'];

    public function section()
    {
        return $this->belongsTo(FooterSection::class, 'footer_section_id');
    }
}
