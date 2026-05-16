import { useRef } from 'react';
import { Upload, X } from 'lucide-react';

export default function ImageUpload({ onChange, preview, onRemove, label = 'Upload Image', multiple = false }) {
  const ref = useRef();
  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium">{label}</p>}
      <div
        onClick={() => ref.current?.click()}
        className="border-2 border-dashed border-gray-300 p-8 text-center cursor-pointer hover:border-brand-primary transition-colors"
      >
        <Upload size={32} className="mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-500">Click to upload{multiple ? ' (multiple)' : ''}</p>
        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 3MB</p>
      </div>
      <input ref={ref} type="file" className="hidden" accept="image/*" multiple={multiple} onChange={onChange} />
      {preview && (
        <div className="relative inline-block">
          <img src={preview} className="w-24 h-24 object-cover" alt="preview" />
          {onRemove && <button onClick={onRemove} className="absolute -top-2 -right-2 bg-brand-error text-white rounded-full p-0.5"><X size={12}/></button>}
        </div>
      )}
    </div>
  );
}
