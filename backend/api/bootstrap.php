<?php
// api/bootstrap.php

// This file initializes the application environment.

// Include Composer's autoloader
require_once __DIR__ . '/../vendor/autoload.php';

// Load database connection and helper functions from the current directory
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

// --- Global Variables for Router ---
$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['PATH_INFO'] ?? '';
$path = trim($path, '/');
$segments = $path === '' ? [] : explode('/', $path);