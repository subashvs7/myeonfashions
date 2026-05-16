<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone', 15)->unique()->nullable()->after('email');
            $table->timestamp('phone_verified_at')->nullable()->after('phone');
            $table->enum('role', ['customer', 'admin'])->default('customer')->after('password');
            $table->string('avatar')->nullable()->after('role');
            $table->string('gender')->nullable()->after('avatar');
            $table->date('dob')->nullable()->after('gender');
            $table->boolean('is_active')->default(true)->after('dob');
            $table->string('otp', 6)->nullable()->after('is_active');
            $table->timestamp('otp_expires_at')->nullable()->after('otp');
            $table->softDeletes();
        });
    }
    public function down(): void {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['phone','phone_verified_at','role','avatar','gender','dob','is_active','otp','otp_expires_at','deleted_at']);
        });
    }
};
