<?php
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

function parse_json_request() {
    $data = json_decode(file_get_contents('php://input'), true);
    return $data ?: [];
}

function compute_fiscal_from_date($date_str) {
    // Fiscal year runs Oct 1 - Sep 30.
    // We will return fiscal_year as last two digits of the Buddhist Era (BE) start year,
    // matching examples like 68, 69. For example: if date is 2024-11-01 (AD), BE = 2567,
    // start_of_fiscal = BE (since month >= 10) -> fiscal_year = '67'.
    $d = new DateTime($date_str);
    $year = (int)$d->format('Y');
    $month = (int)$d->format('m');

    // Buddhist Era year
    $be_year = $year + 543;
    // Fiscal runs Oct 1 - Sep 30. We return the fiscal END year (BE) last two digits.
    // If month >= Oct, fiscal end is next BE year; otherwise it's the current BE year.
    $end_of_fiscal = ($month >= 10) ? ($be_year + 1) : $be_year;
    $fiscal_year = substr((string)$end_of_fiscal, -2);

    // first_half: Oct - Mar, second_half: Apr - Sep
    $fiscal_half = ($month >= 10 || $month <= 3) ? 'first_half' : 'second_half';

    return [$fiscal_year, $fiscal_half];
}

function handle_file_upload($field_name = 'file') {
    if (!isset($_FILES[$field_name]) || $_FILES[$field_name]['error'] !== UPLOAD_ERR_OK) return null;

    $uploads_dir = __DIR__ . '/../uploads';
    if (!is_dir($uploads_dir)) mkdir($uploads_dir, 0755, true);

    $tmp_name = $_FILES[$field_name]['tmp_name'];
    $original = basename($_FILES[$field_name]['name']);
    $ext = pathinfo($original, PATHINFO_EXTENSION);
    $filename = uniqid('doc_', true) . ($ext ? ('.' . $ext) : '');
    $dest = $uploads_dir . '/' . $filename;
    if (move_uploaded_file($tmp_name, $dest)) {
        // Return web path relative to backend root (served from backend/uploads)
        return 'uploads/' . $filename;
    }
    return null;
}

/**
 * Creates a JSON Web Token (JWT).
 * @param array $user_data The user data to encode in the token.
 * @return string The generated JWT.
 */
function create_jwt(array $user_data): string {
    $secret_key = getenv('JWT_SECRET') ?: 'YOUR_DEFAULT_SECRET_KEY_CHANGE_ME';
    $issuer_claim = "YOUR_APP_NAME"; // e.g., "e-order-api"
    $audience_claim = "YOUR_APP_NAME";
    $issuedat_claim = time();
    $expire_claim = $issuedat_claim + (8 * 60 * 60); // 8 hours

    $payload = [
        'iss' => $issuer_claim,
        'aud' => $audience_claim,
        'iat' => $issuedat_claim,
        'exp' => $expire_claim,
        'data' => [
            'id' => $user_data['id'],
            'username' => $user_data['username'],
            'role' => $user_data['role'],
        ]
    ];

    return JWT::encode($payload, $secret_key, 'HS256');
}

/**
 * Validates a JWT from the Authorization header and returns the decoded payload.
 * @return object|null The decoded payload object on success, or triggers a 401 error on failure.
 */
function validate_jwt(): ?object {
    $secret_key = getenv('JWT_SECRET') ?: 'YOUR_DEFAULT_SECRET_KEY_CHANGE_ME';
    $auth_header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

    if (preg_match('/Bearer\s(\S+)/', $auth_header, $matches)) {
        $jwt = $matches[1];
        try {
            $decoded = JWT::decode($jwt, new Key($secret_key, 'HS256'));
            return $decoded->data; // Return the user data part of the payload
        } catch (Exception $e) {
            // Token is invalid (expired, malformed, etc.)
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized', 'message' => $e->getMessage()]);
            exit;
        }
    }

    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized', 'message' => 'Authorization token not found']);
    exit;
}

/**
 * Sends a JSON response with appropriate headers and encoding.
 * @param mixed $data The data to encode.
 * @param int $status_code The HTTP status code to send.
 */
function json_response($data, int $status_code = 200) {
    http_response_code($status_code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}
