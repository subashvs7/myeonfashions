import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { Plus, Edit2, Trash2, ChevronRight, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY = { name: '', parent_id: '', description: '', is_active: true, show_in_menu: true };

// Build a flat list of options for the parent selector:
// shows roots (indent 0) + children (indent 1) — sub-children can't be parents (max 3 levels)
function buildParentOptions(roots) {
  const opts = [];
  roots.forEach(root => {
    opts.push({ id: root.id, name: root.name, level: 0 });
    root.children?.forEach(child => {
      opts.push({ id: child.id, name: child.name, level: 1 });
    });
  });
  return opts;
}

export default function AdminCategories() {
  const qc = useQueryClient();
  const [editing, setEditing]     = useState(null);
  const [adding, setAdding]       = useState(false);
  const [form, setForm]           = useState(EMPTY);
  const [expanded, setExpanded]   = useState({});

  // Backend returns only root categories with children.children nested
  const { data: roots = [] } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => adminApi.getCategories().then(r => r.data.data),
  });

  const saveMutation = useMutation({
    mutationFn: (data) =>
      editing ? adminApi.updateCategory(editing.id, data) : adminApi.createCategory(data),
    onSuccess: () => {
      qc.invalidateQueries(['admin-categories']);
      toast.success(editing ? 'Category updated' : 'Category created');
      setEditing(null); setAdding(false); setForm(EMPTY);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to save category'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteCategory(id),
    onSuccess: () => { qc.invalidateQueries(['admin-categories']); toast.success('Deleted'); },
    onError: () => toast.error('Cannot delete — has sub-categories or products'),
  });

  const startEdit = (cat) => {
    setEditing(cat);
    setForm({
      name:         cat.name,
      parent_id:    cat.parent_id || '',
      description:  cat.description || '',
      is_active:    cat.is_active,
      show_in_menu: cat.show_in_menu,
    });
    setAdding(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggle = (id) => setExpanded(e => ({ ...e, [id]: e[id] === false }));
  const isOpen = (id)  => expanded[id] !== false; // default open

  const parentOptions = buildParentOptions(roots);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold text-brand-primary">Categories</h1>
        {!adding && !editing && (
          <Button onClick={() => { setAdding(true); setForm(EMPTY); }}
            className="flex items-center gap-2">
            <Plus size={16} /> Add Category
          </Button>
        )}
      </div>

      {/* Form */}
      {(adding || editing) && (
        <div className="bg-white border p-5 mb-6">
          <h3 className="font-medium mb-4">{editing ? `Edit: ${editing.name}` : 'New Category'}</h3>
          <div className="space-y-4 max-w-md">
            <Input
              label="Name" value={form.name} required
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />

            <div>
              <label className="block text-sm font-medium mb-1">Parent Category</label>
              <select
                value={form.parent_id}
                onChange={e => setForm(f => ({ ...f, parent_id: e.target.value }))}
                className="w-full border px-3 py-2 text-sm focus:outline-none focus:border-brand-primary">
                <option value="">None (Top Level)</option>
                {parentOptions
                  .filter(o => o.id !== editing?.id)
                  .map(o => (
                    <option key={o.id} value={o.id}>
                      {o.level === 1 ? '  └ ' : ''}{o.name}
                    </option>
                  ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Maximum 3 levels: Parent → Child → Sub-child
              </p>
            </div>

            <Input
              label="Description" value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />

            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.is_active}
                  onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))}
                  className="accent-brand-primary" /> Active
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={form.show_in_menu}
                  onChange={e => setForm(f => ({ ...f, show_in_menu: e.target.checked }))}
                  className="accent-brand-primary" /> Show in Menu
              </label>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => saveMutation.mutate({ ...form, parent_id: form.parent_id || null })}
                loading={saveMutation.isPending}>
                Save
              </Button>
              <Button variant="outline" onClick={() => { setEditing(null); setAdding(false); }}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tree */}
      <div className="bg-white border divide-y">
        {roots.length === 0 && (
          <p className="p-8 text-center text-sm text-gray-400">
            No categories yet. Click "Add Category" to create one.
          </p>
        )}

        {roots.map(root => (
          <div key={root.id}>
            {/* ── Level 1: Root ─────────────────────────── */}
            <div className="flex items-center gap-2 px-3 py-3 hover:bg-gray-50">
              <button
                onClick={() => toggle(root.id)}
                className={`flex-shrink-0 text-gray-400 hover:text-brand-primary transition-colors
                  ${root.children?.length ? 'visible' : 'invisible'}`}>
                {isOpen(root.id) ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
              </button>

              <div className="flex-1 flex items-center gap-2 min-w-0">
                <span className="font-semibold text-sm truncate">{root.name}</span>
                <Badge variant={root.is_active ? 'success' : 'default'} className="text-xs flex-shrink-0">
                  {root.is_active ? 'Active' : 'Draft'}
                </Badge>
                {!root.show_in_menu && (
                  <span className="text-xs text-gray-400 flex-shrink-0">hidden</span>
                )}
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {root.products_count > 0 ? `${root.products_count} products` : ''}
                </span>
                {root.children?.length > 0 && (
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    ({root.children.length} sub)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => startEdit(root)}
                  className="p-1.5 text-gray-400 hover:text-brand-primary rounded">
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={() => { if (confirm(`Delete "${root.name}"?`)) deleteMutation.mutate(root.id); }}
                  className="p-1.5 text-gray-400 hover:text-red-500 rounded">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* ── Level 2: Children ─────────────────────── */}
            {isOpen(root.id) && root.children?.map(child => (
              <div key={child.id}>
                <div className="flex items-center gap-2 pl-9 pr-3 py-2.5 bg-gray-50 hover:bg-gray-100 border-t border-gray-100">
                  <button
                    onClick={() => toggle(child.id)}
                    className={`flex-shrink-0 text-gray-400 hover:text-brand-primary transition-colors
                      ${child.children?.length ? 'visible' : 'invisible'}`}>
                    {isOpen(child.id) ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                  </button>

                  <span className="text-gray-300 text-xs flex-shrink-0">└─</span>

                  <div className="flex-1 flex items-center gap-2 min-w-0">
                    <span className="text-sm text-gray-700 truncate">{child.name}</span>
                    <Badge variant={child.is_active ? 'success' : 'default'} className="text-xs flex-shrink-0">
                      {child.is_active ? 'Active' : 'Draft'}
                    </Badge>
                    {!child.show_in_menu && (
                      <span className="text-xs text-gray-400 flex-shrink-0">hidden</span>
                    )}
                    {child.products_count > 0 && (
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {child.products_count} products
                      </span>
                    )}
                    {child.children?.length > 0 && (
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        ({child.children.length} sub)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => startEdit(child)}
                      className="p-1.5 text-gray-400 hover:text-brand-primary rounded">
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => { if (confirm(`Delete "${child.name}"?`)) deleteMutation.mutate(child.id); }}
                      className="p-1.5 text-gray-400 hover:text-red-500 rounded">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* ── Level 3: Sub-children ──────────────── */}
                {isOpen(child.id) && child.children?.map(sub => (
                  <div key={sub.id}
                    className="flex items-center gap-2 pl-16 pr-3 py-2 bg-gray-100/60 hover:bg-gray-100 border-t border-gray-100">
                    <span className="text-gray-300 text-xs flex-shrink-0">└─</span>

                    <div className="flex-1 flex items-center gap-2 min-w-0">
                      <span className="text-xs text-gray-600 truncate">{sub.name}</span>
                      <Badge variant={sub.is_active ? 'success' : 'default'} className="text-xs flex-shrink-0">
                        {sub.is_active ? 'Active' : 'Draft'}
                      </Badge>
                      {!sub.show_in_menu && (
                        <span className="text-xs text-gray-400 flex-shrink-0">hidden</span>
                      )}
                      {sub.products_count > 0 && (
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {sub.products_count} products
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => startEdit(sub)}
                        className="p-1.5 text-gray-400 hover:text-brand-primary rounded">
                        <Edit2 size={12} />
                      </button>
                      <button
                        onClick={() => { if (confirm(`Delete "${sub.name}"?`)) deleteMutation.mutate(sub.id); }}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
