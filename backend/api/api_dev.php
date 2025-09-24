<?php
// --- DEVELOPMENT/TEST API ENDPOINT (Connects to 'e_order_test' DB) ---
// This file is the entry point for the DEVELOPMENT/TEST environment.
// - It is called by the Vite dev server (`npm run dev`).
// - It is called directly by its filename (e.g., /api/api_dev.php/commands).
// - The `db.php` file automatically connects to the 'e_order_test' database when it detects the request is from the Vite dev server (localhost:5173).

// --- Development Environment Settings ---
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Define a constant to identify the development environment throughout the application.
define('IS_DEV_ENVIRONMENT', true);

// Allow CORS for local dev
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, ngrok-skip-browser-warning');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// Include Composer's autoloader
require_once __DIR__ . '/../vendor/autoload.php';

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];

// --- Simplified Path Parsing (with .htaccess) ---
// With `AcceptPathInfo On` in .htaccess, PATH_INFO becomes the most reliable
// source for the URL path segment that comes after the script name.
$path = $_SERVER['PATH_INFO'] ?? '';
$path = trim($path, '/');
$segments = $path === '' ? [] : explode('/', $path);

// --- Execute the main application logic ---
require __DIR__ . '/app_dev.php';