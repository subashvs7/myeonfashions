<?php
namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, SoftDeletes, Notifiable;

    protected $fillable = [
        'name','email','phone','password','role','avatar',
        'gender','dob','is_active','otp','otp_expires_at'
    ];

    protected $hidden = ['password','remember_token','otp'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'dob'               => 'date',
            'is_active'         => 'boolean',
            'otp_expires_at'    => 'datetime',
        ];
    }

    public function orders()        { return $this->hasMany(Order::class); }
    public function addresses()     { return $this->hasMany(Address::class); }
    public function cart()          { return $this->hasOne(Cart::class); }
    public function wishlist()      { return $this->hasMany(Wishlist::class); }
    public function reviews()       { return $this->hasMany(Review::class); }
    public function appNotifications() { return $this->hasMany(Notification::class); }
    public function isAdmin()       { return $this->role === 'admin'; }
}
