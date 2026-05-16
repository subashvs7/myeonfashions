import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="page-container py-24 text-center">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
        <p className="font-heading text-8xl font-bold text-brand-primary/20">404</p>
        <h1 className="font-heading text-4xl font-bold text-brand-primary mt-4 mb-2">Page Not Found</h1>
        <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/"><Button>Return to Home</Button></Link>
      </motion.div>
    </div>
  );
}
