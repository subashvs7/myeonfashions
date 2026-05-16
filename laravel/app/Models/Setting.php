<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = ['key', 'value'];

    private static array $SENSITIVE = [
        'payment.razorpay_key_secret',
        'email.password',
    ];

    public static function getValue(string $key, mixed $default = null): mixed
    {
        return static::where('key', $key)->value('value') ?? $default;
    }

    public static function set(string $key, mixed $value): void
    {
        static::updateOrCreate(['key' => $key], ['value' => $value]);
    }

    public static function allAsMap(bool $maskSensitive = false): array
    {
        $map = static::all()->pluck('value', 'key')->toArray();

        if ($maskSensitive) {
            foreach (self::$SENSITIVE as $k) {
                if (!empty($map[$k])) {
                    $map[$k] = '••••••••';
                }
            }
        }

        return $map;
    }

    public static function isSensitive(string $key): bool
    {
        return in_array($key, self::$SENSITIVE, true);
    }
}
