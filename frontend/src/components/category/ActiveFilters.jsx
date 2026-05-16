import { X } from 'lucide-react';

export default function ActiveFilters({ filters, onRemove, onClearAll }) {
  const active = Object.entries(filters).filter(([k, v]) => v && k !== 'sort');
  if (!active.length) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-xs text-gray-500">Active:</span>
      {active.map(([key, value]) => (
        <span key={key} className="flex items-center gap-1 bg-brand-primary/10 text-brand-primary text-xs px-2 py-1">
          {String(value)} <button onClick={() => onRemove(key)}><X size={10}/></button>
        </span>
      ))}
      <button onClick={onClearAll} className="text-xs text-brand-error underline">Clear all</button>
    </div>
  );
}
