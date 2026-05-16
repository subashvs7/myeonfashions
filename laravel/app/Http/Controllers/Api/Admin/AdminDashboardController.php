<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AdminDashboardController extends Controller
{
    public function index()
    {
        $today     = now()->startOfDay();
        $thisMonth = now()->startOfMonth();

        $stats = [
            'total_revenue'    => Order::where('payment_status', 'paid')->sum('total'),
            'today_revenue'    => Order::where('payment_status', 'paid')->where('created_at', '>=', $today)->sum('total'),
            'month_revenue'    => Order::where('payment_status', 'paid')->where('created_at', '>=', $thisMonth)->sum('total'),
            'total_orders'     => Order::count(),
            'pending_orders'   => Order::where('status', 'pending')->count(),
            'total_customers'  => User::where('role', 'customer')->count(),
            'total_products'   => Product::where('status', 'active')->count(),
            'low_stock'        => Product::where('total_stock', '<=', DB::raw('stock_alert_qty'))->count(),
        ];

        $recentOrders = Order::with('user')->latest()->take(5)->get();

        $salesChart = Order::where('payment_status', 'paid')
            ->where('created_at', '>=', now()->subDays(30))
            ->selectRaw('DATE(created_at) as date, SUM(total) as revenue, COUNT(*) as orders')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $topProducts = Product::withCount('reviews')
            ->orderByDesc('sold_count')
            ->take(5)
            ->get(['id','name','sold_count','avg_rating','total_stock']);

        return response()->json([
            'success' => true,
            'data'    => compact('stats', 'recentOrders', 'salesChart', 'topProducts'),
        ]);
    }
}
