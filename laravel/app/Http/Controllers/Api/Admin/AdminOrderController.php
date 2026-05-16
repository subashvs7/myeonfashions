<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminOrderController extends Controller
{
    public function __construct(private NotificationService $notificationService) {}

    public function index(Request $request)
    {
        $status        = $request->input('status');
        $paymentStatus = $request->input('payment_status');
        $search        = $request->input('search');
        $from          = $request->input('from');
        $to            = $request->input('to');
        $perPage       = (int) $request->input('per_page', 20);

        $orders = Order::with('user')
            ->withCount('items')
            ->when($status,        fn($q) => $q->where('status', $status))
            ->when($paymentStatus, fn($q) => $q->where('payment_status', $paymentStatus))
            ->when($search,        fn($q) => $q->where(fn($q2) =>
                $q2->where('order_number', 'like', "%{$search}%")
                   ->orWhereHas('user', fn($u) => $u->where('name', 'like', "%{$search}%"))
            ))
            ->when($from, fn($q) => $q->whereDate('created_at', '>=', $from))
            ->when($to,   fn($q) => $q->whereDate('created_at', '<=', $to))
            ->latest()
            ->paginate($perPage);

        return response()->json(['success' => true, 'data' => $orders]);
    }

    public function show(int $id)
    {
        $order = Order::with(['user', 'items.product', 'payment', 'address', 'returnRequests'])
            ->findOrFail($id);

        return response()->json(['success' => true, 'data' => $order]);
    }

    public function updateStatus(Request $request, int $id)
    {
        $data  = $request->validate([
            'status' => 'required|in:confirmed,processing,packed,shipped,out_for_delivery,delivered,cancelled,returned',
            'note'   => 'nullable|string|max:500',
        ]);

        $order = Order::with('user')->findOrFail($id);
        $order->update(['status' => $data['status']]);

        if ($data['status'] === 'delivered') {
            $order->update(['delivered_at' => now()]);
        }

        $this->notificationService->sendOrderNotification(
            $order->user,
            $order->order_number,
            $data['status']
        );

        return response()->json(['success' => true, 'data' => $order->fresh()]);
    }

    public function addTracking(Request $request, int $id)
    {
        $data = $request->validate([
            'tracking_number' => 'required|string|max:100',
            'courier_name'    => 'required|string|max:100',
            'tracking_url'    => 'nullable|string|url',
        ]);

        // Remove empty tracking_url — don't overwrite an existing value with blank
        if (empty($data['tracking_url'])) {
            unset($data['tracking_url']);
        }

        $order = Order::findOrFail($id);
        $order->update([...$data, 'status' => 'shipped']);

        return response()->json(['success' => true, 'data' => $order->fresh()]);
    }

    public function manifest(Request $request)
    {
        $ids    = $request->input('ids', []);
        $status = $request->input('status', 'packed');
        $hasIds = \count($ids) > 0;

        $orders = Order::with(['items', 'user', 'address'])
            ->when($hasIds,  fn($q) => $q->whereIn('id', $ids))
            ->when(!$hasIds, fn($q) => $q->where('status', $status))
            ->latest()
            ->get();

        $rows = ["Order #,Customer,Phone,Address,Items,Total,Payment Status,Order Date"];

        foreach ($orders as $o) {
            $addr    = $o->address;
            $addrStr = $addr
                ? implode(', ', array_filter([$addr->address_line1, $addr->city, $addr->state, $addr->pincode]))
                : 'N/A';
            $items = $o->items->map(fn($i) => "{$i->product_name} x{$i->quantity}")->implode(' | ');

            $rows[] = implode(',', [
                '"' . $o->order_number . '"',
                '"' . ($o->user?->name    ?? 'N/A') . '"',
                '"' . ($o->user?->phone   ?? $addr?->phone ?? 'N/A') . '"',
                '"' . $addrStr . '"',
                '"' . $items . '"',
                $o->total,
                $o->payment_status,
                $o->created_at->format('d M Y'),
            ]);
        }

        return response(implode("\n", $rows), 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="manifest-' . now()->format('Y-m-d') . '.csv"',
        ]);
    }

    public function statusCounts()
    {
        $counts = Order::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        return response()->json(['success' => true, 'data' => $counts]);
    }

    public function invoice(int $id)
    {
        $order = Order::with(['user', 'items', 'address', 'payment'])->findOrFail($id);

        return response()->json(['success' => true, 'data' => $order]);
    }
}
