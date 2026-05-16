<?php
namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $categories = Category::whereNull('parent_id')->get()->keyBy('slug');

        $products = [
            [
                'name'              => 'Royal Kanjivaram Silk Saree',
                'category_slug'     => 'sarees',
                'short_description' => 'Pure Kanjivaram silk with gold zari border',
                'description'       => 'Experience the timeless elegance of authentic Kanjivaram silk. Hand-woven by master artisans in Tamil Nadu, this saree features intricate gold zari work and rich color combinations.',
                'base_price'        => 8999,
                'sale_price'        => 6999,
                'sku'               => 'KSS-001',
                'brand'             => 'Myeon Casuals',
                'fabric'            => 'Pure Silk',
                'care_instructions' => 'Dry clean only',
                'is_featured'       => true,
                'is_new_arrival'    => true,
                'total_stock'       => 50,
                'tags'              => 'silk,saree,kanjivaram,wedding',
                'has_variants'      => true,
                'colors'            => [['color' => 'Maroon', 'hex' => '#800000'], ['color' => 'Navy Blue', 'hex' => '#003153'], ['color' => 'Peacock Green', 'hex' => '#005A5B']],
            ],
            [
                'name'              => 'Embroidered Cotton Anarkali',
                'category_slug'     => 'anarkalis',
                'short_description' => 'Flared anarkali with thread embroidery',
                'description'       => 'A graceful flared anarkali suit crafted in premium cotton. Features delicate thread embroidery on the yoke and hem. Perfect for festive occasions.',
                'base_price'        => 2499,
                'sale_price'        => 1799,
                'sku'               => 'ANK-001',
                'brand'             => 'Myeon Casuals',
                'fabric'            => 'Cotton Blend',
                'care_instructions' => 'Machine wash cold',
                'is_featured'       => true,
                'is_bestseller'     => true,
                'total_stock'       => 80,
                'tags'              => 'anarkali,cotton,embroidery,festive',
                'has_variants'      => true,
                'colors'            => [['color' => 'Rose Pink', 'hex' => '#FF007F'], ['color' => 'Mint Green', 'hex' => '#98FF98']],
            ],
            [
                'name'              => 'Banarasi Silk Lehenga',
                'category_slug'     => 'lehengas',
                'short_description' => 'Grand Banarasi lehenga with dupatta',
                'description'       => 'Breathtaking Banarasi silk lehenga choli set with matching dupatta. Features traditional motifs woven in real zari. Ideal for weddings and sangeets.',
                'base_price'        => 15999,
                'sale_price'        => 12999,
                'sku'               => 'LEH-001',
                'brand'             => 'Myeon Casuals',
                'fabric'            => 'Banarasi Silk',
                'care_instructions' => 'Dry clean only',
                'is_featured'       => true,
                'is_new_arrival'    => true,
                'total_stock'       => 30,
                'tags'              => 'lehenga,banarasi,wedding,bridal',
                'has_variants'      => true,
                'colors'            => [['color' => 'Royal Red', 'hex' => '#8B0000'], ['color' => 'Deep Purple', 'hex' => '#2D1B69']],
            ],
            [
                'name'              => 'Straight Fit Cotton Kurta',
                'category_slug'     => 'kurtas',
                'short_description' => 'Daily wear straight kurta in pure cotton',
                'description'       => 'A versatile straight-cut kurta in breathable pure cotton. Minimal print, maximum comfort. Pairs beautifully with palazzos or jeans.',
                'base_price'        => 899,
                'sale_price'        => 699,
                'sku'               => 'KUR-001',
                'brand'             => 'Myeon Casuals',
                'fabric'            => 'Pure Cotton',
                'care_instructions' => 'Machine wash',
                'is_new_arrival'    => true,
                'is_bestseller'     => true,
                'total_stock'       => 150,
                'tags'              => 'kurta,cotton,daily,casual',
                'has_variants'      => true,
                'colors'            => [['color' => 'White', 'hex' => '#FFFFFF'], ['color' => 'Sky Blue', 'hex' => '#87CEEB'], ['color' => 'Peach', 'hex' => '#FFDAB9']],
            ],
            [
                'name'              => 'Designer Georgette Dupatta',
                'category_slug'     => 'dupattas',
                'short_description' => 'Hand-block printed georgette dupatta',
                'description'       => 'A beautifully hand-block printed georgette dupatta with tassel ends. Adds an ethnic touch to any outfit.',
                'base_price'        => 599,
                'sale_price'        => null,
                'sku'               => 'DUP-001',
                'brand'             => 'Myeon Casuals',
                'fabric'            => 'Georgette',
                'care_instructions' => 'Dry clean',
                'is_bestseller'     => true,
                'total_stock'       => 100,
                'tags'              => 'dupatta,georgette,handblock',
                'has_variants'      => false,
            ],
        ];

        $sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

        foreach ($products as $productData) {
            $catSlug = $productData['category_slug'];
            $colors  = $productData['colors'] ?? [];
            unset($productData['category_slug'], $productData['colors']);

            $category = $categories[$catSlug] ?? Category::first();
            $productData['category_id'] = $category->id;
            $productData['status']      = 'active';

            $product = Product::create($productData);

            if ($product->has_variants) {
                foreach ($colors as $color) {
                    foreach (['M', 'L', 'XL'] as $size) {
                        ProductVariant::create([
                            'product_id' => $product->id,
                            'color'      => $color['color'],
                            'color_hex'  => $color['hex'],
                            'size'       => $size,
                            'sku'        => $product->sku . '-' . strtoupper(substr($color['color'], 0, 2)) . '-' . $size,
                            'price'      => $product->base_price,
                            'sale_price' => $product->sale_price,
                            'stock'      => rand(5, 30),
                            'is_active'  => true,
                        ]);
                    }
                }
            }
        }
    }
}
