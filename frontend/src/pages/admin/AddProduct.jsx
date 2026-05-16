import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { Plus, X } from 'lucide-react';

const EMPTY_VARIANT = { size: '', color: '', color_hex: '', sku: '', price: '', stock: '' };

export default function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([{ ...EMPTY_VARIANT }]);
  const [form, setForm] = useState({
    name: '', description: '', category_id: '', base_price: '', sale_price: '',
    cost_price: '', sku: '', status: 'active', is_featured: false, is_new_arrival: false,
    fabric: '', care_instructions: '', tags: '',
    meta_title: '', meta_description: '',
  });

  // Use admin API — returns all categories regardless of active/menu status
  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => adminApi.getCategories().then(r => r.data.data),
  });

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
      // Send product data as JSON (no files in this request)
      const payload = {};
      Object.entries(form).forEach(([k, v]) => { if (v !== '' && v !== null) payload[k] = v; });

      // Only include variants that have both sku and price filled
      const filledVariants = variants
        .map(v => Object.fromEntries(Object.entries(v).filter(([, val]) => val !== '')))
        .filter(v => v.sku && v.price);

      if (filledVariants.length > 0) {
        payload.variants = filledVariants;
        payload.has_variants = true;
      }

      const res = await adminApi.createProduct(payload);
      const productId = res.data.data.id;

      // Upload images separately if any were selected
      if (images.length > 0) {
        const imgFd = new FormData();
        images.forEach(img => imgFd.append('images[]', img));
        await adminApi.uploadProductImages(productId, imgFd);
      }

      toast.success('Product created!');
      navigate('/admin/products');
    } catch (e) {
      const errors = e.response?.data?.errors;
      const msg = errors
        ? Object.values(errors)[0][0]
        : (e.response?.data?.message || 'Failed to create product');
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const addVariant    = () => setVariants(v => [...v, { ...EMPTY_VARIANT }]);
  const removeVariant = (i) => setVariants(v => v.filter((_, idx) => idx !== i));
  const updateVariant = (i, key, val) => setVariants(v => v.map((item, idx) => idx === i ? { ...item, [key]: val } : item));

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-brand-primary mb-6">Add Product</h1>
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
              <label className="block text-sm font-medium mb-1">Category <span className="text-red-500">*</span></label>
              <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} required
                className="w-full border px-3 py-2 text-sm focus:outline-none focus:border-brand-primary">
                <option value="">Select category</option>
                {flatCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <Input label="SKU" value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="MRP (₹)" type="number" step="0.01" value={form.base_price} onChange={e => setForm(f => ({ ...f, base_price: e.target.value }))} required />
            <Input label="Sale Price (₹)" type="number" step="0.01" value={form.sale_price} onChange={e => setForm(f => ({ ...f, sale_price: e.target.value }))} />
            <Input label="Cost Price (₹)" type="number" step="0.01" value={form.cost_price} onChange={e => setForm(f => ({ ...f, cost_price: e.target.value }))} />
          </div>
          <p className="text-xs text-gray-400 -mt-2">Cost price is used for profit calculation — not shown to customers.</p>
          <Input label="Fabric / Material" value={form.fabric} onChange={e => setForm(f => ({ ...f, fabric: e.target.value }))} />
          <Input label="Care Instructions" value={form.care_instructions} onChange={e => setForm(f => ({ ...f, care_instructions: e.target.value }))} />
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
          <h3 className="font-medium">SEO &amp; Visibility</h3>
          <Input label="Tags (comma separated)" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="salwar, ethnic, cotton, summer" />
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

        {/* Images */}
        <div className="bg-white border p-5">
          <h3 className="font-medium mb-3">Images</h3>
          <input type="file" accept="image/*" multiple onChange={e => setImages(Array.from(e.target.files))}
            className="text-sm text-gray-500" />
          {images.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {images.map((img, i) => (
                <div key={i} className="relative">
                  <img src={URL.createObjectURL(img)} alt="" className="w-16 h-20 object-cover" />
                  <button type="button" onClick={() => setImages(imgs => imgs.filter((_, idx) => idx !== i))}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white flex items-center justify-center">
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Variants */}
        <div className="bg-white border p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Variants</h3>
            <button type="button" onClick={addVariant} className="text-sm text-brand-secondary hover:underline flex items-center gap-1">
              <Plus size={14} /> Add Variant
            </button>
          </div>
          <div className="space-y-3">
            {variants.map((v, i) => (
              <div key={i} className="grid grid-cols-6 gap-2 items-end">
                {[['size','Size'],['color','Color'],['color_hex','Hex'],['sku','SKU *'],['price','Price *'],['stock','Stock']].map(([key, label]) => (
                  <div key={key}>
                    {i === 0 && <label className="block text-xs text-gray-500 mb-1">{label}</label>}
                    <input value={v[key]} onChange={e => updateVariant(i, key, e.target.value)}
                      placeholder={label} className="w-full border px-2 py-1.5 text-xs focus:outline-none focus:border-brand-primary" />
                  </div>
                ))}
                {variants.length > 1 && (
                  <button type="button" onClick={() => removeVariant(i)} className="text-red-400 hover:text-red-600">
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">Variants with both SKU and Price filled will be saved.</p>
        </div>

        <div className="flex gap-3">
          <Button type="submit" loading={loading}>Create Product</Button>
          <Button type="button" variant="outline" onClick={() => navigate('/admin/products')}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
