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

// Read DB config from environment variables. Defaults are neutral/safe.
$DB_HOST = getenv('DB_HOST') ?: '127.0.0.1';
$DB_NAME = getenv('DB_NAME') ?: 'e_order';
$DB_USER = getenv('DB_USER') ?: 'root';
$DB_PASS = getenv('DB_PASS') ?: '';

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
