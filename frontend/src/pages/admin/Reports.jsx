import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { formatPrice } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import Button from '../../components/ui/Button';
import { Download, TrendingUp, Package, Users, Warehouse, IndianRupee, Receipt } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

const TABS = [
  { id: 'sales',     label: 'Sales',     icon: TrendingUp },
  { id: 'profit',    label: 'Profit',    icon: IndianRupee },
  { id: 'gst',       label: 'GST',       icon: Receipt },
  { id: 'products',  label: 'Products',  icon: Package },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'inventory', label: 'Inventory', icon: Warehouse },
];

function StatCard({ label, value, sub, color = 'text-brand-primary' }) {
  return (
    <div className="bg-white border p-5">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function DateRange({ from, to, setFrom, setTo }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="border px-3 py-2 text-sm focus:outline-none focus:border-brand-primary" />
      <span className="text-gray-400">to</span>
      <input type="date" value={to} onChange={e => setTo(e.target.value)} className="border px-3 py-2 text-sm focus:outline-none focus:border-brand-primary" />
    </div>
  );
}

export default function AdminReports() {
  const [tab, setTab]           = useState('sales');
  const [dateFrom, setDateFrom] = useState(() => new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10));
  const [dateTo, setDateTo]     = useState(() => new Date().toISOString().slice(0, 10));
  const [gstRate, setGstRate]   = useState('5');

  const { data: salesData } = useQuery({
    queryKey: ['report-sales', dateFrom, dateTo],
    queryFn: () => adminApi.salesReport({ from: dateFrom, to: dateTo }).then(r => r.data.data),
    enabled: tab === 'sales',
  });

  const { data: profitData } = useQuery({
    queryKey: ['report-profit', dateFrom, dateTo],
    queryFn: () => adminApi.profitReport({ from: dateFrom, to: dateTo }).then(r => r.data.data),
    enabled: tab === 'profit',
  });

  const { data: gstData } = useQuery({
    queryKey: ['report-gst', dateFrom, dateTo, gstRate],
    queryFn: () => adminApi.gstReport({ from: dateFrom, to: dateTo, rate: gstRate }).then(r => r.data.data),
    enabled: tab === 'gst',
  });

  const { data: productsData } = useQuery({
    queryKey: ['report-products'],
    queryFn: () => adminApi.productsReport().then(r => r.data.data),
    enabled: tab === 'products',
  });

  const { data: customersData } = useQuery({
    queryKey: ['report-customers'],
    queryFn: () => adminApi.customersReport().then(r => r.data.data),
    enabled: tab === 'customers',
  });

  const { data: inventoryData } = useQuery({
    queryKey: ['report-inventory'],
    queryFn: () => adminApi.inventoryReport().then(r => r.data.data),
    enabled: tab === 'inventory',
  });

  const handleExport = async () => {
    try {
      const res = await adminApi.exportReport({ type: tab, from: dateFrom, to: dateTo });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = `${tab}-report.csv`; a.click();
      window.URL.revokeObjectURL(url);
    } catch { alert('Export failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-brand-primary">Reports</h1>
        <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
          <Download size={16} /> Export CSV
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6 overflow-x-auto">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
              tab === id ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* ── Sales ─────────────────────────────────────────── */}
      {tab === 'sales' && (
        <div className="space-y-6">
          <DateRange from={dateFrom} to={dateTo} setFrom={setDateFrom} setTo={setDateTo} />
          {salesData && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <StatCard label="Total Revenue"   value={formatPrice(salesData.summary?.total_revenue || 0)} />
                <StatCard label="Total Orders"    value={salesData.summary?.total_orders || 0} color="text-brand-secondary" />
                <StatCard label="Avg Order Value" value={formatPrice(salesData.summary?.avg_order || 0)} color="text-indigo-600" />
                <StatCard label="Discount Given"  value={formatPrice(salesData.summary?.total_discount || 0)} color="text-orange-500" />
                <StatCard label="Shipping Earned" value={formatPrice(salesData.summary?.total_shipping || 0)} color="text-teal-600" />
              </div>

              {salesData.chart?.length > 0 && (
                <div className="bg-white border p-5">
                  <h3 className="font-medium mb-1">Daily Revenue</h3>
                  <p className="text-xs text-gray-400 mb-4">Payment received day by day</p>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={salesData.chart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={v => [formatPrice(v), 'Revenue']} labelFormatter={l => formatDate(l)} />
                      <Bar dataKey="revenue" fill="#7C3AED" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {salesData.chart?.length > 0 && (
                <div className="bg-white border p-5">
                  <h3 className="font-medium mb-4">Orders per Day</h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={salesData.chart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                      <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                      <Tooltip formatter={v => [v, 'Orders']} labelFormatter={l => formatDate(l)} />
                      <Line type="monotone" dataKey="orders" stroke="#EC4899" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Profit ─────────────────────────────────────────── */}
      {tab === 'profit' && (
        <div className="space-y-6">
          <DateRange from={dateFrom} to={dateTo} setFrom={setDateFrom} setTo={setDateTo} />
          {profitData ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Revenue"  value={formatPrice(profitData.summary?.total_revenue || 0)} />
                <StatCard label="Total Cost"     value={formatPrice(profitData.summary?.total_cost || 0)} color="text-red-500" />
                <StatCard label="Gross Profit"   value={formatPrice(profitData.summary?.gross_profit || 0)} color="text-green-600" />
                <StatCard label="Profit Margin"  value={`${profitData.summary?.margin || 0}%`} color="text-teal-600" />
              </div>

              {profitData.daily?.length > 0 && (
                <div className="bg-white border p-5">
                  <h3 className="font-medium mb-4">Daily Profit</h3>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={profitData.daily}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={v => [formatPrice(v)]} />
                      <Bar dataKey="revenue" fill="#7C3AED" name="Revenue" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="profit"  fill="#10B981" name="Profit"  radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {profitData.topProducts?.length > 0 && (
                <div className="bg-white border overflow-hidden">
                  <div className="px-5 py-3 border-b"><h3 className="font-medium">Top Products by Profit</h3></div>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr className="text-left text-xs uppercase text-gray-500">
                        <th className="px-4 py-3 font-medium">#</th>
                        <th className="px-4 py-3 font-medium">Product</th>
                        <th className="px-4 py-3 font-medium">Units</th>
                        <th className="px-4 py-3 font-medium">Revenue</th>
                        <th className="px-4 py-3 font-medium">Cost</th>
                        <th className="px-4 py-3 font-medium">Profit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {profitData.topProducts.map((p, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                          <td className="px-4 py-3 font-medium">{p.product_name}</td>
                          <td className="px-4 py-3">{p.units_sold}</td>
                          <td className="px-4 py-3">{formatPrice(p.revenue)}</td>
                          <td className="px-4 py-3 text-red-500">{formatPrice(p.cost)}</td>
                          <td className="px-4 py-3 font-semibold text-green-600">{formatPrice(p.profit)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!profitData.daily?.length && (
                <div className="bg-amber-50 border border-amber-200 p-4 text-sm text-amber-700">
                  No profit data yet. Cost price is captured for new orders. Add cost prices to your products to see profit tracking.
                </div>
              )}
            </>
          ) : <div className="p-8 text-center text-gray-400">Loading…</div>}
        </div>
      )}

      {/* ── GST ─────────────────────────────────────────── */}
      {tab === 'gst' && (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <DateRange from={dateFrom} to={dateTo} setFrom={setDateFrom} setTo={setDateTo} />
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">GST Rate</label>
              <select value={gstRate} onChange={e => setGstRate(e.target.value)}
                className="border px-3 py-2 text-sm focus:outline-none focus:border-brand-primary">
                {['0', '5', '12', '18', '28'].map(r => <option key={r} value={r}>{r}%</option>)}
              </select>
            </div>
          </div>

          {gstData && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard label="Total Revenue"  value={formatPrice(gstData.summary?.total_revenue || 0)} />
                <StatCard label="Taxable Value"  value={formatPrice(gstData.summary?.taxable_value || 0)} color="text-indigo-600" />
                <StatCard label="Total GST"      value={formatPrice(gstData.summary?.total_gst || 0)} color="text-orange-500" />
              </div>

              <div className="bg-white border p-5">
                <h3 className="font-medium mb-4">GST Breakdown (CGST + SGST @ {gstRate}%)</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="border p-4 text-center">
                    <p className="text-xs text-gray-500">CGST ({gstRate / 2}%)</p>
                    <p className="text-xl font-bold text-brand-primary">{formatPrice(gstData.summary?.cgst || 0)}</p>
                  </div>
                  <div className="border p-4 text-center">
                    <p className="text-xs text-gray-500">SGST ({gstRate / 2}%)</p>
                    <p className="text-xl font-bold text-brand-primary">{formatPrice(gstData.summary?.sgst || 0)}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400">* GST calculated as inclusive (extracted from collected revenue). Consult your CA for filing.</p>
              </div>

              {gstData.chart?.length > 0 && (
                <div className="bg-white border p-5">
                  <h3 className="font-medium mb-4">Daily GST Collection</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={gstData.chart}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                      <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={v => [formatPrice(v)]} />
                      <Bar dataKey="taxable" fill="#6366F1" name="Taxable Value" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="gst"     fill="#F59E0B" name="GST"           radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Products ─────────────────────────────────────────── */}
      {tab === 'products' && productsData && (
        <div className="bg-white border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-xs uppercase text-gray-500">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Units Sold</th>
                <th className="px-4 py-3 font-medium">MRP</th>
                <th className="px-4 py-3 font-medium">Cost</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {productsData.map((p, i) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-gray-500">{p.category?.name || '—'}</td>
                  <td className="px-4 py-3 font-semibold">{p.sold_count}</td>
                  <td className="px-4 py-3">{formatPrice(p.sale_price || p.base_price)}</td>
                  <td className="px-4 py-3 text-gray-500">{p.cost_price ? formatPrice(p.cost_price) : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={p.total_stock === 0 ? 'text-red-600' : p.total_stock < 5 ? 'text-yellow-600' : 'text-gray-700'}>
                      {p.total_stock}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-yellow-500">{p.avg_rating ? `★ ${p.avg_rating}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Customers ─────────────────────────────────────────── */}
      {tab === 'customers' && customersData && (
        <div className="bg-white border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-xs uppercase text-gray-500">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Orders</th>
                <th className="px-4 py-3 font-medium">Total Spent</th>
                <th className="px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {customersData.map((c, i) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-gray-400">{c.email}</p>
                  </td>
                  <td className="px-4 py-3">{c.orders_count}</td>
                  <td className="px-4 py-3 font-semibold text-brand-primary">{formatPrice(c.total_spent || 0)}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Inventory ─────────────────────────────────────────── */}
      {tab === 'inventory' && inventoryData && (
        <div className="space-y-4">
          {inventoryData.outOfStock > 0 && (
            <div className="bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {inventoryData.outOfStock} variant{inventoryData.outOfStock !== 1 ? 's' : ''} are currently out of stock.
            </div>
          )}
          <div className="bg-white border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr className="text-left text-xs uppercase text-gray-500">
                  <th className="px-4 py-3 font-medium">Product</th>
                  <th className="px-4 py-3 font-medium">SKU</th>
                  <th className="px-4 py-3 font-medium">Stock</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(inventoryData.variants || []).map(v => (
                  <tr key={v.id} className={`hover:bg-gray-50 ${v.stock === 0 ? 'bg-red-50/40' : 'bg-yellow-50/30'}`}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{v.product?.name}</p>
                      <p className="text-xs text-gray-400">{[v.size, v.color].filter(Boolean).join(' / ') || 'Default'}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{v.sku || '—'}</td>
                    <td className="px-4 py-3 font-semibold">{v.stock}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${v.stock === 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                        {v.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                      </span>
                    </td>
                  </tr>
                ))}
                {!(inventoryData.variants || []).length && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">All stock levels are healthy</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
