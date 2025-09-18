<?php
header('Content-Type: application/json; charset=utf-8');
// Allow CORS for local dev
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

// --- Simplified Path Parsing (with .htaccess) ---
// With .htaccess rewriting URLs to `index.php/path`, PATH_INFO becomes the
// most reliable source for the URL path segment.
$path = $_SERVER['PATH_INFO'] ?? '';
$path = trim($path, '/');

$segments = $path === '' ? [] : explode('/', $path);

// Routing
if (!empty($segments) && $segments[0] === 'commands') {
    // /commands or /commands/:id
    if ($method === 'POST' && count($segments) === 1) {
        // Support multipart/form-data for file uploads
        $data = $_POST;
        // if JSON body
        if (empty($data)) $data = parse_json_request();

        $command_number = $data['command_number'] ?? null;
        $title = $data['title'] ?? null;
        $date_received = $data['date_received'] ?? null;
        $type = $data['type'] ?? null;
        $document_type = $data['document_type'] ?? 'คำสั่ง';
        $agency = $data['agency'] ?? null;
        $budget = (isset($data['budget']) && $data['budget'] !== '') ? $data['budget'] : null;
        $details = $data['details'] ?? null;
        $status = $data['status'] ?? 'In Progress';

        if (!$command_number || !$title || !$date_received || !$type) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            exit;
        }

        list($fiscal_year, $fiscal_half) = compute_fiscal_from_date($date_received);

        $file_path = handle_file_upload('file');

        try {
            $stmt = $pdo->prepare('INSERT INTO commands (command_number,title,date_received,`type`,document_type,agency,budget,details,`status`,fiscal_year,fiscal_half,file_path) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)');
            $stmt->execute([$command_number,$title,$date_received,$type,$document_type,$agency,$budget,$details,$status,$fiscal_year,$fiscal_half,$file_path]);
            $id = $pdo->lastInsertId();
            $stmt = $pdo->prepare('SELECT * FROM commands WHERE id = ?');
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            echo json_encode($row);
            exit;
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error during command creation', 'message' => $e->getMessage()]);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Server error during command creation', 'message' => $e->getMessage()]);
            exit;
        }
    }

    if ($method === 'GET' && count($segments) === 1) {
        // Filters: type, status, fiscal_year, fiscal_half, page, limit
        $params = $_GET;

        // Pagination
        $page = isset($params['page']) ? max(1, intval($params['page'])) : 1;
        $limit = isset($params['limit']) ? max(1, intval($params['limit'])) : 10; // Default 10 per page
        $offset = ($page - 1) * $limit;

        $where = [];
        $values = [];
        // Search term 'q'
        if (!empty($params['q'])) {
            $q = '%' . $params['q'] . '%';
            $where[] = '(command_number LIKE ? OR title LIKE ?)';
            $values[] = $q;
            $values[] = $q;
        }
        if (!empty($params['type'])) { $where[] = '`type` = ?'; $values[] = $params['type']; }
        if (!empty($params['status'])) { $where[] = '`status` = ?'; $values[] = $params['status']; }
        if (!empty($params['fiscal_year'])) { $where[] = 'fiscal_year = ?'; $values[] = $params['fiscal_year']; }
        if (!empty($params['fiscal_half'])) { $where[] = 'fiscal_half = ?'; $values[] = $params['fiscal_half']; }

        $where_clause = $where ? ' WHERE ' . implode(' AND ', $where) : '';

        // Get total count for pagination
        $count_sql = 'SELECT COUNT(*) FROM commands' . $where_clause;
        $count_stmt = $pdo->prepare($count_sql);
        $count_stmt->execute($values);
        $total_rows = $count_stmt->fetchColumn();

        // Get paginated data
        $data_sql = 'SELECT * FROM commands' . $where_clause . ' ORDER BY date_received DESC, id DESC LIMIT ? OFFSET ?';
        $stmt = $pdo->prepare($data_sql);

        // Bind all parameters with correct types
        $param_index = 1;
        foreach ($values as $value) {
            $stmt->bindValue($param_index++, $value); // Bind filter values
        }
        $stmt->bindValue($param_index++, $limit, PDO::PARAM_INT); // Bind LIMIT
        $stmt->bindValue($param_index++, $offset, PDO::PARAM_INT); // Bind OFFSET

        $stmt->execute();
        $rows = $stmt->fetchAll();

        // Return structured response
        echo json_encode(['data' => $rows, 'total' => (int)$total_rows, 'page' => $page, 'limit' => $limit]);
        exit;
    }

    if ($method === 'GET' && count($segments) === 2) {
        $id = intval($segments[1]);
        $stmt = $pdo->prepare('SELECT * FROM commands WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) { http_response_code(404); echo json_encode(['error'=>'Not found']); exit; }
        echo json_encode($row);
        exit;
    }

    if (($method === 'PUT' || $method === 'POST') && count($segments) === 2) {
        // Accept both PUT and POST for updates (POST with _method=PUT possible)
        $id = intval($segments[1]);
        // If request is multipart/form-data (file upload), use $_POST/$_FILES; else parse JSON for PUT
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
        $data = [];
        if (strpos($contentType, 'multipart/form-data') !== false) {
            $data = $_POST;
            // handle file replacement
            $new_file = handle_file_upload('file');
            if ($new_file) {
                // delete old file if present
                $stmt = $pdo->prepare('SELECT file_path FROM commands WHERE id = ?');
                $stmt->execute([$id]);
                $old = $stmt->fetchColumn();
                if ($old) {
                    $oldpath = __DIR__ . '/../' . $old; // old is 'uploads/xxx'
                    if (file_exists($oldpath)) @unlink($oldpath);
                }
                $data['file_path'] = $new_file;
            }
        } else {
            $data = parse_json_request();
            if (empty($data) && ($_SERVER['CONTENT_TYPE']??'') === 'application/x-www-form-urlencoded') {
                parse_str(file_get_contents('php://input'), $data);
            }
        }

        // Allow partial updates of fields
        $allowed = ['command_number','title','date_received','type','document_type','agency','budget','details','status','file_path'];
        $sets = [];
        $values = [];
        foreach ($allowed as $f) {
            if (isset($data[$f])) {
                $current_value = $data[$f];
                // Ensure empty budget string becomes a proper PHP null for the database
                if ($f === 'budget' && $current_value === '') {
                    $current_value = null;
                }
                $sets[] = "$f = ?";
                $values[] = $current_value;
            }
        }

        if (isset($data['date_received'])) {
            list($fy,$fh) = compute_fiscal_from_date($data['date_received']);
            $sets[] = 'fiscal_year = ?'; $values[] = $fy;
            $sets[] = 'fiscal_half = ?'; $values[] = $fh;
        }

        try {
            if (!$sets) { http_response_code(400); echo json_encode(['error'=>'No fields to update']); exit; }
            $values[] = $id;
            $sql = 'UPDATE commands SET ' . implode(', ', $sets) . ' WHERE id = ?';
            $stmt = $pdo->prepare($sql);
            $stmt->execute($values);
            $stmt = $pdo->prepare('SELECT * FROM commands WHERE id = ?');
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            echo json_encode($row);
            exit;
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error during command update', 'message' => $e->getMessage()]);
            exit;
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Server error during command update', 'message' => $e->getMessage()]);
            exit;
        }
    }

    if ($method === 'DELETE' && count($segments) === 2) {
        $id = intval($segments[1]);

        try {
            // First, get the file_path to delete the associated file
            $stmt = $pdo->prepare('SELECT file_path FROM commands WHERE id = ?');
            $stmt->execute([$id]);
            $file_path = $stmt->fetchColumn();

            if ($file_path) {
                $full_path = __DIR__ . '/../' . $file_path;
                if (file_exists($full_path)) {
                    @unlink($full_path);
                }
            }

            // Then, delete the record from the database
            $stmt = $pdo->prepare('DELETE FROM commands WHERE id = ?');
            $stmt->execute([$id]);

            if ($stmt->rowCount() > 0) {
                echo json_encode(['message' => 'Command deleted successfully']);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Command not found']);
            }
            exit;
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error during command deletion', 'message' => $e->getMessage()]);
            exit;
        }
    }
}

