import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function Breadcrumb({ items }) {
  return (
    <nav className="flex items-center gap-1 text-sm text-gray-500">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight size={14} />}
          {item.href ? (
            <Link to={item.href} className="hover:text-brand-primary transition-colors">{item.label}</Link>
          ) : (
            <span className="text-brand-text font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
