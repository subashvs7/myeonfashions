<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;

class PublicConfigController extends Controller
{
    // Returns only the non-sensitive settings the storefront needs
    public function index()
    {
        $keys = [
            'app.name', 'app.tagline', 'app.logo', 'app.currency', 'app.currency_symbol',
            'app.maintenance_mode',
            'payment.online_enabled', 'payment.cod_enabled',
            'payment.min_order_amount',
            'store.phone', 'store.whatsapp', 'store.email',
            'store.facebook', 'store.instagram', 'store.twitter',
        ];

        $all    = Setting::whereIn('key', $keys)->get()->pluck('value', 'key');
        $config = [];
        foreach ($keys as $k) {
            $config[$k] = $all[$k] ?? null;
        }

        return response()->json(['success' => true, 'data' => $config]);
    }
}
