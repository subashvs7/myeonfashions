import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authApi } from '../../api/auth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setSent(true);
      toast.success('Reset link sent! Check your inbox.');
    } catch {
      toast.error('Could not send reset link. Check the email address.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white w-full max-w-md p-8 shadow-sm">
        <div className="text-center mb-8">
          <Link to="/" className="font-heading text-2xl font-bold text-brand-primary">Myeon Casuals</Link>
          <p className="text-gray-500 text-sm mt-2">Reset your password</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-brand-success/10 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-brand-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-600 text-sm">We've sent a password reset link to <strong>{email}</strong></p>
            <Link to="/login" className="block text-brand-primary text-sm font-medium hover:underline">Back to Sign In</Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <p className="text-sm text-gray-500">Enter your registered email address and we'll send you a link to reset your password.</p>
            <Input label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required />
            <Button type="submit" loading={loading} className="w-full">Send Reset Link</Button>
            <p className="text-center text-sm text-gray-500">
              Remember it? <Link to="/login" className="text-brand-primary font-medium hover:underline">Sign In</Link>
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
}
