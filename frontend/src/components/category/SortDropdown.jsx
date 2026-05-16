const SORT_OPTIONS = [
  { value: '',           label: 'Recommended' },
  { value: 'newest',    label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc',label: 'Price: High to Low' },
  { value: 'popular',   label: 'Most Popular' },
  { value: 'rating',    label: 'Top Rated' },
];

export default function SortDropdown({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-500">Sort:</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-brand-primary bg-white">
        {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
