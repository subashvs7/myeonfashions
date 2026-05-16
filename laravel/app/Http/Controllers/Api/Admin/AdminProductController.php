<?php
namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Imports\ProductsImport;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;

class AdminProductController extends Controller
{
    public function index(Request $request)
    {
        $search     = $request->input('search');
        $status     = $request->input('status');
        $categoryId = $request->input('category_id');
        $perPage    = (int) $request->input('per_page', 20);

        $products = Product::with(['category', 'primaryImage'])
            ->withTrashed($request->boolean('trashed'))
            ->when($search,     fn($q) => $q->where('name', 'like', "%{$search}%"))
            ->when($status,     fn($q) => $q->where('status', $status))
            ->when($categoryId, fn($q) => $q->where('category_id', $categoryId))
            ->latest()
            ->paginate($perPage);

        return response()->json(['success' => true, 'data' => $products]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'              => 'required|string|max:200',
            'category_id'       => 'required|integer|exists:categories,id',
            'short_description' => 'nullable|string',
            'description'       => 'nullable|string',
            'base_price'        => 'required|numeric|min:0',
            'sale_price'        => 'nullable|numeric|min:0',
            'cost_price'        => 'nullable|numeric|min:0',
            'sku'               => 'required|string|unique:products,sku',
            'brand'             => 'nullable|string',
            'fabric'            => 'nullable|string',
            'care_instructions' => 'nullable|string',
            'weight'            => 'nullable|numeric',
            'tags'              => 'nullable|string',
            'meta_title'        => 'nullable|string|max:200',
            'meta_description'  => 'nullable|string|max:300',
            'is_featured'       => 'sometimes|boolean',
            'is_new_arrival'    => 'sometimes|boolean',
            'is_bestseller'     => 'sometimes|boolean',
            'has_variants'      => 'sometimes|boolean',
            'status'            => 'sometimes|in:draft,active,archived',
            'total_stock'       => 'sometimes|integer|min:0',
            'stock_alert_qty'   => 'sometimes|integer|min:0',
            'variants'          => 'nullable|array',
            'variants.*.size'       => 'nullable|string',
            'variants.*.color'      => 'nullable|string',
            'variants.*.color_hex'  => 'nullable|string',
            'variants.*.sku'        => 'required_with:variants|string',
            'variants.*.price'      => 'required_with:variants|numeric',
            'variants.*.stock'      => 'sometimes|integer|min:0',
        ]);

        $data['slug'] = Str::slug($data['name']) . '-' . Str::random(4);

        $variants = array_filter((array) ($data['variants'] ?? []), 'is_array');
        unset($data['variants']);

        // Auto-derive has_variants from whether variants were submitted
        if (!isset($data['has_variants'])) {
            $data['has_variants'] = \count($variants) > 0;
        }

        $product = Product::create($data);
        $productId = (int) $product->getAttribute('id');
        $productName = (string) $product->getAttribute('name');

        foreach ($variants as $v) {
            ProductVariant::create(array_merge($v, ['product_id' => $productId]));
        }

