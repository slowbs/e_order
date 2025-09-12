<?php
header('Content-Type: application/json; charset=utf-8');
// Allow CORS for local dev
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
$uri = $_SERVER['REQUEST_URI'];

// Trim query string
if (false !== $qpos = strpos($uri, '?')) $uri = substr($uri, 0, $qpos);
// Remove base folder if .htaccess rewrote to api/index.php
$base = dirname($_SERVER['SCRIPT_NAME']);
if (strpos($uri, $base) === 0) $path = substr($uri, strlen($base)); else $path = $uri;
$path = trim($path, '/');

$segments = $path === '' ? [] : explode('/', $path);

// Routing
if ($segments[0] === 'commands' || (count($segments) === 0 && strpos($_SERVER['REQUEST_URI'], 'commands')!==false)) {
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
        $agency = $data['agency'] ?? null;
        $details = $data['details'] ?? null;
        $status = $data['status'] ?? 'In Progress';

        if (!$command_number || !$title || !$date_received || !$type) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields']);
            exit;
        }

        list($fiscal_year, $fiscal_half) = compute_fiscal_from_date($date_received);

        $file_path = handle_file_upload('file');

        $stmt = $pdo->prepare('INSERT INTO commands (command_number,title,date_received,`type`,agency,details,`status`,fiscal_year,fiscal_half,file_path) VALUES (?,?,?,?,?,?,?,?,?,?)');
        $stmt->execute([$command_number,$title,$date_received,$type,$agency,$details,$status,$fiscal_year,$fiscal_half,$file_path]);
        $id = $pdo->lastInsertId();
        $stmt = $pdo->prepare('SELECT * FROM commands WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        echo json_encode($row);
        exit;
    }

    if ($method === 'GET' && count($segments) === 1) {
        // Filters: type, status, fiscal_year, fiscal_half
        $params = $_GET;
        $where = [];
        $values = [];
        if (!empty($params['type'])) { $where[] = '`type` = ?'; $values[] = $params['type']; }
        if (!empty($params['status'])) { $where[] = '`status` = ?'; $values[] = $params['status']; }
        if (!empty($params['fiscal_year'])) { $where[] = 'fiscal_year = ?'; $values[] = $params['fiscal_year']; }
        if (!empty($params['fiscal_half'])) { $where[] = 'fiscal_half = ?'; $values[] = $params['fiscal_half']; }

        $sql = 'SELECT * FROM commands';
        if ($where) $sql .= ' WHERE ' . implode(' AND ', $where);
        $sql .= ' ORDER BY date_received DESC, id DESC LIMIT 500';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($values);
        $rows = $stmt->fetchAll();
        echo json_encode($rows);
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
        $allowed = ['command_number','title','date_received','type','agency','details','status','file_path'];
        $sets = [];
        $values = [];
        foreach ($allowed as $f) {
            if (isset($data[$f])) {
                $sets[] = "$f = ?";
                $values[] = $data[$f];
            }
        }

        if (isset($data['date_received'])) {
            list($fy,$fh) = compute_fiscal_from_date($data['date_received']);
            $sets[] = 'fiscal_year = ?'; $values[] = $fy;
            $sets[] = 'fiscal_half = ?'; $values[] = $fh;
        }

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
    }
}

// Serve uploaded files directly when path starts with uploads/
// e.g. GET /uploads/<filename>
if ($segments[0] === 'uploads' && isset($segments[1]) && $method === 'GET') {
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

if ($segments[0] === 'summary') {
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
