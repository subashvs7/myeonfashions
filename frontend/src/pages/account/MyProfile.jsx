import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuthStore } from '../../stores/authStore';
import { authApi } from '../../api/auth';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { Camera } from 'lucide-react';

const profileSchema = yup.object({ name: yup.string().required(), email: yup.string().email().required(), phone: yup.string() });
const passwordSchema = yup.object({
  current_password: yup.string().required(),
  password: yup.string().min(8).required(),
  password_confirmation: yup.string().oneOf([yup.ref('password')], 'Passwords must match').required(),
});

export default function MyProfile() {
  const { user, setUser } = useAuthStore();
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: { name: user?.name || '', email: user?.email || '', phone: user?.phone || '' },
  });

  const { register: regPwd, handleSubmit: handlePwd, formState: { errors: pwdErrors, isSubmitting: pwdSubmitting }, reset } = useForm({
    resolver: yupResolver(passwordSchema),
  });

  const onUpdateProfile = async (data) => {
    try {
      const res = await authApi.updateProfile(data);
      setUser(res.data.data);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
  };

  const onChangePassword = async (data) => {
    try {
      await authApi.changePassword(data);
      toast.success('Password changed!');
      reset();
    } catch (e) { toast.error(e.response?.data?.message || 'Password change failed'); }
  };

  const onAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append('avatar', file);
      const res = await authApi.uploadAvatar(form);
      setUser(res.data.data);
      toast.success('Avatar updated!');
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  return (
    <div>
      <h2 className="font-heading text-2xl font-bold text-brand-primary mb-6">My Profile</h2>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-8 p-5 border">
        <div className="relative">
          <div className="w-20 h-20 bg-brand-primary/10 overflow-hidden">
            {user?.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-brand-primary text-2xl font-bold">{user?.name?.[0]?.toUpperCase()}</div>}
          </div>
          <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-brand-primary text-white flex items-center justify-center cursor-pointer hover:bg-brand-secondary transition-colors">
            <Camera size={12} />
            <input type="file" accept="image/*" className="hidden" onChange={onAvatarChange} disabled={uploading} />
          </label>
        </div>
        <div>
          <p className="font-medium">{user?.name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
      </div>

      {/* Profile form */}
      <div className="border p-5 mb-6">
        <h3 className="font-medium mb-4">Personal Information</h3>
        <form onSubmit={handleSubmit(onUpdateProfile)} className="space-y-4">
          <Input label="Full Name" {...register('name')} error={errors.name?.message} />
          <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
          <Input label="Phone" {...register('phone')} error={errors.phone?.message} />
          <Button type="submit" loading={isSubmitting}>Save Changes</Button>
        </form>
      </div>

      {/* Password form */}
      <div className="border p-5">
        <h3 className="font-medium mb-4">Change Password</h3>
        <form onSubmit={handlePwd(onChangePassword)} className="space-y-4">
          <Input label="Current Password" type="password" {...regPwd('current_password')} error={pwdErrors.current_password?.message} />
          <Input label="New Password" type="password" {...regPwd('password')} error={pwdErrors.password?.message} placeholder="Min 8 characters" />
          <Input label="Confirm New Password" type="password" {...regPwd('password_confirmation')} error={pwdErrors.password_confirmation?.message} />
          <Button type="submit" loading={pwdSubmitting}>Change Password</Button>
        </form>
      </div>
    </div>
  );
}
