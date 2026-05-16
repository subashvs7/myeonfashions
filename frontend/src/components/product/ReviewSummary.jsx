import StarRating from '../ui/StarRating';

export default function ReviewSummary({ avgRating = 0, reviewCount = 0 }) {
  return (
    <div className="flex items-center gap-4">
      <div className="text-center">
        <p className="font-heading text-5xl font-bold text-brand-primary">{Number(avgRating).toFixed(1)}</p>
        <StarRating rating={avgRating} size={16} />
        <p className="text-xs text-gray-500 mt-1">{reviewCount} reviews</p>
      </div>
    </div>
  );
}
