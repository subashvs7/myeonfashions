import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { formatPrice } from '../../utils/formatCurrency';

const PRICE_RANGES = [
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500 – ₹1,000', min: 500, max: 1000 },
  { label: '₹1,000 – ₹3,000', min: 1000, max: 3000 },
  { label: '₹3,000 – ₹10,000', min: 3000, max: 10000 },
  { label: 'Above ₹10,000', min: 10000, max: 999999 },
];

function AccordionSection({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b py-4">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between text-sm font-medium">
        {title} {open ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

export default function FilterSidebar({ filters, onFilterChange }) {
  return (
    <aside className="w-56 shrink-0">
      <p className="font-medium text-sm uppercase tracking-wider mb-4">Filters</p>

      <AccordionSection title="Price Range">
        <div className="space-y-2">
          {PRICE_RANGES.map((r) => (
            <label key={r.label} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="price" className="accent-brand-primary"
                checked={filters.min_price === r.min && filters.max_price === r.max}
                onChange={() => onFilterChange({ min_price: r.min, max_price: r.max })}
              />
              <span className="text-sm text-gray-600">{r.label}</span>
            </label>
          ))}
        </div>
      </AccordionSection>

      {filters.brands?.length > 0 && (
        <AccordionSection title="Brand">
          <div className="space-y-2">
            {filters.brands.map(b => (
              <label key={b} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="accent-brand-primary"
                  checked={filters.selected_brands?.includes(b)}
                  onChange={(e) => {
                    const brands = e.target.checked
                      ? [...(filters.selected_brands || []), b]
                      : (filters.selected_brands || []).filter(x => x !== b);
                    onFilterChange({ selected_brands: brands });
                  }}
                />
                <span className="text-sm text-gray-600">{b}</span>
              </label>
            ))}
          </div>
        </AccordionSection>
      )}
    </aside>
  );
}
