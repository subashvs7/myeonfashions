import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import StarRating from '../ui/StarRating';
import 'swiper/css';

const TESTIMONIALS = [
  { name: 'Priya S.', location: 'Chennai', rating: 5, text: 'The Kanjivaram saree I ordered is absolutely stunning. The quality exceeded my expectations and delivery was super fast!' },
  { name: 'Meera R.', location: 'Mumbai', rating: 5, text: 'Beautiful lehenga for my sister\'s wedding. Got so many compliments! The fabric quality is exceptional.' },
  { name: 'Anitha K.', location: 'Bangalore', rating: 5, text: 'Love the kurta collection. Perfect for daily office wear. Comfortable and elegant at the same time.' },
  { name: 'Deepa M.', location: 'Hyderabad', rating: 4, text: 'Great shopping experience! The size chart was very helpful and the fit was perfect. Will definitely order again.' },
  { name: 'Kavitha L.', location: 'Delhi', rating: 5, text: 'Ordered a dupatta as a gift and it arrived beautifully packed. The recipient was delighted!' },
];

export default function Testimonials() {
  return (
    <section className="page-container py-16">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="text-center mb-10">
        <p className="text-brand-accent text-xs tracking-[0.3em] uppercase mb-2">What Our Customers Say</p>
        <h2 className="section-heading">Reviews & Stories</h2>
      </motion.div>

      <Swiper modules={[Autoplay]} autoplay={{ delay: 4000 }} slidesPerView={1} spaceBetween={24}
        breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }} loop>
        {TESTIMONIALS.map((t, i) => (
          <SwiperSlide key={i}>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="bg-white border p-6 h-full">
              <StarRating rating={t.rating} />
              <p className="text-gray-600 text-sm leading-relaxed mt-3 mb-4">"{t.text}"</p>
              <div>
                <p className="font-medium text-brand-text text-sm">{t.name}</p>
                <p className="text-xs text-gray-400">{t.location}</p>
              </div>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
