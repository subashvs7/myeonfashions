import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { Plus, Pencil, Trash2, Zap, Clock, Tag, X } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY = {
  title: '',
  badge_text: 'FLASH SALE',
  discount_type: 'percentage',
  discount_value: '',
  starts_at: '',
  ends_at: '',
  is_active: true,
  sort_order: 0,
};

function validate(form) {
  const errors = {};
  if (!form.title.trim())           errors.title          = 'Title is required';
  if (!form.discount_value && form.discount_value !== 0)
                                    errors.discount_value = 'Discount value is required';
  if (Number(form.discount_value) < 0)
                                    errors.discount_value = 'Must be 0 or greater';
  if (form.discount_type === 'percentage' && Number(form.discount_value) > 100)
                                    errors.discount_value = 'Percentage cannot exceed 100';
  if (!form.starts_at)              errors.starts_at      = 'Start date is required';
  if (!form.ends_at)                errors.ends_at        = 'End date is required';
  if (form.starts_at && form.ends_at && form.ends_at <= form.starts_at)
                                    errors.ends_at        = 'End must be after start';
  return errors;
}

function toPayload(form) {
  return {
    ...form,
    discount_value: Number(form.discount_value),
    sort_order:     Number(form.sort_order) || 0,
  };
}

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="text-xs text-red-500 mt-1">{msg}</p>;
}

