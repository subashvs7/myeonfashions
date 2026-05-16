<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->unsignedBigInteger('category_id');
            $table->foreign('category_id')->references('id')->on('categories');
            $table->text('short_description')->nullable();
            $table->longText('description')->nullable();
            $table->decimal('base_price', 10, 2);
            $table->decimal('sale_price', 10, 2)->nullable();
            $table->decimal('cost_price', 10, 2)->nullable();
            $table->string('sku')->unique();
            $table->string('barcode')->nullable();
            $table->string('brand')->nullable();
            $table->string('fabric')->nullable();
            $table->string('care_instructions')->nullable();
            $table->string('country_of_origin')->default('India');
            $table->decimal('weight', 8, 2)->nullable();
            $table->string('tags')->nullable();
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_new_arrival')->default(false);
            $table->boolean('is_bestseller')->default(false);
            $table->boolean('has_variants')->default(false);
            $table->enum('status', ['draft', 'active', 'archived'])->default('active');
            $table->integer('stock_alert_qty')->default(5);
            $table->integer('total_stock')->default(0);
            $table->integer('sold_count')->default(0);
            $table->decimal('avg_rating', 3, 2)->default(0);
            $table->integer('review_count')->default(0);
            $table->string('size_chart_image')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        try {
            DB::statement('ALTER TABLE products ADD FULLTEXT fulltext_products (name, brand, tags)');
        } catch (\Exception $e) {
            // Fulltext not supported on this MySQL version — LIKE-based search will be used
        }
    }
    public function down(): void {
        Schema::dropIfExists('products');
    }
};
