import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '../../api/reviews';
import { reviewSchema } from '../../utils/validators';
import StarRating from '../ui/StarRating';
import Input from '../ui/Input';
import Button from '../ui/Button';
import toast from 'react-hot-toast';

export default function ReviewForm({ productId }) {
  const [rating, setRating] = useState(0);
  const qc = useQueryClient();
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(reviewSchema),
    defaultValues: { rating: 0, title: '', body: '' },
  });

  const handleRatingChange = (val) => {
    setRating(val);
    setValue('rating', val, { shouldValidate: true });
  };

  const { mutate, isPending } = useMutation({
    mutationFn: (data) => reviewsApi.create(productId, data),
    onSuccess: () => {
      toast.success('Review submitted! It will appear after approval.');
      reset({ rating: 0, title: '', body: '' });
      setRating(0);
      qc.invalidateQueries(['reviews', productId]);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to submit'),
  });

  return (
    <form onSubmit={handleSubmit(mutate)} className="bg-brand-bg p-6 space-y-4">
      <h4 className="font-heading text-xl font-semibold">Write a Review</h4>
      <div>
        <p className="text-sm font-medium mb-2">Rating *</p>
        <StarRating rating={rating} interactive onChange={handleRatingChange} size={28} />
        {errors.rating && <p className="text-xs text-brand-error mt-1">Please select a rating</p>}
      </div>
      <Input label="Review Title" {...register('title')} error={errors.title?.message} placeholder="Summarize your experience" />
      <div>
        <label className="text-sm font-medium">Review *</label>
        <textarea {...register('body')} rows={4} placeholder="Share your detailed experience..."
          className="w-full border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand-primary mt-1 resize-none" />
        {errors.body && <p className="text-xs text-brand-error">{errors.body.message}</p>}
      </div>
      <Button type="submit" loading={isPending} disabled={rating === 0}>Submit Review</Button>
    </form>
  );
}
