import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { registerSchema } from '../../utils/validators';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function RegisterPage() {
  const { register: registerUser } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(registerSchema) });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const user = await registerUser(data);
      toast.success('Account created! Welcome to Myeon Casuals');
      navigate('/');
    } catch (e) {
      const msg = e.response?.data?.errors ? Object.values(e.response.data.errors)[0][0] : 'Registration failed';
      toast.error(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white w-full max-w-md p-8 shadow-sm">
        <div className="text-center mb-8">
          <Link to="/" className="font-heading text-2xl font-bold text-brand-primary">Myeon Casuals</Link>
          <p className="text-gray-500 text-sm mt-2">Create your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Full Name" {...register('name')} error={errors.name?.message} placeholder="Your full name" />
          <Input label="Email" type="email" {...register('email')} error={errors.email?.message} placeholder="your@email.com" />
          <Input label="Phone" {...register('phone')} error={errors.phone?.message} placeholder="10-digit mobile number" />
          <Input label="Password" type="password" {...register('password')} error={errors.password?.message} placeholder="Min 8 characters" />
          <Input label="Confirm Password" type="password" {...register('password_confirmation')} error={errors.password_confirmation?.message} placeholder="Re-enter password" />
          <Button type="submit" loading={loading} className="w-full">Create Account</Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account? <Link to="/login" className="text-brand-primary font-medium hover:underline">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
}
