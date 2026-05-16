import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addressApi } from '../../api/address';
import { addressSchema } from '../../utils/validators';
import Input from '../ui/Input';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

const STATES = ['Andhra Pradesh','Assam','Bihar','Delhi','Goa','Gujarat','Haryana','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Odisha','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','West Bengal'];

export default function AddressForm({ onSuccess, onCancel, defaultValues }) {
  const qc = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(addressSchema),
    defaultValues,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: defaultValues?.id
      ? (data) => addressApi.update(defaultValues.id, data)
      : (data) => addressApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries(['addresses']);
      toast.success(defaultValues?.id ? 'Address updated' : 'Address saved');
      onSuccess?.();
    },
    onError: () => toast.error('Failed to save address'),
  });

  return (
    <form onSubmit={handleSubmit(mutate)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Full Name *" {...register('full_name')} error={errors.full_name?.message} />
        <Input label="Phone *" {...register('phone')} error={errors.phone?.message} placeholder="10-digit mobile" />
      </div>
      <Input label="Address Line 1 *" {...register('address_line1')} error={errors.address_line1?.message} placeholder="House/Flat/Office No, Street" />
      <Input label="Address Line 2" {...register('address_line2')} placeholder="Landmark (optional)" />
      <div className="grid grid-cols-2 gap-4">
        <Input label="City *" {...register('city')} error={errors.city?.message} />
        <div>
          <label className="text-sm font-medium">State *</label>
          <select {...register('state')} className="w-full border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand-primary mt-1">
            <option value="">Select State</option>
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {errors.state && <p className="text-xs text-brand-error">{errors.state.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Pincode *" {...register('pincode')} error={errors.pincode?.message} maxLength={6} />
        <div>
          <label className="text-sm font-medium">Label</label>
          <select {...register('label')} className="w-full border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand-primary mt-1">
            {['Home','Work','Other'].map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" {...register('is_default')} className="accent-brand-primary" />
        <span className="text-sm">Set as default address</span>
      </label>
      <div className="flex gap-3">
        <Button type="submit" loading={isPending}>Save Address</Button>
        {onCancel && <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>}
      </div>
    </form>
  );
}
