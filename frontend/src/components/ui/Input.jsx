export default function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-brand-text">{label}</label>}
      <input
        className={`w-full border ${error ? 'border-brand-error' : 'border-gray-300'} px-3 py-2.5 text-sm outline-none focus:border-brand-primary transition-colors bg-white ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-brand-error">{error}</p>}
    </div>
  );
}
