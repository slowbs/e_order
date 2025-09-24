<?php
// --- PRODUCTION API ENDPOINT (Connects to 'e_order' DB) ---
// This file is the main entry point for the PRODUCTION environment.
// - It is called by the built version of the frontend.
// - It relies on .htaccess to handle clean URLs (e.g., /api/commands).
// - The `db.php` file automatically connects to the 'e_order' (production) database.

// --- Production Environment Settings ---
ini_set('display_errors', 0);
error_reporting(0);

// Allow CORS for local dev
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, ngrok-skip-browser-warning');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

// Bootstrap the application from the parent directory
require_once __DIR__ . '/../bootstrap.php';

// --- Execute the main application logic ---
require __DIR__ . '/app.php';
