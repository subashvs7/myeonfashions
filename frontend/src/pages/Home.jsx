import HeroSlider from '../components/home/HeroSlider';
import CategoryStrip from '../components/home/CategoryStrip';
import FeaturedCollections from '../components/home/FeaturedCollections';
import NewArrivals from '../components/home/NewArrivals';
import EditorialBanner from '../components/home/EditorialBanner';
import FlashSale from '../components/home/FlashSale';
import BestSellers from '../components/home/BestSellers';
import BrandStrip from '../components/home/BrandStrip';
import Testimonials from '../components/home/Testimonials';
import NewsletterSignup from '../components/home/NewsletterSignup';

export default function Home() {
  return (
    <main>
      <HeroSlider />
      <BrandStrip />
      <CategoryStrip />
      <FeaturedCollections />
      <EditorialBanner />
      <NewArrivals />
      <FlashSale />
      <BestSellers />
      <Testimonials />
      <NewsletterSignup />
    </main>
  );
}
