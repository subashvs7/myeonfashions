import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import Button from '../../components/ui/Button';
import { Search, AlertTriangle, Package } from 'lucide-react';
import toast from 'react-hot-toast';

function stockClass(stock) {
  if (stock === 0) return 'text-red-600 font-semibold';
  if (stock <= 5)  return 'text-yellow-600 font-semibold';
  return 'text-gray-800';
}

export default function AdminInventory() {
  const qc = useQueryClient();
  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [stockValue, setStockValue] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-inventory', search, page],
    queryFn: () => adminApi.getInventory({ search, page, per_page: 25 }).then(r => r.data.data),
  });

  const { data: lowStock = [] } = useQuery({
    queryKey: ['low-stock'],
    queryFn: () => adminApi.getLowStock().then(r => r.data.data),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, stock }) => adminApi.updateStock(id, { stock }),
    onSuccess: () => {
      qc.invalidateQueries(['admin-inventory']);
      qc.invalidateQueries(['low-stock']);
      toast.success('Stock updated');
      setEditingId(null);
    },
    onError: () => toast.error('Failed to update stock'),
  });

  const variants = data?.data || [];
  const meta = { last_page: data?.last_page || 1, current_page: data?.current_page || 1, total: data?.total || 0 };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-brand-primary mb-6">Inventory</h1>

      {lowStock.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-4 mb-6 flex items-start gap-3">
          <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-red-700 text-sm">
              {lowStock.length} variant{lowStock.length !== 1 ? 's' : ''} low on stock
            </p>
            <p className="text-xs text-red-500 mt-0.5">
              {lowStock.slice(0, 3).map(v => v.product?.name).filter(Boolean).join(', ')}
              {lowStock.length > 3 ? ` and ${lowStock.length - 3} more…` : ''}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white border p-4 mb-4 flex items-center gap-4">
        <div className="relative max-w-sm flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products..."
            className="w-full pl-9 pr-3 py-2 border text-sm focus:outline-none focus:border-brand-primary"
          />
        </div>
        {meta.total > 0 && (
          <span className="text-xs text-gray-400 ml-auto">{meta.total} variant{meta.total !== 1 ? 's' : ''}</span>
        )}
      </div>

      <div className="bg-white border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-xs uppercase text-gray-500">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Variant</th>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {variants.map(v => (
                <tr key={v.id} className={`hover:bg-gray-50 ${v.stock <= 5 ? 'bg-red-50/30' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Package size={14} className="text-gray-300 shrink-0" />
                      <span className="font-medium">{v.product?.name || '—'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {[v.size, v.color].filter(Boolean).join(' / ') || 'Default'}
                  </td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{v.sku || '—'}</td>
                  <td className="px-4 py-3">
                    {editingId === v.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={stockValue}
                          onChange={e => setStockValue(e.target.value)}
                          autoFocus
                          className="w-20 border px-2 py-1 text-sm focus:outline-none focus:border-brand-primary"
                        />
                        <button
                          onClick={() => updateMutation.mutate({ id: v.id, stock: parseInt(stockValue, 10) })}
                          disabled={updateMutation.isPending}
                          className="text-xs text-green-600 font-medium hover:underline disabled:opacity-50"
                        >
                          {updateMutation.isPending ? 'Saving…' : 'Save'}
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-xs text-gray-400 hover:underline">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className={stockClass(v.stock)}>{v.stock}</span>
                        {v.stock === 0 && (
                          <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Out</span>
                        )}
                        {v.stock > 0 && v.stock <= 5 && (
                          <AlertTriangle size={12} className="text-yellow-500" />
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId !== v.id && (
                      <button
                        onClick={() => { setEditingId(v.id); setStockValue(String(v.stock)); }}
                        className="text-xs text-brand-secondary hover:underline"
                      >
                        Update
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!variants.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400">No items found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {meta.last_page > 1 && (
          <div className="px-4 py-3 border-t flex items-center justify-between text-sm">
            <span className="text-gray-500">Page {meta.current_page} of {meta.last_page}</span>
            <div className="flex gap-2">
              <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
              <Button variant="outline" disabled={page === meta.last_page} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
