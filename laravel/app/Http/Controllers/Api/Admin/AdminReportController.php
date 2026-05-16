<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Http\Request;

class AdminReportController extends Controller
{
    private function dateRange(Request $request): array
    {
        $from = $request->input('from')
            ? now()->parse($request->input('from'))->startOfDay()
            : now()->subDays(30)->startOfDay();

        $to = $request->input('to')
            ? now()->parse($request->input('to'))->endOfDay()
            : now()->endOfDay();

        return [$from, $to];
    }

    public function sales(Request $request)
    {
        [$from, $to] = $this->dateRange($request);

        $data = Order::where('payment_status', 'paid')
            ->whereBetween('created_at', [$from, $to])
            ->selectRaw('DATE(created_at) as date, SUM(total) as revenue, COUNT(*) as orders, SUM(discount) as discounts, SUM(shipping_charge) as shipping')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $summary = [
            'total_revenue'  => round($data->sum('revenue'), 2),
            'total_orders'   => $data->sum('orders'),
            'total_discount' => round($data->sum('discounts'), 2),
            'total_shipping' => round($data->sum('shipping'), 2),
            'avg_order'      => $data->sum('orders') > 0
                ? round($data->sum('revenue') / $data->sum('orders'), 2)
                : 0,
        ];

        $chart = $data->map(fn($d) => [
            'date'    => $d->date,
            'revenue' => (float) $d->revenue,
            'orders'  => (int) $d->orders,
        ]);

        return response()->json(['success' => true, 'data' => compact('chart', 'summary')]);
    }

    public function profit(Request $request)
    {
        [$from, $to] = $this->dateRange($request);

        $daily = OrderItem::join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.payment_status', 'paid')
            ->whereBetween('orders.created_at', [$from, $to])
            ->whereNotNull('order_items.cost_price')
            ->selectRaw("
                DATE(orders.created_at) as date,
                SUM(order_items.total) as revenue,
                SUM(order_items.cost_price * order_items.quantity) as cost,
                SUM(order_items.total - (order_items.cost_price * order_items.quantity)) as profit
            ")
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $topProducts = OrderItem::join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.payment_status', 'paid')
            ->whereBetween('orders.created_at', [$from, $to])
            ->whereNotNull('order_items.cost_price')
            ->selectRaw("
                order_items.product_name,
                SUM(order_items.quantity) as units_sold,
                SUM(order_items.total) as revenue,
                SUM(order_items.cost_price * order_items.quantity) as cost,
                SUM(order_items.total - (order_items.cost_price * order_items.quantity)) as profit
            ")
            ->groupBy('order_items.product_name')
            ->orderByDesc('profit')
            ->limit(20)
            ->get();

        $summary = [
            'total_revenue' => round($daily->sum('revenue'), 2),
            'total_cost'    => round($daily->sum('cost'), 2),
            'gross_profit'  => round($daily->sum('profit'), 2),
            'margin'        => $daily->sum('revenue') > 0
                ? round(($daily->sum('profit') / $daily->sum('revenue')) * 100, 1)
                : 0,
        ];

        return response()->json(['success' => true, 'data' => compact('daily', 'topProducts', 'summary')]);
    }

    public function gst(Request $request)
    {
        [$from, $to] = $this->dateRange($request);
        $gstRate = (float) $request->input('rate', 5);

        $orders = Order::where('payment_status', 'paid')
            ->whereBetween('created_at', [$from, $to])
            ->selectRaw('DATE(created_at) as date, SUM(total) as revenue, COUNT(*) as orders')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $chart = $orders->map(fn($d) => [
            'date'    => $d->date,
            'revenue' => (float) $d->revenue,
            'taxable' => round((float) $d->revenue / (1 + $gstRate / 100), 2),
            'gst'     => round((float) $d->revenue - (float) $d->revenue / (1 + $gstRate / 100), 2),
        ]);

        $totalRevenue = $orders->sum('revenue');
        $taxableValue = round($totalRevenue / (1 + $gstRate / 100), 2);
        $totalGST     = round($totalRevenue - $taxableValue, 2);

        $summary = [
            'total_revenue' => round($totalRevenue, 2),
            'taxable_value' => $taxableValue,
            'total_gst'     => $totalGST,
            'cgst'          => round($totalGST / 2, 2),
            'sgst'          => round($totalGST / 2, 2),
            'gst_rate'      => $gstRate,
        ];

        return response()->json(['success' => true, 'data' => compact('chart', 'summary')]);
    }

    public function products()
    {
        $products = Product::with('category:id,name')
            ->orderByDesc('sold_count')
            ->take(20)
            ->get(['id', 'name', 'sold_count', 'total_stock', 'avg_rating', 'base_price', 'sale_price', 'cost_price', 'category_id']);

        return response()->json(['success' => true, 'data' => $products]);
    }

    public function customers()
    {
        $data = User::where('role', 'customer')
            ->withCount('orders')
            ->withSum(['orders as total_spent' => fn($q) => $q->where('payment_status', 'paid')], 'total')
            ->orderByDesc('total_spent')
            ->take(20)
            ->get();

        return response()->json(['success' => true, 'data' => $data]);
    }

    public function inventory()
    {
        $variants = ProductVariant::with('product:id,name,stock_alert_qty')
            ->join('products', 'products.id', '=', 'product_variants.product_id')
            ->whereNull('products.deleted_at')
            ->whereRaw('product_variants.stock <= COALESCE(products.stock_alert_qty, 5)')
            ->select('product_variants.*')
            ->orderBy('product_variants.stock')
            ->get();

        $outOfStock = ProductVariant::where('stock', 0)->count();

        return response()->json(['success' => true, 'data' => compact('variants', 'outOfStock')]);
    }

    public function export(Request $request)
    {
        $type = $request->input('type', 'sales');
        $from = $request->input('from', now()->subDays(30)->format('Y-m-d'));
        $to   = $request->input('to',   now()->format('Y-m-d'));

        $rows = ["Order #,Customer,Email,Date,Subtotal,Discount,Shipping,Total,Status"];

        if ($type === 'sales') {
            Order::where('payment_status', 'paid')
                ->whereBetween('created_at', [$from . ' 00:00:00', $to . ' 23:59:59'])
                ->with('user')
                ->latest()
                ->chunk(500, function ($orders) use (&$rows) {
                    foreach ($orders as $o) {
                        $rows[] = implode(',', [
                            '"' . $o->order_number . '"',
                            '"' . ($o->user?->name  ?? 'N/A') . '"',
                            '"' . ($o->user?->email ?? 'N/A') . '"',
                            $o->created_at->format('d M Y'),
                            $o->subtotal, $o->discount, $o->shipping_charge, $o->total,
                            $o->status,
                        ]);
                    }
                });
        }

        $csv = implode("\n", $rows);

        return response($csv, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$type}-report-{$from}-to-{$to}.csv\"",
        ]);
    }
}
