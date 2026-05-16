<?php
namespace Database\Seeders;

use App\Models\User;
use App\Models\ShippingZone;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ProductionSeeder extends Seeder
{
    public function run(): void
    {
        // ── Admin user ────────────────────────────────────────────
        User::firstOrCreate(
            ['email' => 'admin@myeoncasuals.com'],
            [
                'name'     => 'Admin User',
                'password' => Hash::make('Admin@1234'),
                'role'     => 'admin',
                'is_active'=> true,
            ]
        );

        // ── Default settings ──────────────────────────────────────
        $defaults = [
            'store_name'        => 'Myeon Casuals',
            'store_email'       => 'admin@myeoncasuals.com',
            'store_phone'       => '',
            'currency'          => 'INR',
            'cod_enabled'       => true,
            'online_payment'    => false,
            'free_shipping_above' => 999,
        ];
        foreach ($defaults as $key => $value) {
            DB::table('settings')->updateOrInsert(
                ['key' => $key],
                ['value' => json_encode($value), 'updated_at' => now(), 'created_at' => now()]
            );
        }

        // ── Default nationwide shipping zone ──────────────────────
        ShippingZone::firstOrCreate(
            ['name' => 'India - Standard'],
            [
                'description'     => 'Standard delivery across India',
                'flat_rate'       => 60,
                'free_above'      => 999,
                'estimated_days'  => 7,
                'is_active'       => true,
            ]
        );

        $this->command->info('✓ Admin user: admin@myeoncasuals.com / Admin@1234');
        $this->command->info('✓ Default settings created');
        $this->command->info('✓ Shipping zone created');
        $this->command->warn('→ Change the admin password after first login!');
    }
}
