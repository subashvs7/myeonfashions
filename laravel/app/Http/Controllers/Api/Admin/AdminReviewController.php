<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\Request;

class AdminReviewController extends Controller
{
    public function index(Request $request)
    {
        $reviews = Review::with('user', 'product')
            ->when($request->status, fn($q) => $q->where('status', $request->status))
            ->latest()->paginate(20);
        return response()->json(['success' => true, 'data' => $reviews]);
    }

    public function updateStatus(Request $request, int $id)
    {
        $review = Review::findOrFail($id);
        $review->update($request->validate(['status' => 'required|in:approved,rejected']));
        return response()->json(['success' => true, 'data' => $review]);
    }

    public function destroy(int $id)
    {
        Review::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Review deleted']);
    }
}
