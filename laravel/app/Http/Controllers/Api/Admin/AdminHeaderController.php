<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminHeaderController extends Controller
{
    private array $keys = [
        'announcement_bar_enabled',
        'announcement_bar_text',
        'announcement_bar_color',
        'announcement_bar_link',
        'announcement_bar_link_text',
        'header_sticky',
        'header_show_search',
    ];

    public function index()
    {
        $rows = DB::table('settings')->whereIn('key', $this->keys)->pluck('value', 'key');
        $data = [];
        foreach ($this->keys as $k) {
            $raw = $rows[$k] ?? null;
            $data[$k] = $raw !== null ? json_decode($raw, true) : null;
        }
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'announcement_bar_enabled'   => 'sometimes|nullable|boolean',
            'announcement_bar_text'      => 'sometimes|nullable|string|max:200',
            'announcement_bar_color'     => 'sometimes|nullable|string|max:20',
            'announcement_bar_link'      => 'sometimes|nullable|string|max:255',
            'announcement_bar_link_text' => 'sometimes|nullable|string|max:60',
            'header_sticky'              => 'sometimes|nullable|boolean',
            'header_show_search'         => 'sometimes|nullable|boolean',
        ]);
        foreach ($data as $key => $value) {
            DB::table('settings')->updateOrInsert(
                ['key' => $key],
                ['value' => json_encode($value), 'updated_at' => now(), 'created_at' => now()]
            );
        }
        return response()->json(['success' => true]);
    }
}
