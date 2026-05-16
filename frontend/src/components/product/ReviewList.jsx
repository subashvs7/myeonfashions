import { useQuery } from '@tanstack/react-query';
import { reviewsApi } from '../../api/reviews';
import StarRating from '../ui/StarRating';
import { formatDate } from '../../utils/formatDate';
import { CheckCircle } from 'lucide-react';
import { Skeleton } from '../ui/Skeleton';

export default function ReviewList({ productId }) {
  const { data, isLoading } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => reviewsApi.get(productId).then(r => r.data.data),
  });

  if (isLoading) return <div className="space-y-4">{Array.from({length:3}).map((_,i) => <Skeleton key={i} className="h-24"/>)}</div>;
  const reviews = data?.data || [];
  if (!reviews.length) return <p className="text-gray-500 text-sm py-8 text-center">No reviews yet. Be the first to review!</p>;

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border-b pb-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2">
                <StarRating rating={review.rating} size={14}/>
                {review.is_verified_purchase && (
                  <span className="text-xs text-brand-success flex items-center gap-1"><CheckCircle size={12}/> Verified</span>
                )}
              </div>
              {review.title && <p className="font-medium text-sm mt-1">{review.title}</p>}
            </div>
            <p className="text-xs text-gray-400">{formatDate(review.created_at)}</p>
          </div>
          {review.body && <p className="text-sm text-gray-600 leading-relaxed">{review.body}</p>}
          <p className="text-xs text-gray-400 mt-2">— {review.user?.name}</p>
        </div>
      ))}
    </div>
  );
}