        // Handle inline image upload (multipart/form-data requests)
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $i => $file) {
                $path = $file->store("products/{$productId}", 'public');
                ProductImage::create([
                    'product_id' => $productId,
                    'image_path' => $path,
                    'alt_text'   => $productName,
                    'sort_order' => $i,
                    'is_primary' => $i === 0,
                ]);
            }
        }

        return response()->json(['success' => true, 'data' => $product->load(['variants', 'images'])], 201);
    }

    public function show(int $id)
    {
        $product = Product::with(['images', 'variants', 'category'])->findOrFail($id);
        return response()->json(['success' => true, 'data' => $product]);
    }

    public function update(Request $request, int $id)
    {
        $product = Product::findOrFail($id);
        $data    = $request->validate([
            'name'              => 'sometimes|string|max:200',
            'category_id'       => 'sometimes|integer|exists:categories,id',
            'short_description' => 'nullable|string',
            'description'       => 'nullable|string',
            'base_price'        => 'sometimes|numeric|min:0',
            'sale_price'        => 'nullable|numeric|min:0',
            'cost_price'        => 'nullable|numeric|min:0',
            'sku'               => 'sometimes|string|unique:products,sku,' . $id,
            'brand'             => 'nullable|string',
            'fabric'            => 'nullable|string',
            'care_instructions' => 'nullable|string',
            'tags'              => 'nullable|string',
            'meta_title'        => 'nullable|string|max:200',
            'meta_description'  => 'nullable|string|max:300',
            'is_featured'       => 'sometimes|boolean',
            'is_new_arrival'    => 'sometimes|boolean',
            'is_bestseller'     => 'sometimes|boolean',
            'status'            => 'sometimes|in:draft,active,archived',
            'total_stock'       => 'sometimes|integer|min:0',
        ]);
        $product->update($data);

        // Handle new images uploaded during edit
        if ($request->hasFile('images')) {
            $productId  = (int) $product->getAttribute('id');
            $productName = (string) $product->getAttribute('name');
            $hasPrimary = ProductImage::where('product_id', $productId)->where('is_primary', true)->exists();

            foreach ($request->file('images') as $i => $file) {
                $path = $file->store("products/{$productId}", 'public');
                ProductImage::create([
                    'product_id' => $productId,
                    'image_path' => $path,
                    'alt_text'   => $productName,
                    'sort_order' => $i,
                    'is_primary' => !$hasPrimary && $i === 0,
                ]);
            }
        }

        return response()->json(['success' => true, 'data' => $product->fresh(['images', 'variants'])]);
    }

    public function destroy(int $id)
    {
        Product::findOrFail($id)->delete();
        return response()->json(['success' => true, 'message' => 'Product deleted']);
    }

    public function uploadImages(Request $request, int $id)
    {
        $request->validate(['images' => 'required|array', 'images.*' => 'image|max:3072']);
        $product     = Product::findOrFail($id);
        $productId   = (int) $product->getAttribute('id');
        $productName = (string) $product->getAttribute('name');
        $hasPrimary  = ProductImage::where('product_id', $productId)->where('is_primary', true)->exists();

        foreach ($request->file('images') as $i => $file) {
            $path = $file->store("products/{$productId}", 'public');
            ProductImage::create([
                'product_id' => $productId,
                'image_path' => $path,
                'alt_text'   => $productName,
                'sort_order' => $i,
                'is_primary' => !$hasPrimary && $i === 0,
            ]);
        }
        return response()->json(['success' => true, 'data' => $product->fresh('images')]);
    }

    public function deleteImage(int $id, int $imgId)
    {
        ProductImage::where('product_id', $id)->findOrFail($imgId)->delete();
        return response()->json(['success' => true, 'message' => 'Image deleted']);
    }

    public function bulkStatus(Request $request)
    {
        $data = $request->validate([
            'ids'    => 'required|array',
            'status' => 'required|in:draft,active,archived',
        ]);
        Product::whereIn('id', $data['ids'])->update(['status' => $data['status']]);
        return response()->json(['success' => true, 'message' => 'Status updated']);
    }

    public function import(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:csv,xlsx,xls|max:5120']);

        $import = new ProductsImport();
        Excel::import($import, $request->file('file'));

        return response()->json([
            'success' => true,
            'data'    => [
                'imported' => $import->imported,
                'skipped'  => $import->skipped,
                'total'    => $import->imported + \count($import->skipped),
            ],
        ]);
    }

    public function importTemplate()
    {
        $headers = ['name','sku','category_id','category','base_price','sale_price',
                    'description','fabric','care_instructions','tags',
                    'status','is_featured','is_new_arrival','stock'];

        $example = ['Sample Kurta','KRT-001','','Kurtas','1299','999',
                    'Beautiful cotton kurta','Cotton','Hand wash cold','kurta,cotton,summer',
                    'active','0','1','100'];

        $csv = implode(',', $headers) . "\n" . implode(',', $example) . "\n";

        return response($csv, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => 'attachment; filename="products_import_template.csv"',
        ]);
    }

    public function export()
    {
        $products = Product::with('category')->get();
        return response()->json(['success' => true, 'data' => $products]);
    }
}
