import { useState } from 'react';

export default function VariantSelector({ variants = [], selectedVariant, onSelect }) {
  const sizes  = [...new Set(variants.filter(v => v.size).map(v => v.size))];
  const colors = [...new Map(variants.filter(v => v.color).map(v => [v.color, { color: v.color, hex: v.color_hex }])).values()];

  const [selectedSize, setSelectedSize]   = useState(selectedVariant?.size  || null);
  const [selectedColor, setSelectedColor] = useState(selectedVariant?.color || null);

  const findVariant = (size, color) => variants.find(v => v.size === size && v.color === color) || variants.find(v => v.size === size || v.color === color);

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    const v = findVariant(size, selectedColor);
    if (v) onSelect(v);
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    const v = findVariant(selectedSize, color);
    if (v) onSelect(v);
  };

  return (
    <div className="space-y-4">
      {colors.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Color: <span className="text-brand-secondary">{selectedColor || 'Select'}</span></p>
          <div className="flex gap-2 flex-wrap">
            {colors.map(c => (
              <button key={c.color} onClick={() => handleColorSelect(c.color)}
                title={c.color}
                className={`w-8 h-8 border-2 transition-all ${selectedColor === c.color ? 'border-brand-primary scale-110' : 'border-gray-200 hover:border-gray-400'}`}
                style={{ backgroundColor: c.hex || '#ccc' }}
              />
            ))}
          </div>
        </div>
      )}

      {sizes.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Size: <span className="text-brand-secondary">{selectedSize || 'Select'}</span></p>
          <div className="flex gap-2 flex-wrap">
            {sizes.map(size => {
              const variant = variants.find(v => v.size === size && (selectedColor ? v.color === selectedColor : true));
              const outOfStock = variant && variant.stock === 0;
              return (
                <button key={size} onClick={() => !outOfStock && handleSizeSelect(size)} disabled={outOfStock}
                  className={`px-3 py-1.5 text-sm border transition-all ${selectedSize === size ? 'bg-brand-primary text-white border-brand-primary' : outOfStock ? 'border-gray-200 text-gray-300 cursor-not-allowed line-through' : 'border-gray-300 hover:border-brand-primary'}`}>
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

