<?php
/**
 * Shared Hosting Entry Point
 *
 * Use this file as public_html/index.php when the Laravel application
 * folder is placed ONE LEVEL ABOVE public_html (recommended for security).
 *
 * Expected structure on cPanel:
 *   ~/laravel/          ← entire Laravel project (app/, vendor/, .env, etc.)
 *   ~/public_html/      ← web root
 *       index.php       ← THIS file
 *       index.html      ← built React SPA
 *       assets/
 *       sw.js
 *       manifest.webmanifest
 *       .htaccess
 *       storage/        ← symlink: ln -s ~/laravel/storage/app/public ~/public_html/storage
 */

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Path to the Laravel root (renamed to api/, sits inside public_html)
$laravel = __DIR__ . '/api';

if (file_exists($maintenance = $laravel . '/storage/framework/maintenance.php')) {
    require $maintenance;
}

require $laravel . '/vendor/autoload.php';

/** @var Application $app */
$app = require_once $laravel . '/bootstrap/app.php';

$app->handleRequest(Request::capture());
