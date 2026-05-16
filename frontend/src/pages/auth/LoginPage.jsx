import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';
import { loginSchema } from '../../utils/validators';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function LoginPage() {
  const { login } = useAuthStore();
  const { fetchCart, merge } = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(loginSchema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await login(data);
      await fetchCart();
      toast.success(`Welcome back, ${user.name}!`);
      navigate(location.state?.from || (user.role === 'admin' ? '/admin' : '/'));
    } catch (e) {
      toast.error(e.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white w-full max-w-md p-8 shadow-sm">
        <div className="text-center mb-8">
          <Link to="/" className="font-heading text-2xl font-bold text-brand-primary">Myeon Casuals</Link>
          <p className="text-gray-500 text-sm mt-2">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Email" type="email" {...register('email')} error={errors.email?.message} placeholder="your@email.com" />
          <Input label="Password" type="password" {...register('password')} error={errors.password?.message} placeholder="••••••••" />
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs text-brand-secondary hover:underline">Forgot password?</Link>
          </div>
          <Button type="submit" loading={loading} className="w-full">Sign In</Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account? <Link to="/register" className="text-brand-primary font-medium hover:underline">Register</Link>
        </p>
      </motion.div>
    </div>
  );
}
