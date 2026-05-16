<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminSettingController extends Controller
{
    private const ALLOWED_KEYS = [
        'app.name', 'app.tagline', 'app.currency', 'app.currency_symbol', 'app.maintenance_mode',
        'payment.online_enabled', 'payment.cod_enabled',
        'payment.razorpay_key_id', 'payment.razorpay_key_secret',
        'payment.min_order_amount',
        'email.mailer', 'email.host', 'email.port',
        'email.username', 'email.password',
        'email.from_address', 'email.from_name', 'email.encryption',
        'store.address', 'store.phone', 'store.whatsapp',
        'store.email', 'store.facebook', 'store.instagram', 'store.twitter',
    ];

    public function index()
    {
        return response()->json([
            'success' => true,
            'data'    => Setting::allAsMap(maskSensitive: true),
        ]);
    }

    public function update(Request $request)
    {
        // $request->only() uses data_get() which treats dots as nested path separators,
        // so keys like 'store.address' are never found in the flat JSON body.
        // Read the raw JSON array and intersect by exact key name instead.
        $all   = $request->json()->all() ?: $request->post();
        $input = array_intersect_key($all, array_flip(self::ALLOWED_KEYS));

        foreach ($input as $key => $value) {
            // Skip masked placeholder — user didn't change the secret
            if ($value === '••••••••') continue;
            Setting::set($key, $value);
        }

        return response()->json(['success' => true, 'message' => 'Settings saved']);
    }

    public function uploadLogo(Request $request)
    {
        $request->validate(['logo' => 'required|image|mimes:png,jpg,jpeg,svg,webp|max:2048']);

        // Delete old logo if exists
        $old = Setting::getValue('app.logo');
        if ($old) Storage::disk('public')->delete($old);

        $path = $request->file('logo')->store('settings', 'public');
        Setting::set('app.logo', $path);

        return response()->json([
            'success' => true,
            'data'    => ['path' => $path, 'url' => asset('storage/' . $path)],
        ]);
    }

    public function uploadFavicon(Request $request)
    {
        $request->validate(['favicon' => 'required|image|mimes:png,ico,svg|max:512']);

        $old = Setting::getValue('app.favicon');
        if ($old) Storage::disk('public')->delete($old);

        $path = $request->file('favicon')->store('settings', 'public');
        Setting::set('app.favicon', $path);

        return response()->json([
            'success' => true,
            'data'    => ['path' => $path, 'url' => asset('storage/' . $path)],
        ]);
    }
}
