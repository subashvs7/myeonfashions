<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ReturnRequest;
use Illuminate\Http\Request;

class AdminReturnController extends Controller
{
    public function index(Request $request)
    {
        $returns = ReturnRequest::with('user', 'order', 'orderItem')
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->latest()->paginate(20);
        return response()->json(['success' => true, 'data' => $returns]);
    }

    public function show(int $id)
    {
        $return = ReturnRequest::with('user', 'order', 'orderItem')->findOrFail($id);
        return response()->json(['success' => true, 'data' => $return]);
    }

    public function update(Request $request, int $id)
    {
        $return = ReturnRequest::findOrFail($id);
        $data   = $request->validate([
            'status'        => 'required|in:approved,rejected,completed',
            'refund_amount' => 'nullable|numeric|min:0',
            'admin_notes'   => 'nullable|string',
        ]);
        if ($data['status'] === 'completed') $data['resolved_at'] = now();
        $return->update($data);
        return response()->json(['success' => true, 'data' => $return->fresh()]);
    }
}
