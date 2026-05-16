<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ReturnRequest;
use Illuminate\Http\Request;

class ReturnController extends Controller
{
    public function index(Request $request)
    {
        $returns = ReturnRequest::with('order', 'orderItem')
            ->where('user_id', $request->user()->id)->latest()->get();
        return response()->json(['success' => true, 'data' => $returns]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'order_id'      => 'required|integer|exists:orders,id',
            'order_item_id' => 'required|integer|exists:order_items,id',
            'reason'        => 'required|string|max:200',
            'description'   => 'nullable|string|max:1000',
        ]);

        $return = ReturnRequest::create([...$data, 'user_id' => $request->user()->id]);
        return response()->json(['success' => true, 'data' => $return], 201);
    }
}
