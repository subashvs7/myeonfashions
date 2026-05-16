<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Auth\OtpController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\WishlistController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\CouponController;
use App\Http\Controllers\Api\SearchController;
use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\ShippingController;
use App\Http\Controllers\Api\ReturnController;
use App\Http\Controllers\Api\BannerController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\AdminProductController;
use App\Http\Controllers\Api\Admin\AdminCategoryController;
use App\Http\Controllers\Api\Admin\AdminOrderController;
use App\Http\Controllers\Api\Admin\AdminCouponController;
use App\Http\Controllers\Api\Admin\AdminCustomerController;
use App\Http\Controllers\Api\Admin\AdminInventoryController;
use App\Http\Controllers\Api\Admin\AdminShippingController;
use App\Http\Controllers\Api\Admin\AdminReturnController;
use App\Http\Controllers\Api\Admin\AdminReviewController;
use App\Http\Controllers\Api\Admin\AdminBannerController;
use App\Http\Controllers\Api\Admin\AdminReportController;
use App\Http\Controllers\Api\Admin\AdminSettingController;

// PUBLIC ROUTES
Route::post('/auth/register',        [AuthController::class, 'register']);
Route::post('/auth/login',           [AuthController::class, 'login']);
Route::post('/auth/send-otp',        [OtpController::class, 'send']);
Route::post('/auth/verify-otp',      [OtpController::class, 'verify']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password',  [AuthController::class, 'resetPassword']);

Route::get('/categories',                 [CategoryController::class, 'index']);
Route::get('/categories/{slug}',          [CategoryController::class, 'show']);
Route::get('/categories/{slug}/products', [CategoryController::class, 'products']);

Route::get('/products',              [ProductController::class, 'index']);
Route::get('/products/featured',     [ProductController::class, 'featured']);
Route::get('/products/new-arrivals', [ProductController::class, 'newArrivals']);
Route::get('/products/bestsellers',  [ProductController::class, 'bestsellers']);
Route::get('/products/{slug}',       [ProductController::class, 'show']);
Route::get('/products/{id}/related', [ProductController::class, 'related']);

Route::get('/search',             [SearchController::class, 'search']);
Route::get('/search/suggestions', [SearchController::class, 'suggestions']);
Route::get('/banners',            [BannerController::class, 'index']);
Route::get('/config',             [App\Http\Controllers\Api\PublicConfigController::class, 'index']);

Route::post('/payment/webhook',        [PaymentController::class, 'webhook']);
Route::post('/cart/guest',             [CartController::class, 'guestCart']);
Route::get('/shipping/check/{pincode}',[ShippingController::class, 'checkPincode']);

// PROTECTED ROUTES
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout',          [AuthController::class, 'logout']);
    Route::get('/auth/me',               [AuthController::class, 'me']);
    Route::put('/auth/profile',          [AuthController::class, 'updateProfile']);
    Route::post('/auth/change-password', [AuthController::class, 'changePassword']);
    Route::post('/auth/avatar',          [AuthController::class, 'uploadAvatar']);

    Route::get('/cart',              [CartController::class, 'show']);
    Route::post('/cart/add',         [CartController::class, 'add']);
    Route::put('/cart/item/{id}',    [CartController::class, 'update']);
    Route::delete('/cart/item/{id}', [CartController::class, 'remove']);
    Route::delete('/cart/clear',     [CartController::class, 'clear']);
    Route::post('/cart/merge',       [CartController::class, 'mergeGuestCart']);

    Route::post('/coupon/apply',    [CouponController::class, 'apply']);
    Route::delete('/coupon/remove', [CouponController::class, 'remove']);

    Route::apiResource('/addresses', AddressController::class);
    Route::post('/addresses/{id}/default', [AddressController::class, 'setDefault']);

    Route::get('/orders',              [OrderController::class, 'index']);
    Route::post('/orders',             [OrderController::class, 'store']);
    Route::get('/orders/{id}',         [OrderController::class, 'show']);
    Route::post('/orders/{id}/cancel', [OrderController::class, 'cancel']);
    Route::get('/orders/{id}/invoice', [OrderController::class, 'invoice']);

    Route::post('/payment/create-order',    [PaymentController::class, 'createOrder']);
    Route::post('/payment/verify',          [PaymentController::class, 'verify']);
    Route::post('/payment/retry/{orderId}', [PaymentController::class, 'retry']);

    Route::get('/wishlist',         [WishlistController::class, 'index']);
    Route::post('/wishlist/toggle', [WishlistController::class, 'toggle']);
    Route::get('/wishlist/ids',     [WishlistController::class, 'ids']);

    Route::get('/products/{id}/reviews',  [ReviewController::class, 'index']);
    Route::post('/products/{id}/reviews', [ReviewController::class, 'store']);

    Route::get('/returns',  [ReturnController::class, 'index']);
    Route::post('/returns', [ReturnController::class, 'store']);

    Route::get('/notifications',              [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read',   [NotificationController::class, 'markRead']);
    Route::post('/notifications/read-all',    [NotificationController::class, 'markAllRead']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
});

// ADMIN ROUTES
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index']);

    Route::get('/products/import/template',         [AdminProductController::class, 'importTemplate']);
    Route::post('/products/import',                [AdminProductController::class, 'import']);
    Route::post('/products/bulk-status',           [AdminProductController::class, 'bulkStatus']);
    Route::get('/products/export',                 [AdminProductController::class, 'export']);
    Route::apiResource('/products', AdminProductController::class);
    Route::post('/products/{id}/images',           [AdminProductController::class, 'uploadImages']);
    Route::delete('/products/{id}/images/{imgId}', [AdminProductController::class, 'deleteImage']);

    Route::apiResource('/categories', AdminCategoryController::class);
    Route::post('/categories/reorder', [AdminCategoryController::class, 'reorder']);

    Route::get('/orders',                [AdminOrderController::class, 'index']);
    Route::get('/orders/status-counts',  [AdminOrderController::class, 'statusCounts']);
    Route::get('/orders/manifest',       [AdminOrderController::class, 'manifest']);
    Route::get('/orders/{id}',           [AdminOrderController::class, 'show']);
    Route::get('/orders/{id}/invoice',   [AdminOrderController::class, 'invoice']);
    Route::put('/orders/{id}/status',    [AdminOrderController::class, 'updateStatus']);
    Route::post('/orders/{id}/tracking', [AdminOrderController::class, 'addTracking']);

    Route::apiResource('/coupons', AdminCouponController::class);

    Route::get('/customers',         [AdminCustomerController::class, 'index']);
    Route::get('/customers/{id}',    [AdminCustomerController::class, 'show']);
    Route::put('/customers/{id}',    [AdminCustomerController::class, 'update']);
    Route::delete('/customers/{id}', [AdminCustomerController::class, 'destroy']);

    Route::get('/inventory',              [AdminInventoryController::class, 'index']);
    Route::put('/inventory/variant/{id}', [AdminInventoryController::class, 'updateStock']);
    Route::get('/inventory/low-stock',    [AdminInventoryController::class, 'lowStock']);

    Route::apiResource('/shipping-zones', AdminShippingController::class);

    Route::get('/returns',      [AdminReturnController::class, 'index']);
    Route::get('/returns/{id}', [AdminReturnController::class, 'show']);
    Route::put('/returns/{id}', [AdminReturnController::class, 'update']);

    Route::get('/reviews',             [AdminReviewController::class, 'index']);
    Route::put('/reviews/{id}/status', [AdminReviewController::class, 'updateStatus']);
    Route::delete('/reviews/{id}',     [AdminReviewController::class, 'destroy']);

    Route::apiResource('/banners', AdminBannerController::class);
    Route::post('/banners/reorder', [AdminBannerController::class, 'reorder']);

    Route::get('/settings',                [AdminSettingController::class, 'index']);
    Route::put('/settings',                [AdminSettingController::class, 'update']);
    Route::post('/settings/logo',          [AdminSettingController::class, 'uploadLogo']);
    Route::post('/settings/favicon',       [AdminSettingController::class, 'uploadFavicon']);

    Route::get('/reports/sales',     [AdminReportController::class, 'sales']);
    Route::get('/reports/profit',    [AdminReportController::class, 'profit']);
    Route::get('/reports/gst',       [AdminReportController::class, 'gst']);
    Route::get('/reports/products',  [AdminReportController::class, 'products']);
    Route::get('/reports/customers', [AdminReportController::class, 'customers']);
    Route::get('/reports/inventory', [AdminReportController::class, 'inventory']);
    Route::get('/reports/export',    [AdminReportController::class, 'export']);
});
