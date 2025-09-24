<?php
// A temporary script to create a user with a hashed password.
// Run this from the command line: `php backend/create_user.php`

require_once __DIR__ . '/api/db.php';

$username = 'slowbs';
$password = '1596321'; // Change this to your desired password
$name = 'Admin User';
$role = 'admin';

echo "Attempting to create user '$username' in database '$DB_NAME'...\n";

$hashed_password = password_hash($password, PASSWORD_DEFAULT);

try {
    // Check if user already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
    $stmt->execute([$username]);
    if ($stmt->fetch()) {
        echo "Error: User '$username' already exists.\n";
        exit;
    }
    $stmt = $pdo->prepare("INSERT INTO users (username, password, name, role) VALUES (?, ?, ?, ?)");
    $stmt->execute([$username, $hashed_password, $name, $role]);
    echo "User '$username' created successfully!\n";
} catch (PDOException $e) {
    echo "Error creating user: " . $e->getMessage() . "\n";
}