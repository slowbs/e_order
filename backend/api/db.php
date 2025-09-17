<?php
// Database connection
// This file reads DB settings from environment variables. For local development
// you can create a non-committed file at `backend/.env` with lines like:
// DB_HOST=127.0.0.1
// DB_NAME=e_order
// DB_USER=root
// DB_PASS=
// The `backend/.env` file is parsed only if present and will NOT overwrite
// variables already set in the environment.

// Load .env and prefer its values over existing environment variables.
$envPath = dirname(__DIR__) . '/.env';
if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || strpos($line, '#') === 0) continue;
        if (strpos($line, '=') === false) continue;
        list($key, $val) = explode('=', $line, 2);
        $key = trim($key);
        $val = trim($val);
        // Remove surrounding quotes if present
        if (strlen($val) >= 2 && ((($val[0] === '"') && ($val[strlen($val) - 1] === '"')) || (($val[0] === "'") && ($val[strlen($val) - 1] === "'")))) {
            $val = substr($val, 1, -1);
        }
        // Prefer .env value: overwrite any existing getenv value
        putenv("$key=$val");
        $_ENV[$key] = $val;
        $_SERVER[$key] = $val;
    }
}

// --- Database Selection Logic ---
// This logic switches the database based on which frontend version is making the request.
// It checks the 'Origin' header sent by the browser.

// The Vite dev server (test version) runs on port 5173.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$is_test_version = ($origin === 'http://localhost:5173');

// Read general DB config from environment variables with sensible defaults.
$DB_HOST = getenv('DB_HOST') ?: '127.0.0.1';
$DB_USER = getenv('DB_USER') ?: 'root';
$DB_PASS = getenv('DB_PASS') ?: '';

// Select the database name based on the detected version.
$DB_NAME = $is_test_version ? 'e_order_test' : 'e_order';

try {
    $pdo = new PDO("mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4", $DB_USER, $DB_PASS, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed', 'message' => $e->getMessage()]);
    exit;
}
