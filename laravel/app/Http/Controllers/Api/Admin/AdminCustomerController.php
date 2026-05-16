<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class AdminCustomerController extends Controller
{
    public function index(Request $request)
    {
        $customers = User::where('role', 'customer')
            ->withCount('orders')
            ->withSum(['orders as total_spent' => fn($q) => $q->where('payment_status', 'paid')], 'total')
            ->when($request->search, fn($q) => $q->where(fn($q2) =>
                $q2->where('name',  'like', "%{$request->search}%")
                   ->orWhere('email', 'like', "%{$request->search}%")
                   ->orWhere('phone', 'like', "%{$request->search}%")
            ))
            ->when($request->filled('is_active'), fn($q) => $q->where('is_active', $request->boolean('is_active')))
            ->latest()
            ->paginate($request->per_page ?? 20);

        return response()->json(['success' => true, 'data' => $customers]);
    }

    public function show(int $id)
    {
        $customer = User::where('role', 'customer')
            ->with([
                'orders'    => fn($q) => $q->latest()->limit(10),
                'addresses',
            ])
            ->withCount('orders')
            ->withSum(['orders as total_spent' => fn($q) => $q->where('payment_status', 'paid')], 'total')
            ->findOrFail($id);

        return response()->json(['success' => true, 'data' => $customer]);
    }

    public function update(Request $request, int $id)
    {
        $customer = User::where('role', 'customer')->findOrFail($id);
        $customer->update($request->validate([
            'is_active' => 'sometimes|boolean',
            'name'      => 'sometimes|string|max:100',
            'phone'     => 'sometimes|nullable|string|max:15',
        ]));
        return response()->json(['success' => true, 'data' => $customer]);
    }

    public function destroy(int $id)
    {
        $customer = User::where('role', 'customer')->findOrFail($id);
        $customer->tokens()->delete();
        $customer->delete();
        return response()->json(['success' => true, 'message' => 'Customer account deleted']);
    }
}
