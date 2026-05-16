import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { Plus, Pencil, Trash2, Link, ChevronDown, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

function SectionForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial);
  return (
    <div className="bg-gray-50 border rounded-lg p-3 space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="text-xs font-medium text-gray-600">Section Title *</label>
          <input className="mt-1 w-full border rounded px-3 py-2 text-sm" value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Quick Links" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">Position</label>
          <input type="number" className="mt-1 w-full border rounded px-3 py-2 text-sm"
            value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.is_active}
            onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} /> Active
        </label>
        <button onClick={() => onSave(form)} className="px-4 py-1.5 bg-brand-primary text-white rounded text-sm hover:opacity-90">Save</button>
        <button onClick={onCancel} className="px-4 py-1.5 border rounded text-sm text-gray-600 hover:bg-gray-100">Cancel</button>
      </div>
    </div>
  );
}

function LinkForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-medium text-gray-600">Label *</label>
          <input className="mt-1 w-full border rounded px-2 py-1.5 text-sm" value={form.label}
            onChange={e => set('label', e.target.value)} placeholder="About Us" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">URL *</label>
          <input className="mt-1 w-full border rounded px-2 py-1.5 text-sm" value={form.url}
            onChange={e => set('url', e.target.value)} placeholder="/about" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600">Position</label>
          <input type="number" className="mt-1 w-full border rounded px-2 py-1.5 text-sm"
            value={form.position} onChange={e => set('position', e.target.value)} />
        </div>
        <div className="flex items-end gap-3 pb-1">
          <label className="flex items-center gap-1.5 text-sm cursor-pointer">
            <input type="checkbox" checked={form.open_in_new_tab}
              onChange={e => set('open_in_new_tab', e.target.checked)} /> New Tab
          </label>
          <label className="flex items-center gap-1.5 text-sm cursor-pointer">
            <input type="checkbox" checked={form.is_active}
              onChange={e => set('is_active', e.target.checked)} /> Active
          </label>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onSave(form)} className="px-3 py-1.5 bg-brand-primary text-white rounded text-xs hover:opacity-90">Save Link</button>
        <button onClick={onCancel} className="px-3 py-1.5 border rounded text-xs text-gray-600 hover:bg-gray-100">Cancel</button>
      </div>
    </div>
  );
}

const SECTION_EMPTY = { title: '', position: 0, is_active: true };
const LINK_EMPTY    = { label: '', url: '', open_in_new_tab: false, position: 0, is_active: true };

export default function FooterManager() {
  const qc = useQueryClient();
  const [showSectionForm, setShowSectionForm]   = useState(false);
  const [editSection, setEditSection]           = useState(null);
  const [editLink, setEditLink]                 = useState(null);
  const [addLinkFor, setAddLinkFor]             = useState(null);
  const [expanded, setExpanded]                 = useState({});

  const { data, isLoading } = useQuery({ queryKey: ['footer-sections'], queryFn: adminApi.getFooterSections });
  const sections = data?.data?.data ?? [];

  const createSection = useMutation({ mutationFn: adminApi.createFooterSection, onSuccess: () => { qc.invalidateQueries(['footer-sections']); setShowSectionForm(false); toast.success('Section added'); }});
  const updateSection = useMutation({ mutationFn: ({ id, data }) => adminApi.updateFooterSection(id, data), onSuccess: () => { qc.invalidateQueries(['footer-sections']); setEditSection(null); toast.success('Updated'); }});
  const deleteSection = useMutation({ mutationFn: adminApi.deleteFooterSection, onSuccess: () => { qc.invalidateQueries(['footer-sections']); toast.success('Section deleted'); }});
  const createLink    = useMutation({ mutationFn: ({ sectionId, data }) => adminApi.createFooterLink(sectionId, data), onSuccess: () => { qc.invalidateQueries(['footer-sections']); setAddLinkFor(null); toast.success('Link added'); }});
  const updateLink    = useMutation({ mutationFn: ({ id, data }) => adminApi.updateFooterLink(id, data), onSuccess: () => { qc.invalidateQueries(['footer-sections']); setEditLink(null); toast.success('Link updated'); }});
  const deleteLink    = useMutation({ mutationFn: adminApi.deleteFooterLink, onSuccess: () => { qc.invalidateQueries(['footer-sections']); toast.success('Link deleted'); }});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Link size={20} /> Footer Manager</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage footer sections and their links</p>
        </div>
        <button onClick={() => setShowSectionForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-medium hover:opacity-90">
          <Plus size={16} /> Add Section
        </button>
      </div>

      {showSectionForm && (
        <SectionForm initial={SECTION_EMPTY}
          onSave={d => createSection.mutate(d)} onCancel={() => setShowSectionForm(false)} />
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : sections.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Link size={40} className="mx-auto mb-3 opacity-30" />
          <p>No footer sections yet. Add your first section!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map(section => (
            <div key={section.id} className="bg-white border rounded-xl shadow-sm overflow-hidden">
              {editSection?.id === section.id ? (
                <div className="p-4">
                  <SectionForm initial={section}
                    onSave={d => updateSection.mutate({ id: section.id, data: d })}
                    onCancel={() => setEditSection(null)} />
                </div>
              ) : (
                <div className="flex items-center justify-between px-4 py-3">
                  <button onClick={() => setExpanded(e => ({ ...e, [section.id]: !e[section.id] }))}
                    className="flex items-center gap-2 text-left">
                    {expanded[section.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <span className="font-semibold text-gray-900">{section.title}</span>
                    <span className="text-xs text-gray-400">({section.links?.length ?? 0} links)</span>
                    {!section.is_active && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">Hidden</span>}
                  </button>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setAddLinkFor(section.id); setExpanded(e => ({ ...e, [section.id]: true })); }}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs border rounded hover:bg-gray-50 text-gray-600">
                      <Plus size={12} /> Link
                    </button>
                    <button onClick={() => setEditSection(section)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Pencil size={14} /></button>
                    <button onClick={() => { if (confirm(`Delete "${section.title}" and all its links?`)) deleteSection.mutate(section.id); }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                  </div>
                </div>
              )}

              {expanded[section.id] && (
                <div className="border-t px-4 pb-3 space-y-2 pt-2">
                  {addLinkFor === section.id && (
                    <LinkForm initial={LINK_EMPTY}
                      onSave={d => createLink.mutate({ sectionId: section.id, data: d })}
                      onCancel={() => setAddLinkFor(null)} />
                  )}
                  {section.links?.length === 0 && !addLinkFor && (
                    <p className="text-sm text-gray-400 py-2">No links yet.</p>
                  )}
                  {section.links?.map(link => (
                    editLink?.id === link.id ? (
                      <LinkForm key={link.id} initial={link}
                        onSave={d => updateLink.mutate({ id: link.id, data: d })}
                        onCancel={() => setEditLink(null)} />
                    ) : (
                      <div key={link.id} className="flex items-center justify-between py-1.5 px-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-sm font-medium text-gray-800">{link.label}</p>
                            <p className="text-xs text-gray-400 font-mono">{link.url}</p>
                          </div>
                          {link.open_in_new_tab && <span className="text-xs text-gray-400">↗ new tab</span>}
                          {!link.is_active && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">Hidden</span>}
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => setEditLink(link)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Pencil size={13} /></button>
                          <button onClick={() => { if (confirm('Delete this link?')) deleteLink.mutate(link.id); }}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={13} /></button>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
