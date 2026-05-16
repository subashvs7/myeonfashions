#!/bin/bash
# ─────────────────────────────────────────────────────────────────
#  Myeon Casuals — Hostinger SSH Setup Script
#  Run once via SSH after uploading files:
#    bash ~/hostinger-setup.sh
# ─────────────────────────────────────────────────────────────────

DOMAIN="myeoncasuals.com"
BASE="$HOME/domains/$DOMAIN"
LARAVEL="$BASE/laravel"
PUBLIC="$BASE/public_html"

echo ""
echo "=== Myeon Casuals — Hostinger Setup ==="
echo "Laravel: $LARAVEL"
echo "Public:  $PUBLIC"
echo ""

# ── 1. Permissions ──────────────────────────────────────────────
echo "[1/7] Setting permissions..."
chmod -R 755 "$LARAVEL/storage"
chmod -R 755 "$LARAVEL/bootstrap/cache"
echo "      ✓ Done"

# ── 2. Storage symlink ───────────────────────────────────────────
echo "[2/7] Creating storage symlink..."
rm -f "$PUBLIC/storage"
ln -s "$LARAVEL/storage/app/public" "$PUBLIC/storage"
echo "      ✓ $PUBLIC/storage → $LARAVEL/storage/app/public"

# ── 3. App key ──────────────────────────────────────────────────
echo "[3/7] Generating app key..."
cd "$LARAVEL"
php artisan key:generate --force
echo "      ✓ Done"

# ── 4. Migrations ───────────────────────────────────────────────
echo "[4/7] Running migrations..."
php artisan migrate --force
echo "      ✓ Done"

# ── 5. Seed production data ─────────────────────────────────────
echo "[5/7] Seeding production data (admin user, settings, shipping)..."
php artisan db:seed --class=ProductionSeeder --force
echo "      ✓ Done"

# ── 6. Build caches ─────────────────────────────────────────────
echo "[6/7] Building caches..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
echo "      ✓ Done"

# ── 7. Verify ───────────────────────────────────────────────────
echo "[7/7] Verifying..."
[ -L "$PUBLIC/storage" ]      && echo "      ✓ Storage symlink OK"   || echo "      ✗ Storage symlink MISSING"
[ -f "$PUBLIC/index.html" ]   && echo "      ✓ React SPA found"       || echo "      ✗ index.html MISSING — upload dist/ contents to public_html/"
[ -f "$PUBLIC/index.php" ]    && echo "      ✓ index.php found"       || echo "      ✗ index.php MISSING — upload deploy/index.php to public_html/"
[ -f "$PUBLIC/.htaccess" ]    && echo "      ✓ .htaccess found"       || echo "      ✗ .htaccess MISSING — upload deploy/public_html.htaccess as .htaccess"
[ -f "$LARAVEL/.env" ]        && echo "      ✓ .env found"            || echo "      ✗ .env MISSING"

echo ""
echo "=== Setup complete! Visit https://$DOMAIN ==="
echo ""
