<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Product;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(int $id)
    {
        $reviews = Review::with('user:id,name,avatar')
            ->where('product_id', $id)->approved()->latest()->paginate(10);
        return response()->json(['success' => true, 'data' => $reviews]);
    }

    public function store(Request $request, int $id)
    {
        $data = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'title'  => 'nullable|string|max:100',
            'body'   => 'nullable|string|max:2000',
        ]);

        $exists = Review::where('user_id', $request->user()->id)->where('product_id', $id)->exists();
        if ($exists) {
            return response()->json(['success' => false, 'message' => 'Already reviewed'], 422);
        }

        $review = Review::create([
            ...$data,
            'user_id'    => $request->user()->id,
            'product_id' => $id,
            'status'     => 'pending',
        ]);

        $this->updateProductRating($id);
        return response()->json(['success' => true, 'data' => $review], 201);
    }

    private function updateProductRating(int $productId): void
    {
        $stats = Review::where('product_id', $productId)->approved()
            ->selectRaw('AVG(rating) as avg, COUNT(*) as cnt')->first();

        Product::where('id', $productId)->update([
            'avg_rating'   => round($stats->avg ?? 0, 2),
            'review_count' => $stats->cnt ?? 0,
        ]);
    }
}
