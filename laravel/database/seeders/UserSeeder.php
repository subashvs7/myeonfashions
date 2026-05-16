<?php
namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name'     => 'Admin User',
            'email'    => 'admin@myeoncasuals.com',
            'password' => Hash::make('Admin@12345'),
            'role'     => 'admin',
            'is_active'=> true,
        ]);

        User::create([
            'name'     => 'Test Customer',
            'email'    => 'customer@myeoncasuals.com',
            'password' => Hash::make('Customer@12345'),
            'role'     => 'customer',
            'phone'    => '9876543210',
            'is_active'=> true,
        ]);
    }
}
