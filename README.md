# E-Order Document Management

This project contains a PHP backend (for XAMPP/Apache) and a React + Vite + Tailwind frontend.

Backend (c:/xampp/htdocs/e_order/backend):

- Import `schema.sql` into MySQL to create the `e_order` database and `commands` table. You can use phpMyAdmin or the mysql CLI:

	mysql -u root -p < backend/schema.sql

- Configure DB credentials: edit `api/db.php` or set environment variables `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS` for Apache/PHP.
- Ensure the backend folder is served by Apache. With XAMPP, placing `e_order` under `c:\xampp\htdocs` is already correct. The API lives at `http://localhost/e_order/backend/api`.
- Make sure `backend/uploads` is writable by Apache (Windows: ensure the user running Apache has write permission).

Quick API tests (after DB is created and Apache running):

- Create a command (using curl):

	curl -X POST "http://localhost/e_order/backend/api/commands" -F command_number="CMD-001" -F title="Test" -F date_received="2024-11-01" -F type="TOR" -F agency="Agency" -F details="Detail text" -F status="In Progress"

- Get commands:

	curl "http://localhost/e_order/backend/api/commands"

- Get summary for fiscal year 67:

	curl "http://localhost/e_order/backend/api/summary?fiscal_year=67"

File access and updates:

- Uploaded files are stored under `backend/uploads` and served at:
	`http://localhost/e_order/backend/uploads/<filename>`

- To update a command (JSON fields):

	curl -X PUT "http://localhost/e_order/backend/api/commands/1" -H "Content-Type: application/json" -d "{\"status\":\"Completed\"}"

- To update and replace file (multipart):

	curl -X POST "http://localhost/e_order/backend/api/commands/1" -F title="Updated title" -F file=@/path/to/newfile.pdf


Frontend (c:/xampp/htdocs/e_order/frontend):

- Install and run dev server:

	cd frontend
	npm install
	npm run dev

- By default the frontend uses VITE_API_BASE set in `.env` to `http://localhost/e_order/backend/api`. If your Apache serves the backend at a different path, update `.env` accordingly.

Notes & next steps:
- This scaffold is intended for single-user local use. For production, add authentication, input validation, file type/size checks, pagination, and tests.
- The fiscal year calculation assumes Thai fiscal year (Oct-Sep) and returns the last two digits of the Buddhist Era start year (e.g., 68).

