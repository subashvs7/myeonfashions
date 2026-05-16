<?php
namespace Database\Seeders;

use App\Models\Banner;
use Illuminate\Database\Seeder;

class BannerSeeder extends Seeder
{
    public function run(): void
    {
        $banners = [
            ['title' => 'New Arrivals', 'subtitle' => 'Festive Season Collection', 'image' => 'banners/hero1.jpg', 'position' => 'hero', 'sort_order' => 1, 'button_text' => 'Shop Now', 'link' => '/new-arrivals'],
            ['title' => 'Saree Sale', 'subtitle' => 'Up to 40% Off', 'image' => 'banners/hero2.jpg', 'position' => 'hero', 'sort_order' => 2, 'button_text' => 'Explore', 'link' => '/categories/sarees'],
            ['title' => 'Bridal Lehengas', 'subtitle' => 'Start from ₹8999', 'image' => 'banners/hero3.jpg', 'position' => 'hero', 'sort_order' => 3, 'button_text' => 'View Collection', 'link' => '/categories/lehengas'],
        ];

        foreach ($banners as $banner) {
            Banner::create(array_merge($banner, ['is_active' => true]));
        }
    }
}
