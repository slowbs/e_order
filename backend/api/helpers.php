<?php
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
