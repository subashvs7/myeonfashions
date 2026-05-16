<?php
namespace Database\Seeders;

use App\Models\Coupon;
use Illuminate\Database\Seeder;

class CouponSeeder extends Seeder
{
    public function run(): void
    {
        Coupon::create([
            'code'            => 'WELCOME10',
            'title'           => 'Welcome Discount',
            'description'     => '10% off on your first order',
            'type'            => 'percentage',
            'value'           => 10,
            'min_order_value' => 500,
            'max_discount'    => 500,
            'usage_per_user'  => 1,
            'first_order_only'=> true,
            'is_active'       => true,
        ]);

        Coupon::create([
            'code'            => 'FLAT200',
            'title'           => 'Flat ₹200 Off',
            'description'     => 'Flat ₹200 off on orders above ₹1500',
            'type'            => 'flat',
            'value'           => 200,
            'min_order_value' => 1500,
            'usage_per_user'  => 2,
            'is_active'       => true,
        ]);

        Coupon::create([
            'code'            => 'FREESHIP',
            'title'           => 'Free Shipping',
            'description'     => 'Free shipping on any order',
            'type'            => 'free_shipping',
            'value'           => 0,
            'min_order_value' => 299,
            'is_active'       => true,
        ]);
    }
}
