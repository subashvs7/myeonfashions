<?php
namespace Database\Seeders;

use App\Models\ShippingZone;
use Illuminate\Database\Seeder;

class ShippingZoneSeeder extends Seeder
{
    public function run(): void
    {
        ShippingZone::create([
            'name'           => 'Standard Delivery',
            'flat_rate'      => 99,
            'free_above'     => 999,
            'estimated_days' => 5,
            'is_active'      => true,
        ]);

        ShippingZone::create([
            'name'           => 'Metro Cities Express',
            'states'         => ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu'],
            'flat_rate'      => 59,
            'free_above'     => 599,
            'estimated_days' => 2,
            'is_active'      => true,
        ]);
    }
}
