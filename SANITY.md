Sanity tests and quick checks

1) Database
 - Import `backend/schema.sql` into MySQL. Confirm table `commands` exists and indices `idx_type`, `idx_status`, `idx_fiscal_year` are present.

2) API
 - Start Apache (XAMPP). Access `http://localhost/e_order/backend/api/commands` — should return an empty array `[]`.
 - Create a command using curl or the frontend form. Confirm returned JSON contains `fiscal_year` and `fiscal_half`.

File viewing and update checks:
 - After uploading a file via the frontend, list `backend/uploads` to see the file. The public URL is `http://localhost/e_order/backend/uploads/<filename>`.
 - Update a command's metadata with:
	 curl -X PUT "http://localhost/e_order/backend/api/commands/1" -H "Content-Type: application/json" -d "{\"status\":\"Completed\"}"
 - Replace the file on a command with:
	 curl -X POST "http://localhost/e_order/backend/api/commands/1" -F file=@C:/path/to/new.pdf

3) Frontend
 - Run `npm install` in `frontend` and `npm run dev`.
 - Open the dev URL (Vite) and test adding a command with file upload; check that file appears under `backend/uploads` and `file_path` in DB is set.

Edge cases / notes:
 - File uploads are stored under `backend/uploads` and returned as `api/uploads/<file>` path. Adjust if deploying behind a different document root.
 - PUT for file uploads is not implemented; updating files should be done by re-upload via POST (create) or a future upload endpoint.
 - Fiscal year logic uses Thai BE last-two-digits. If you prefer full year (e.g., 2567) change `helpers.php` accordingly.
