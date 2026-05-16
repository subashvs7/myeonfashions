import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { X, Trash2 } from 'lucide-react';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [newImages, setNewImages] = useState([]);
  const [form, setForm] = useState(null);

  const { data: product, refetch: refetchProduct } = useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => adminApi.getProduct(id).then(r => r.data.data ?? null),
  });

  // Use admin API — returns all categories regardless of active/menu status
  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => adminApi.getCategories().then(r => r.data.data ?? []),
  });

  useEffect(() => {
    if (product) {
      setForm({
        name:              product.name              || '',
        description:       product.description       || '',
        category_id:       product.category_id       || '',
        base_price:        product.base_price        || '',
        sale_price:        product.sale_price        || '',
        cost_price:        product.cost_price        || '',
        sku:               product.sku               || '',
        status:            product.status            || 'active',
        is_featured:       product.is_featured       ?? false,
        is_new_arrival:    product.is_new_arrival    ?? false,
        fabric:            product.fabric            || '',
        care_instructions: product.care_instructions || '',
        tags:              product.tags              || '',
        meta_title:        product.meta_title        || '',
        meta_description:  product.meta_description  || '',
      });
    }
  }, [product]);

  const flatCategories = [];
  categories.forEach(root => {
    flatCategories.push(root);
    root.children?.forEach(child => {
      flatCategories.push({ ...child, name: `– ${child.name}` });
      child.children?.forEach(sub => {
        flatCategories.push({ ...sub, name: `  – ${sub.name}` });
      });
    });
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Send product data as JSON
      const payload = {};
      Object.entries(form).forEach(([k, v]) => { if (v !== '' && v !== null) payload[k] = v; });

      await adminApi.updateProduct(id, payload);

      // Upload new images separately if any were selected
      if (newImages.length > 0) {
        const imgFd = new FormData();
        newImages.forEach(img => imgFd.append('images[]', img));
        await adminApi.uploadProductImages(id, imgFd);
        setNewImages([]);
      }

      toast.success('Product updated!');
      navigate('/admin/products');
    } catch (e) {
      const errors = e.response?.data?.errors;
      const msg = errors
        ? Object.values(errors)[0][0]
        : (e.response?.data?.message || 'Failed to update product');
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const deleteImageMutation = useMutation({
    mutationFn: (imgId) => adminApi.deleteProductImage(id, imgId),
    onSuccess: () => {
      refetchProduct();
      toast.success('Image removed');
    },
    onError: () => toast.error('Failed to remove image'),
  });

  if (!form) return <div className="h-48 bg-gray-100 animate-pulse" />;

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-brand-primary mb-6">Edit Product</h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        <div className="bg-white border p-5 space-y-4">
          <h3 className="font-medium">Basic Information</h3>
          <Input label="Product Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={4} className="w-full border px-3 py-2 text-sm focus:outline-none focus:border-brand-primary resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                className="w-full border px-3 py-2 text-sm focus:outline-none focus:border-brand-primary">
                <option value="">Select category</option>
                {flatCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <Input label="SKU" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="MRP (₹)" type="number" step="0.01" value={form.base_price} onChange={e => setForm(f => ({ ...f, base_price: e.target.value }))} required />
            <Input label="Sale Price (₹)" type="number" step="0.01" value={form.sale_price} onChange={e => setForm(f => ({ ...f, sale_price: e.target.value }))} />
            <Input label="Cost Price (₹)" type="number" step="0.01" value={form.cost_price} onChange={e => setForm(f => ({ ...f, cost_price: e.target.value }))} />
          </div>
          <p className="text-xs text-gray-400 -mt-2">Cost price is used for profit calculation — not shown to customers.</p>
          <Input label="Fabric / Material" value={form.fabric} onChange={e => setForm(f => ({ ...f, fabric: e.target.value }))} />
          <Input label="Care Instructions" value={form.care_instructions} onChange={e => setForm(f => ({ ...f, care_instructions: e.target.value }))} />
          <Input label="Tags (comma separated)" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
          <div className="flex gap-6 pt-1">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.status === 'active'} onChange={e => setForm(f => ({ ...f, status: e.target.checked ? 'active' : 'draft' }))} className="accent-brand-primary" />
              Active
            </label>
            {[['is_featured','Featured'],['is_new_arrival','New Arrival']].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))} className="accent-brand-primary" />
                {label}
              </label>
            ))}
          </div>
        </div>

        {/* SEO */}
        <div className="bg-white border p-5 space-y-4">
          <h3 className="font-medium">SEO</h3>
          <Input label="Meta Title" value={form.meta_title} onChange={e => setForm(f => ({ ...f, meta_title: e.target.value }))} placeholder="Leave blank to use product name" />
          <div>
            <label className="block text-sm font-medium mb-1">Meta Description</label>
            <textarea value={form.meta_description} onChange={e => setForm(f => ({ ...f, meta_description: e.target.value }))}
              rows={2} placeholder="Brief description for search engines (max 160 chars)"
              maxLength={160}
              className="w-full border px-3 py-2 text-sm focus:outline-none focus:border-brand-primary resize-none" />
            <p className="text-xs text-gray-400 mt-0.5">{form.meta_description.length}/160</p>
          </div>
        </div>

        {/* Existing images */}
        {product?.images?.length > 0 && (
          <div className="bg-white border p-5">
            <h3 className="font-medium mb-3">Current Images</h3>
            <div className="flex gap-2 flex-wrap">
              {product.images.map(img => (
                <div key={img.id} className="relative group">
                  <img src={img.url ? img.url : `/storage/${img.image_path}`} alt="" className="w-20 h-24 object-cover" />
                  <button type="button"
                    onClick={() => deleteImageMutation.mutate(img.id)}
                    disabled={deleteImageMutation.isPending}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New images */}
        <div className="bg-white border p-5">
          <h3 className="font-medium mb-3">Add Images</h3>
          <input type="file" accept="image/*" multiple
            onChange={e => setNewImages(Array.from(e.target.files))}
            className="text-sm text-gray-500" />
          {newImages.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {newImages.map((img, i) => (
                <div key={i} className="relative">
                  <img src={URL.createObjectURL(img)} alt="" className="w-16 h-20 object-cover" />
                  <button type="button" onClick={() => setNewImages(imgs => imgs.filter((_, idx) => idx !== i))}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white flex items-center justify-center">
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button type="submit" loading={loading}>Save Changes</Button>
          <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
