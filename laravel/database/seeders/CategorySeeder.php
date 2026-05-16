<?php
namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Sarees',       'slug' => 'sarees',       'banner_color' => '#7C3AED', 'sort_order' => 1],
            ['name' => 'Kurtas',       'slug' => 'kurtas',       'banner_color' => '#2D1B69', 'sort_order' => 2],
            ['name' => 'Lehengas',     'slug' => 'lehengas',     'banner_color' => '#DC2626', 'sort_order' => 3],
            ['name' => 'Anarkalis',    'slug' => 'anarkalis',    'banner_color' => '#059669', 'sort_order' => 4],
            ['name' => 'Dupattas',     'slug' => 'dupattas',     'banner_color' => '#D97706', 'sort_order' => 5],
            ['name' => 'Men\'s Wear',  'slug' => 'mens-wear',    'banner_color' => '#1E40AF', 'sort_order' => 6],
            ['name' => 'Accessories',  'slug' => 'accessories',  'banner_color' => '#B45309', 'sort_order' => 7],
        ];

        foreach ($categories as $cat) {
            Category::create(array_merge($cat, ['is_active' => true, 'show_in_menu' => true]));
        }

        $sarees = Category::where('slug', 'sarees')->first();
        $sub = [
            ['name' => 'Silk Sarees',    'slug' => 'silk-sarees'],
            ['name' => 'Cotton Sarees',  'slug' => 'cotton-sarees'],
            ['name' => 'Georgette',      'slug' => 'georgette-sarees'],
            ['name' => 'Banarasi',       'slug' => 'banarasi-sarees'],
        ];
        foreach ($sub as $s) {
            Category::create(array_merge($s, ['parent_id' => $sarees->id, 'banner_color' => '#7C3AED', 'is_active' => true, 'show_in_menu' => true]));
        }
    }
}
