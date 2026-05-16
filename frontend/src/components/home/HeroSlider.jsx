import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, EffectFade } from 'swiper/modules';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';
import { useQuery } from '@tanstack/react-query';
import { bannersApi } from '../../api/banners';

const FALLBACK = [
  { title: 'New Festive Collection', subtitle: 'Discover Premium Ethnic Wear', button_text: 'Shop Now', link: '/categories/sarees', image: null, bg: '#2D1B69' },
  { title: 'Bridal Lehengas', subtitle: 'Starting from ₹8,999', button_text: 'Explore', link: '/categories/lehengas', image: null, bg: '#7C3AED' },
  { title: 'Silk Sarees Sale', subtitle: 'Up to 40% Off', button_text: 'View Sale', link: '/categories/sarees', image: null, bg: '#1E40AF' },
];

export default function HeroSlider() {
  const { data: bannersData } = useQuery({ queryKey: ['banners'], queryFn: () => bannersApi.getAll().then(r => r.data.data) });
  const slides = bannersData?.hero?.length > 0 ? bannersData.hero : FALLBACK;

  return (
    <div className="w-full overflow-hidden" style={{ height: 'clamp(360px, 60vh, 600px)' }}>
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop
        className="h-full"
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={i}>
            <div
              className="relative h-full flex items-center"
              style={{ background: slide.bg || `linear-gradient(135deg, #2D1B69, #7C3AED)` }}
            >
              {slide.image_url && (
                <img src={slide.image_url} className="absolute inset-0 w-full h-full object-cover" alt={slide.title} />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
              <div className="relative page-container">
                <motion.div
                  initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}
                  className="max-w-xl text-white"
                >
                  <p className="text-brand-accent text-sm tracking-[0.3em] uppercase mb-3 font-medium">{slide.subtitle}</p>
                  <h1 className="font-heading text-4xl md:text-6xl font-bold leading-tight mb-6">{slide.title}</h1>
                  {slide.link && (
                    <Link to={slide.link}
                      className="inline-block bg-brand-accent text-white px-8 py-4 text-sm tracking-widest uppercase font-medium hover:opacity-90 transition-opacity">
                      {slide.button_text || 'Shop Now'}
                    </Link>
                  )}
                </motion.div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
