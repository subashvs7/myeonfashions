<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\FlashSale;
use Illuminate\Http\Request;

class AdminFlashSaleController extends Controller
{
    public function index()
    {
        $sales = FlashSale::with(['products:id,name,slug,base_price,sale_price'])->orderBy('sort_order')->get();
        return response()->json(['success' => true, 'data' => $sales]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title'          => 'required|string|max:120',
            'badge_text'     => 'sometimes|string|max:30',
            'discount_type'  => 'required|in:percentage,flat',
            'discount_value' => 'required|numeric|min:0',
            'starts_at'      => 'required|date',
            'ends_at'        => 'required|date|after:starts_at',
            'is_active'      => 'sometimes|boolean',
            'sort_order'     => 'sometimes|integer',
        ]);
        $sale = FlashSale::create($data);
        return response()->json(['success' => true, 'data' => $sale], 201);
    }

    public function show(int $id)
    {
        $sale = FlashSale::with(['products:id,name,slug,base_price,sale_price,status'])->findOrFail($id);
        return response()->json(['success' => true, 'data' => $sale]);
    }

    public function update(Request $request, int $id)
    {
        $sale = FlashSale::findOrFail($id);
        $data = $request->validate([
            'title'          => 'sometimes|string|max:120',
            'badge_text'     => 'sometimes|string|max:30',
            'discount_type'  => 'sometimes|in:percentage,flat',
            'discount_value' => 'sometimes|numeric|min:0',
            'starts_at'      => 'sometimes|date',
            'ends_at'        => 'sometimes|date|after:starts_at',
            'is_active'      => 'sometimes|boolean',
            'sort_order'     => 'sometimes|integer',
        ]);
        $sale->update($data);
        return response()->json(['success' => true, 'data' => $sale]);
    }

    public function destroy(int $id)
    {
        FlashSale::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Flash sale deleted']);
    }

    public function addProducts(Request $request, int $id)
    {
        $sale = FlashSale::findOrFail($id);
        $data = $request->validate([
            'product_ids'   => 'required|array',
            'product_ids.*' => 'exists:products,id',
        ]);
        $sync = [];
        foreach ($data['product_ids'] as $pid) {
            $sync[$pid] = [
                'override_discount_type'  => $request->input("overrides.$pid.type"),
                'override_discount_value' => $request->input("overrides.$pid.value"),
            ];
        }
        $sale->products()->syncWithoutDetaching($sync);
        return response()->json(['success' => true]);
    }

    public function removeProduct(int $id, int $productId)
    {
        FlashSale::findOrFail($id)->products()->detach($productId);
        return response()->json(['success' => true]);
    }
}
