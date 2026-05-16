import { MapPin, Edit2, Trash2 } from 'lucide-react';
import Badge from '../ui/Badge';

export default function AddressCard({ address, selected, onSelect, onEdit, onDelete, selectable = true }) {
  return (
    <div
      onClick={() => selectable && onSelect?.(address)}
      className={`border p-4 cursor-pointer transition-all ${selected ? 'border-brand-primary bg-brand-primary/5' : 'hover:border-gray-400'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={selected ? 'primary' : 'gray'}>{address.label}</Badge>
            {address.is_default && <Badge variant="success">Default</Badge>}
          </div>
          <p className="font-medium text-sm">{address.full_name}</p>
          <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">
            {address.address_line1}{address.address_line2 ? `, ${address.address_line2}` : ''}<br/>
            {address.city}, {address.state} – {address.pincode}
          </p>
          <p className="text-sm text-gray-500 mt-1"><MapPin size={12} className="inline mr-1"/>{address.phone}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          {onEdit && <button onClick={(e) => { e.stopPropagation(); onEdit(address); }} className="text-gray-400 hover:text-brand-primary"><Edit2 size={14}/></button>}
          {onDelete && <button onClick={(e) => { e.stopPropagation(); onDelete(address.id); }} className="text-gray-400 hover:text-brand-error"><Trash2 size={14}/></button>}
        </div>
      </div>
    </div>
  );
}
