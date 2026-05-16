<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $table    = 'app_notifications';
    protected $fillable = ['user_id','type','title','message','data','is_read','sent_via'];
    protected $casts    = ['data' => 'array', 'is_read' => 'boolean'];

    public function user() { return $this->belongsTo(User::class); }

    public function scopeUnread($q)  { return $q->where('is_read', false); }
    public function markAsRead(): void { $this->update(['is_read' => true]); }
}
