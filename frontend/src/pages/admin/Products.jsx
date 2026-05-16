import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import { formatPrice } from '../../utils/formatCurrency';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Plus, Edit2, Trash2, Search, Upload, Download, X, CheckCircle, AlertCircle, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';

function ImportModal({ onClose, onDone }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext)) {
      toast.error('Only .csv, .xlsx, .xls files are supported');
      return;
    }
    setFile(f);
    setResult(null);
  };

  const downloadTemplate = async () => {
    try {
      const res = await adminApi.importTemplate();
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'products_import_template.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Failed to download template');
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const res = await adminApi.importProducts(file);
      setResult(res.data.data);
      onDone();
    } catch (e) {
      const msg = e.response?.data?.message || 'Import failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white w-full max-w-lg shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={20} className="text-brand-primary" />
            <h2 className="font-heading font-bold text-brand-primary">Bulk Import Products</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Template download */}
          <div className="bg-brand-bg rounded p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-brand-primary">Step 1: Download Template</p>
              <p className="text-xs text-gray-500 mt-0.5">Fill in the CSV with your product data</p>
            </div>
            <button onClick={downloadTemplate}
              className="flex items-center gap-1.5 text-sm text-brand-secondary border border-brand-secondary px-3 py-1.5 hover:bg-brand-secondary hover:text-white transition-colors whitespace-nowrap">
              <Download size={14} /> Get Template
            </button>
          </div>

          {/* File drop zone */}
          <div>
            <p className="text-sm font-medium text-brand-primary mb-2">Step 2: Upload your file</p>
            <div
              onClick={() => inputRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
              className={`border-2 border-dashed rounded cursor-pointer transition-colors p-8 text-center
                ${dragging ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-200 hover:border-brand-primary/50'}`}>
              <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden"
                onChange={(e) => handleFile(e.target.files[0])} />
              {file ? (
                <div className="flex items-center justify-center gap-2 text-brand-primary">
                  <FileSpreadsheet size={20} />
                  <span className="text-sm font-medium">{file.name}</span>
                  <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null); }}
                    className="text-gray-400 hover:text-red-500 ml-1"><X size={14} /></button>
                </div>
              ) : (
                <div className="text-gray-400">
                  <Upload size={28} className="mx-auto mb-2" />
                  <p className="text-sm">Drag & drop or click to choose a file</p>
                  <p className="text-xs mt-1">.csv, .xlsx, .xls supported</p>
                </div>
              )}
            </div>
          </div>

          {/* Result */}
          {result && (
            <div className="border rounded p-4 space-y-3">
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-brand-success font-medium">
                  <CheckCircle size={16} /> {result.imported} imported
                </span>
                {result.skipped?.length > 0 && (
                  <span className="flex items-center gap-1.5 text-yellow-600 font-medium">
                    <AlertCircle size={16} /> {result.skipped.length} skipped
                  </span>
                )}
              </div>
              {result.skipped?.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-100 rounded p-3 max-h-36 overflow-y-auto">
                  {result.skipped.map((msg, i) => (
                    <p key={i} className="text-xs text-yellow-700 leading-relaxed">{msg}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={handleImport} loading={loading} disabled={!file || loading}
            className="flex items-center gap-2">
            <Upload size={15} /> Import
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminProducts() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showImport, setShowImport] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', search, page],
    queryFn: () => adminApi.getProducts({ search, page, per_page: 20 }).then(r => r.data.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteProduct(id),
    onSuccess: () => { qc.invalidateQueries(['admin-products']); toast.success('Product deleted'); },
    onError: () => toast.error('Failed to delete product'),
  });

  const products = data?.data || [];
  const meta = { last_page: data?.last_page || 1, current_page: data?.current_page || 1 };

  return (
    <div>
      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onDone={() => qc.invalidateQueries(['admin-products'])}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-brand-primary">Products</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowImport(true)}
            className="flex items-center gap-1.5 border px-3 py-2 text-sm text-gray-600 hover:border-brand-primary hover:text-brand-primary transition-colors">
            <Upload size={15} /> Import
          </button>
          <Link to="/admin/products/new">
            <Button className="flex items-center gap-2"><Plus size={16} /> Add Product</Button>
          </Link>
        </div>
      </div>

      <div className="bg-white border p-4 mb-4">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products..." className="w-full pl-9 pr-3 py-2 border text-sm focus:outline-none focus:border-brand-primary" />
        </div>
      </div>

      <div className="bg-white border overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr className="text-left text-xs uppercase text-gray-500">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.primary_image?.image_path ? (
                        <img
                          src={`/storage/${p.primary_image.image_path}`}
                          alt={p.name}
                          className="w-10 h-12 object-cover flex-shrink-0 rounded border border-gray-100"
                        />
                      ) : (
                        <div className="w-10 h-12 bg-gray-100 flex-shrink-0 rounded border border-gray-100 flex items-center justify-center text-gray-300 text-xs">
                          No img
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-gray-400">SKU: {p.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.category?.name}</td>
                  <td className="px-4 py-3">
                    <div>
                      <span className="font-medium">{formatPrice(p.current_price)}</span>
                      {p.sale_price && <span className="text-xs text-gray-400 line-through ml-1">{formatPrice(p.base_price)}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={p.total_stock < 5 ? 'text-red-600 font-medium' : ''}>{p.total_stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={p.status === 'active' ? 'success' : 'default'}>{p.status === 'active' ? 'Active' : 'Draft'}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link to={`/admin/products/${p.id}/edit`} className="p-1 text-gray-400 hover:text-brand-primary">
                        <Edit2 size={15} />
                      </Link>
                      <button onClick={() => { if (confirm('Delete this product?')) deleteMutation.mutate(p.id); }}
                        className="p-1 text-gray-400 hover:text-red-500">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!products.length && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No products found</td></tr>}
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
