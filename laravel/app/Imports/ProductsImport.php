<?php
namespace App\Imports;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\SkipsOnError;
use Maatwebsite\Excel\Concerns\SkipsErrors;
use Maatwebsite\Excel\Concerns\SkipsOnFailure;
use Maatwebsite\Excel\Concerns\SkipsFailures;

class ProductsImport implements ToModel, WithHeadingRow, SkipsOnError, SkipsOnFailure
{
    use SkipsErrors, SkipsFailures;

    public int   $imported = 0;
    public array $skipped  = [];

    private array $categoryCache = [];

    public function model(array $row): ?Product
    {
        $name  = trim($row['name']  ?? '');
        $sku   = trim($row['sku']   ?? '');
        $price = trim($row['base_price'] ?? '');

        if (!$name || !$sku || !is_numeric($price)) {
            $this->skipped[] = "Row skipped (missing name/sku/base_price): '{$name}'";
            return null;
        }

        if (Product::where('sku', $sku)->exists()) {
            $this->skipped[] = "SKU already exists: '{$sku}'";
            return null;
        }

        $categoryId = $this->resolveCategory($row['category_id'] ?? null, $row['category'] ?? null);

        $salePrice = !empty($row['sale_price']) && is_numeric($row['sale_price'])
            ? (float) $row['sale_price']
            : null;

        $status = in_array($row['status'] ?? '', ['active', 'draft', 'archived'])
            ? $row['status']
            : 'active';

        $product = Product::create([
            'name'              => $name,
            'slug'              => Str::slug($name) . '-' . Str::random(4),
            'category_id'       => $categoryId,
            'base_price'        => (float) $price,
            'sale_price'        => $salePrice,
            'sku'               => $sku,
            'description'       => $row['description']       ?? null,
            'fabric'            => $row['fabric']            ?? null,
            'care_instructions' => $row['care_instructions'] ?? null,
            'tags'              => $row['tags']              ?? null,
            'status'            => $status,
            'is_featured'       => !empty($row['is_featured'])    && $row['is_featured']    != '0',
            'is_new_arrival'    => !empty($row['is_new_arrival'])  && $row['is_new_arrival']  != '0',
        ]);

        $stock = isset($row['stock']) && is_numeric($row['stock']) ? (int) $row['stock'] : 0;

        ProductVariant::create([
            'product_id' => $product->id,
            'sku'        => $sku . '-DEF',
            'price'      => (float) ($salePrice ?? $price),
            'stock'      => $stock,
        ]);

        $product->update(['total_stock' => $stock]);

        $this->imported++;
        return null; // already saved via create()
    }

    private function resolveCategory(mixed $id, mixed $name): ?int
    {
        if (!empty($id) && is_numeric($id)) return (int) $id;
        if (empty($name)) return null;
        $name = trim($name);
        if (isset($this->categoryCache[$name])) return $this->categoryCache[$name];
        $cat = Category::where('name', $name)->first();
        return $this->categoryCache[$name] = $cat?->id;
    }
}
