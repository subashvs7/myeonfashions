export default function Badge({ children, variant = 'primary', className = '' }) {
  const variants = {
    primary: 'bg-brand-primary text-white',
    accent:  'bg-brand-accent text-white',
    success: 'bg-brand-success text-white',
    error:   'bg-brand-error text-white',
    gray:    'bg-gray-100 text-gray-700',
    default: 'bg-gray-100 text-gray-600',
    outline: 'border border-brand-primary text-brand-primary',
  };
  return (
    <span className={`inline-block px-2 py-0.5 text-xs font-medium tracking-wide ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