function SaleForm({ initial, onSave, onCancel, loading, apiErrors = {} }) {
  const [form, setForm]     = useState(initial);
  const [errors, setErrors] = useState({});
  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: undefined }));
  };

  const handleSave = () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onSave(toPayload(form));
  };

  const combined = { ...errors, ...apiErrors };

  return (
    <div className="bg-gray-50 border rounded-xl p-5 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Title */}
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-gray-600">Title <span className="text-red-500">*</span></label>
          <input
            className={`mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 ${combined.title ? 'border-red-400' : ''}`}
            value={form.title}
            onChange={e => set('title', e.target.value)}
            placeholder="e.g. Weekend Flash Sale"
          />
          <FieldError msg={combined.title} />
        </div>

        {/* Badge Text */}
        <div>
          <label className="text-xs font-medium text-gray-600">Badge Text</label>
          <input
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            value={form.badge_text}
            onChange={e => set('badge_text', e.target.value)}
            placeholder="FLASH SALE"
          />
        </div>

        {/* Discount Type */}
        <div>
          <label className="text-xs font-medium text-gray-600">Discount Type</label>
          <select
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            value={form.discount_type}
            onChange={e => set('discount_type', e.target.value)}
          >
            <option value="percentage">Percentage (%)</option>
            <option value="flat">Flat Amount (₹)</option>
          </select>
        </div>

        {/* Discount Value */}
        <div>
          <label className="text-xs font-medium text-gray-600">
            Discount Value <span className="text-red-500">*</span>
            <span className="text-gray-400 ml-1">({form.discount_type === 'percentage' ? '%' : '₹'})</span>
          </label>
          <input
            type="number"
            min="0"
            max={form.discount_type === 'percentage' ? 100 : undefined}
            step="0.01"
            className={`mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 ${combined.discount_value ? 'border-red-400' : ''}`}
            value={form.discount_value}
            onChange={e => set('discount_value', e.target.value)}
            placeholder={form.discount_type === 'percentage' ? '20' : '200'}
          />
          <FieldError msg={combined.discount_value} />
        </div>

        {/* Sort Order */}
        <div>
          <label className="text-xs font-medium text-gray-600">Sort Order</label>
          <input
            type="number"
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
            value={form.sort_order}
            onChange={e => set('sort_order', e.target.value)}
          />
        </div>

        {/* Starts At */}
        <div>
          <label className="text-xs font-medium text-gray-600">Starts At <span className="text-red-500">*</span></label>
          <input
            type="datetime-local"
            className={`mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 ${combined.starts_at ? 'border-red-400' : ''}`}
            value={form.starts_at}
            onChange={e => set('starts_at', e.target.value)}
          />
          <FieldError msg={combined.starts_at} />
        </div>

        {/* Ends At */}
        <div>
          <label className="text-xs font-medium text-gray-600">Ends At <span className="text-red-500">*</span></label>
          <input
            type="datetime-local"
            className={`mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/30 ${combined.ends_at ? 'border-red-400' : ''}`}
            value={form.ends_at}
            onChange={e => set('ends_at', e.target.value)}
          />
          <FieldError msg={combined.ends_at} />
        </div>

        {/* Active */}
        <div className="flex items-center gap-2 mt-1">
          <input
            type="checkbox"
            id="fs_active"
            checked={form.is_active}
            onChange={e => set('is_active', e.target.checked)}
            className="w-4 h-4 accent-brand-primary"
          />
          <label htmlFor="fs_active" className="text-sm text-gray-700">Active</label>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-5 py-2 bg-brand-primary text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-60"
        >
          {loading ? 'Saving…' : 'Save Flash Sale'}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function StatusBadge({ sale }) {
  const now   = new Date();
  const start = new Date(sale.starts_at);
  const end   = new Date(sale.ends_at);
  if (!sale.is_active)
    return <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-500">Inactive</span>;
  if (now < start)
    return <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700">Upcoming</span>;
  if (now > end)
    return <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-600">Expired</span>;
  return <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700 font-medium">● Live</span>;
}

const fmtDate = d =>
  d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const toLocal = iso => iso ? iso.slice(0, 16) : '';

export default function FlashSales() {
  const qc = useQueryClient();
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState(null);
  const [expanded, setExpanded]   = useState(null);
  const [formApiErrors, setFormApiErrors] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ['flash-sales'],
    queryFn:  adminApi.getFlashSales,
  });
  const sales = data?.data?.data ?? [];

  const extractApiErrors = (err) => {
    const errors = err?.response?.data?.errors ?? {};
    setFormApiErrors(errors);
    const msg = err?.response?.data?.message || 'Validation failed';
    toast.error(msg);
  };

  const create = useMutation({
    mutationFn: adminApi.createFlashSale,
    onSuccess: () => {
      qc.invalidateQueries(['flash-sales']);
      setShowForm(false);
      setFormApiErrors({});
      toast.success('Flash sale created');
    },
    onError: extractApiErrors,
  });

  const update = useMutation({
    mutationFn: ({ id, data }) => adminApi.updateFlashSale(id, data),
    onSuccess: () => {
      qc.invalidateQueries(['flash-sales']);
      setEditing(null);
      setFormApiErrors({});
      toast.success('Flash sale updated');
    },
    onError: extractApiErrors,
  });

  const remove = useMutation({
    mutationFn: adminApi.deleteFlashSale,
    onSuccess: () => { qc.invalidateQueries(['flash-sales']); toast.success('Deleted'); },
    onError:   () => toast.error('Failed to delete'),
  });

  const removeProduct = useMutation({
    mutationFn: ({ saleId, productId }) => adminApi.removeFlashSaleProduct(saleId, productId),
    onSuccess:  () => qc.invalidateQueries(['flash-sales']),
    onError:    () => toast.error('Failed to remove product'),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Zap size={20} className="text-yellow-500" /> Flash Sales
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Create limited-time deals on selected products</p>
        </div>
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setFormApiErrors({}); }}
            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-medium hover:opacity-90"
          >
            <Plus size={16} /> New Flash Sale
          </button>
        )}
      </div>

      {/* Create Form */}
      {showForm && (
        <SaleForm
          initial={EMPTY}
          onSave={d => create.mutate(d)}
          onCancel={() => { setShowForm(false); setFormApiErrors({}); }}
          loading={create.isLoading}
          apiErrors={formApiErrors}
        />
      )}

      {/* List */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading flash sales…</div>
      ) : sales.length === 0 && !showForm ? (
        <div className="text-center py-20 text-gray-400">
          <Zap size={48} className="mx-auto mb-4 opacity-20" />
          <p className="font-medium">No flash sales yet</p>
          <p className="text-sm mt-1">Create your first limited-time deal</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sales.map(sale => (
            <div key={sale.id} className="bg-white border rounded-xl shadow-sm overflow-hidden">
              {/* Edit Form */}
              {editing?.id === sale.id ? (
                <div className="p-5">
                  <SaleForm
                    initial={{
                      title:          sale.title,
                      badge_text:     sale.badge_text,
                      discount_type:  sale.discount_type,
                      discount_value: sale.discount_value,
                      starts_at:      toLocal(sale.starts_at),
                      ends_at:        toLocal(sale.ends_at),
                      is_active:      sale.is_active,
                      sort_order:     sale.sort_order,
                    }}
                    onSave={d => update.mutate({ id: sale.id, data: d })}
                    onCancel={() => { setEditing(null); setFormApiErrors({}); }}
                    loading={update.isLoading}
                    apiErrors={formApiErrors}
                  />
                </div>
              ) : (
                <>
                  {/* Sale Card Row */}
                  <div className="flex items-center justify-between p-4 gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center flex-shrink-0">
                        <Zap size={18} className="text-yellow-600" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-gray-900 truncate">{sale.title}</p>
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded font-bold whitespace-nowrap">
                            {sale.badge_text}
                          </span>
                          <StatusBadge sale={sale} />
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Tag size={11} />
                            {sale.discount_type === 'percentage'
                              ? `${sale.discount_value}% off`
                              : `₹${sale.discount_value} off`}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            {fmtDate(sale.starts_at)} → {fmtDate(sale.ends_at)}
                          </span>
                          <span>{sale.products?.length ?? 0} products</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setExpanded(expanded === sale.id ? null : sale.id)}
                        className="px-3 py-1.5 text-xs border rounded-lg hover:bg-gray-50 whitespace-nowrap"
                      >
                        {expanded === sale.id ? 'Hide' : `Products (${sale.products?.length ?? 0})`}
                      </button>
                      <button
                        onClick={() => { setEditing(sale); setFormApiErrors({}); }}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => { if (confirm(`Delete "${sale.title}"?`)) remove.mutate(sale.id); }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Products Panel */}
                  {expanded === sale.id && (
                    <div className="border-t px-4 pb-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-3 mb-2">
                        Products in this sale
                      </p>
                      {!sale.products?.length ? (
                        <p className="text-sm text-gray-400 py-2">
                          No products added yet. Assign products via the Products page.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {sale.products.map(p => (
                            <div key={p.id} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="text-sm font-medium text-gray-800">{p.name}</p>
                                <p className="text-xs text-gray-500">
                                  ₹{p.base_price}
                                  {p.sale_price && <span className="ml-1 text-green-600">→ ₹{p.sale_price}</span>}
                                </p>
                              </div>
                              <button
                                onClick={() => removeProduct.mutate({ saleId: sale.id, productId: p.id })}
                                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                              >
                                <X size={12} /> Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
