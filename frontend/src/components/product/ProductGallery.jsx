import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

const IMG_BASE = 'http://localhost:8000/storage/';

export default function ProductGallery({ images = [] }) {
  const [current, setCurrent] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  if (!images.length) return (
    <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center text-6xl">🥻</div>
  );

  return (
    <div className="space-y-3">
      {/* Main */}
      <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden group cursor-zoom-in" onClick={() => setZoomed(true)}>
        <AnimatePresence mode="wait">
          <motion.img key={current} src={IMG_BASE + images[current]?.image_path} alt={images[current]?.alt_text || 'Product'}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white p-2">
          <ZoomIn size={16} className="text-gray-600"/>
        </div>
        {images.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); setCurrent(c => (c - 1 + images.length) % images.length); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white p-1.5 shadow opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft size={16}/>
            </button>
            <button onClick={(e) => { e.stopPropagation(); setCurrent(c => (c + 1) % images.length); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white p-1.5 shadow opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight size={16}/>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {images.map((img, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`shrink-0 w-16 h-20 overflow-hidden border-2 transition-all ${i === current ? 'border-brand-primary' : 'border-transparent hover:border-gray-300'}`}>
              <img src={IMG_BASE + img.image_path} alt={img.alt_text} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Zoom modal */}
      <AnimatePresence>
        {zoomed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setZoomed(false)}>
            <img src={IMG_BASE + images[current]?.image_path} alt="zoom" className="max-h-[90vh] max-w-[90vw] object-contain" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
