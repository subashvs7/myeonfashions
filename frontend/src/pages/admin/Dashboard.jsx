import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { formatPrice } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { TrendingUp, ShoppingBag, Users, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Badge from '../../components/ui/Badge';

const STATUS_VARIANT = { pending:'warning', confirmed:'info', delivered:'success', cancelled:'danger' };

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.dashboard().then(r => r.data.data),
  });

  const stats      = data?.stats      || {};
  const chart      = data?.salesChart || [];
  const recent     = data?.recentOrders || [];
  const topProducts = data?.topProducts || [];

  const statCards = [
    { label: 'Total Revenue',    value: formatPrice(stats.total_revenue  || 0), icon: TrendingUp,    color: 'text-brand-primary' },
    { label: 'Total Orders',     value: stats.total_orders   || 0,              icon: ShoppingBag,   color: 'text-brand-secondary' },
    { label: 'Total Customers',  value: stats.total_customers || 0,             icon: Users,         color: 'text-brand-accent' },
    { label: 'Low Stock Items',  value: stats.low_stock      || 0,              icon: AlertTriangle, color: 'text-red-500' },
  ];

  if (isLoading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-100 animate-pulse" />)}</div>
      <div className="h-72 bg-gray-100 animate-pulse" />
    </div>
  );

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-brand-primary mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
              </div>
              <Icon size={24} className={`${color} opacity-60`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        <div className="xl:col-span-2 bg-white border p-5">
          <h3 className="font-medium mb-4">Sales (Last 30 Days)</h3>
          {chart.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chart}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [formatPrice(v), 'Revenue']} labelFormatter={l => formatDate(l)} />
                <Bar dataKey="revenue" fill="#7C3AED" radius={[2,2,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No sales data yet</div>}
        </div>

        <div className="bg-white border p-5">
          <h3 className="font-medium mb-4">Top Products</h3>
          <div className="space-y-3">
            {topProducts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-300 w-4">{i+1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.sold_count} sold</p>
                </div>
              </div>
            ))}
            {!topProducts.length && <p className="text-sm text-gray-400">No products sold yet</p>}
          </div>
        </div>
      </div>

      <div className="bg-white border p-5">
        <h3 className="font-medium mb-4">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500 text-xs uppercase">
                <th className="pb-2 font-medium">Order</th>
                <th className="pb-2 font-medium">Customer</th>
                <th className="pb-2 font-medium">Date</th>
                <th className="pb-2 font-medium">Total</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recent.map(o => (
                <tr key={o.id}>
                  <td className="py-2 font-medium">#{o.order_number}</td>
                  <td className="py-2 text-gray-600">{o.user?.name}</td>
                  <td className="py-2 text-gray-500">{formatDate(o.created_at)}</td>
                  <td className="py-2 font-medium">{formatPrice(o.total)}</td>
                  <td className="py-2"><Badge variant={STATUS_VARIANT[o.status] || 'default'}>{o.status}</Badge></td>
                </tr>
              ))}
              {!recent.length && <tr><td colSpan={5} className="py-4 text-gray-400 text-center">No orders yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
