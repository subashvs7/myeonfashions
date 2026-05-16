import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { Sparkles, Search } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewArrivals() {
  const qc = useQueryClient();
  const [search, setSearch]   = useState('');
  const [filter, setFilter]   = useState('all');
  const [page, setPage]       = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['new-arrivals', search, filter, page],
    queryFn: () => adminApi.getNewArrivals({ search, filter, page }),
    keepPreviousData: true,
  });

  const products  = data?.data?.data?.data ?? [];
  const paginator = data?.data?.data ?? {};

  const toggle = useMutation({
    mutationFn: adminApi.toggleNewArrival,
    onSuccess: (res, id) => {
      qc.invalidateQueries(['new-arrivals']);
      toast.success(res.data.is_new_arrival ? 'Marked as New Arrival' : 'Removed from New Arrivals');
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles size={20} className="text-purple-500" /> New Arrivals
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">Toggle which products appear in the New Arrivals section</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 pr-3 py-2 border rounded-lg text-sm w-56"
            placeholder="Search products..." />
        </div>
        <div className="flex border rounded-lg overflow-hidden text-sm">
          {[['all', 'All Products'], ['marked', 'New Arrivals Only']].map(([v, l]) => (
            <button key={v} onClick={() => { setFilter(v); setPage(1); }}
              className={`px-4 py-2 ${filter === v ? 'bg-brand-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Sparkles size={40} className="mx-auto mb-3 opacity-30" />
          <p>No products found</p>
        </div>
      ) : (
        <>
          <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Price</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Added</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">New Arrival</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{p.name}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {p.sale_price ? (
                        <span><span className="line-through text-gray-400 mr-1">₹{p.base_price}</span>₹{p.sale_price}</span>
                      ) : `₹${p.base_price}`}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.status === 'active' ? 'bg-green-100 text-green-700' :
                        p.status === 'draft'  ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-500'
                      }`}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(p.created_at).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggle.mutate(p.id)}
                        disabled={toggle.isLoading}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          p.is_new_arrival ? 'bg-purple-500' : 'bg-gray-200'
                        }`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          p.is_new_arrival ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {paginator.last_page > 1 && (
            <div className="flex items-center justify-between text-sm text-gray-600">
              <p>Showing {products.length} of {paginator.total} products</p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
                  className="px-3 py-1.5 border rounded hover:bg-gray-50 disabled:opacity-40">Prev</button>
                <span className="px-3 py-1.5">{page} / {paginator.last_page}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={page === paginator.last_page}
                  className="px-3 py-1.5 border rounded hover:bg-gray-50 disabled:opacity-40">Next</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
