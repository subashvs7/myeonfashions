import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { Plus, Pencil, Trash2, Menu, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY = { label: '', url: '', parent_id: '', location: 'header', target: '_self', position: 0, is_active: true };

function ItemForm({ initial, items, onSave, onCancel }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const topLevel = items.filter(i => !i.parent_id && i.id !== initial.id);
  return (
    <div className="bg-gray-50 border rounded-lg p-4 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-600">Label *</label>
          <input className="mt-1 w-full border rounded px-3 py-2 text-sm" value={form.label}
            onChange={e => set('label', e.target.value)} placeholder="e.g. Shop Now" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">URL *</label>
          <input className="mt-1 w-full border rounded px-3 py-2 text-sm" value={form.url}
            onChange={e => set('url', e.target.value)} placeholder="/products or https://..." />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">Location</label>
          <select className="mt-1 w-full border rounded px-3 py-2 text-sm" value={form.location}
            onChange={e => set('location', e.target.value)}>
            <option value="header">Header</option>
            <option value="footer">Footer</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">Parent (optional)</label>
          <select className="mt-1 w-full border rounded px-3 py-2 text-sm" value={form.parent_id || ''}
            onChange={e => set('parent_id', e.target.value || null)}>
            <option value="">— Top Level —</option>
            {topLevel.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">Opens In</label>
          <select className="mt-1 w-full border rounded px-3 py-2 text-sm" value={form.target}
            onChange={e => set('target', e.target.value)}>
            <option value="_self">Same Tab</option>
            <option value="_blank">New Tab</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">Position</label>
          <input type="number" className="mt-1 w-full border rounded px-3 py-2 text-sm"
            value={form.position} onChange={e => set('position', e.target.value)} />
        </div>
        <div className="flex items-center gap-2 mt-1">
          <input type="checkbox" id="mi_active" checked={form.is_active}
            onChange={e => set('is_active', e.target.checked)} />
          <label htmlFor="mi_active" className="text-sm text-gray-700">Active</label>
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={() => onSave(form)}
          className="px-4 py-2 bg-brand-primary text-white rounded text-sm font-medium hover:opacity-90">Save</button>
        <button onClick={onCancel} className="px-4 py-2 border rounded text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
      </div>
    </div>
  );
}

export default function MenuManager() {
  const qc = useQueryClient();
  const [location, setLocation] = useState('header');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['menu-items', location],
    queryFn: () => adminApi.getMenuItems({ location }),
  });
  const items = data?.data?.data ?? [];

  const create = useMutation({ mutationFn: adminApi.createMenuItem, onSuccess: () => { qc.invalidateQueries(['menu-items']); setShowForm(false); toast.success('Menu item added'); }});
  const update = useMutation({ mutationFn: ({ id, data }) => adminApi.updateMenuItem(id, data), onSuccess: () => { qc.invalidateQueries(['menu-items']); setEditing(null); toast.success('Updated'); }});
  const remove = useMutation({ mutationFn: adminApi.deleteMenuItem, onSuccess: () => { qc.invalidateQueries(['menu-items']); toast.success('Deleted'); }});

  const allItems = items.reduce((acc, i) => { acc.push(i); if (i.children) acc.push(...i.children); return acc; }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Menu size={20} /> Menu Manager</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage header and footer navigation links</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-medium hover:opacity-90">
          <Plus size={16} /> Add Item
        </button>
      </div>

      {/* Location tabs */}
      <div className="flex border-b">
        {[['header', 'Header Menu'], ['footer', 'Footer Menu']].map(([v, l]) => (
          <button key={v} onClick={() => setLocation(v)}
            className={`px-5 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              location === v ? 'border-brand-primary text-brand-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>{l}</button>
        ))}
      </div>

      {showForm && (
        <ItemForm initial={{ ...EMPTY, location }} items={allItems}
          onSave={d => create.mutate(d)} onCancel={() => setShowForm(false)} />
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Menu size={40} className="mx-auto mb-3 opacity-30" />
          <p>No menu items yet for {location}. Add your first item!</p>
        </div>
      ) : (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Label</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">URL</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Target</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Position</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map(item => (
                <>
                  {editing?.id === item.id ? (
                    <tr key={item.id}>
                      <td colSpan={6} className="p-4">
                        <ItemForm initial={item} items={allItems}
                          onSave={d => update.mutate({ id: item.id, data: d })}
                          onCancel={() => setEditing(null)} />
                      </td>
                    </tr>
                  ) : (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <GripVertical size={14} className="text-gray-300" />
                          {item.label}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{item.url}</td>
                      <td className="px-4 py-3 text-gray-500">{item.target === '_blank' ? 'New Tab' : 'Same Tab'}</td>
                      <td className="px-4 py-3 text-center text-gray-500">{item.position}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {item.is_active ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setEditing(item)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Pencil size={14} /></button>
                          <button onClick={() => { if (confirm('Delete this menu item?')) remove.mutate(item.id); }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  )}
                  {/* Children */}
                  {item.children?.map(child => (
                    editing?.id === child.id ? (
                      <tr key={child.id}>
                        <td colSpan={6} className="p-4 bg-gray-50">
                          <ItemForm initial={child} items={allItems}
                            onSave={d => update.mutate({ id: child.id, data: d })}
                            onCancel={() => setEditing(null)} />
                        </td>
                      </tr>
                    ) : (
                      <tr key={child.id} className="bg-gray-50/50 hover:bg-gray-50">
                        <td className="px-4 py-2.5 text-gray-700">
                          <div className="flex items-center gap-2 pl-6">
                            <span className="text-gray-300">↳</span> {child.label}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-gray-500 font-mono text-xs">{child.url}</td>
                        <td className="px-4 py-2.5 text-gray-500">{child.target === '_blank' ? 'New Tab' : 'Same Tab'}</td>
                        <td className="px-4 py-2.5 text-center text-gray-500">{child.position}</td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${child.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {child.is_active ? 'Active' : 'Hidden'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => setEditing(child)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Pencil size={14} /></button>
                            <button onClick={() => { if (confirm('Delete?')) remove.mutate(child.id); }}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  ))}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
