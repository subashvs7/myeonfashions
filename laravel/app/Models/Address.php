<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    protected $fillable = [
        'user_id','label','full_name','phone','address_line1',
        'address_line2','city','state','pincode','country','is_default'
    ];
    protected $casts = ['is_default' => 'boolean'];

    public function user() { return $this->belongsTo(User::class); }

    public function setAsDefault(): void
    {
        Address::where('user_id', $this->user_id)->update(['is_default' => false]);
        $this->update(['is_default' => true]);
    }
}
