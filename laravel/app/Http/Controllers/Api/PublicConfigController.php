<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Support\Facades\DB;

class PublicConfigController extends Controller
{
    // Returns only the non-sensitive settings the storefront needs
    public function index()
    {
        // Plain string settings (stored as-is)
        $keys = [
            'app.name', 'app.tagline', 'app.logo', 'app.currency', 'app.currency_symbol',
            'app.maintenance_mode',
            'payment.online_enabled', 'payment.cod_enabled',
            'payment.min_order_amount',
            'store.address', 'store.phone', 'store.whatsapp', 'store.email',
            'store.facebook', 'store.instagram', 'store.twitter',
        ];

        $all    = Setting::whereIn('key', $keys)->get()->pluck('value', 'key');
        $config = [];
        foreach ($keys as $k) {
            $config[$k] = $all[$k] ?? null;
        }

        // JSON-encoded header settings (stored by AdminHeaderController)
        $headerKeys = [
            'announcement_bar_enabled',
            'announcement_bar_text',
            'announcement_bar_color',
            'announcement_bar_link',
            'announcement_bar_link_text',
            'header_sticky',
            'header_show_search',
        ];
        $headerRows = DB::table('settings')->whereIn('key', $headerKeys)->pluck('value', 'key');
        foreach ($headerKeys as $k) {
            $raw = $headerRows[$k] ?? null;
            $config[$k] = $raw !== null ? json_decode($raw, true) : null;
        }

        // Let the frontend know whether Razorpay keys are actually configured
        $config['payment.razorpay_configured'] = (
            !empty(config('razorpay.key_id')) && !empty(config('razorpay.key_secret'))
        ) ? '1' : '0';

        return response()->json(['success' => true, 'data' => $config]);
    }
}
