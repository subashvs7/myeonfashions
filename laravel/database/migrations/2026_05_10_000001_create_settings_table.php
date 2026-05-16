<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key', 100)->unique();
            $table->text('value')->nullable();
            $table->timestamps();
        });

        $defaults = [
            // General
            ['key' => 'app.name',              'value' => 'Myeon Casuals'],
            ['key' => 'app.tagline',           'value' => 'Style That Speaks'],
            ['key' => 'app.logo',              'value' => null],
            ['key' => 'app.favicon',           'value' => null],
            ['key' => 'app.currency',          'value' => 'INR'],
            ['key' => 'app.currency_symbol',   'value' => '₹'],
            ['key' => 'app.maintenance_mode',  'value' => '0'],

            // Payment
            ['key' => 'payment.online_enabled',          'value' => '1'],
            ['key' => 'payment.cod_enabled',             'value' => '0'],
            ['key' => 'payment.razorpay_key_id',         'value' => ''],
            ['key' => 'payment.razorpay_key_secret',     'value' => ''],
            ['key' => 'payment.min_order_amount',        'value' => '0'],

            // Email
            ['key' => 'email.mailer',         'value' => 'smtp'],
            ['key' => 'email.host',           'value' => ''],
            ['key' => 'email.port',           'value' => '587'],
            ['key' => 'email.username',       'value' => ''],
            ['key' => 'email.password',       'value' => ''],
            ['key' => 'email.from_address',   'value' => ''],
            ['key' => 'email.from_name',      'value' => 'Myeon Casuals'],
            ['key' => 'email.encryption',     'value' => 'tls'],

            // Store info
            ['key' => 'store.address',    'value' => ''],
            ['key' => 'store.phone',      'value' => ''],
            ['key' => 'store.whatsapp',   'value' => ''],
            ['key' => 'store.email',      'value' => ''],
            ['key' => 'store.facebook',   'value' => ''],
            ['key' => 'store.instagram',  'value' => ''],
            ['key' => 'store.twitter',    'value' => ''],
        ];

        $now = now();
        foreach ($defaults as &$row) {
            $row['created_at'] = $now;
            $row['updated_at'] = $now;
        }

        DB::table('settings')->insert($defaults);
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