// Serve uploaded files directly when path starts with uploads/
// e.g. GET /uploads/<filename>
if (!empty($segments) && $segments[0] === 'uploads' && isset($segments[1]) && $method === 'GET') {
    $filename = basename($segments[1]);
    $full = __DIR__ . '/../uploads/' . $filename;
    if (!file_exists($full)) { http_response_code(404); echo json_encode(['error'=>'File not found']); exit; }
    // Determine mime type
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $full);
    finfo_close($finfo);
    header('Content-Type: ' . $mime);
    header('Content-Length: ' . filesize($full));
    readfile($full);
    exit;
}

if (!empty($segments) && $segments[0] === 'summary') {
    // Summarize number of commands by type and status for fiscal_year (optional param)
    $fy = $_GET['fiscal_year'] ?? null;
    $where = '';
    $values = [];
    if ($fy) { $where = ' WHERE fiscal_year = ?'; $values[] = $fy; }

    $sql = "SELECT `type`, `status`, COUNT(*) as cnt FROM commands" . $where . " GROUP BY `type`,`status`";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($values);
    $rows = $stmt->fetchAll();

    $out = [];
    foreach ($rows as $r) {
        $t = $r['type']; $s = $r['status']; $c = (int)$r['cnt'];
        if (!isset($out[$t])) $out[$t] = ['In Progress'=>0,'Completed'=>0];
        $out[$t][$s] = $c;
    }
    echo json_encode($out);
    exit;
}

http_response_code(404);
echo json_encode(['error'=>'Not Found']);
