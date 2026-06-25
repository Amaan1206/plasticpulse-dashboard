# PlasticPulse

PlasticPulse is a React admin dashboard plus a Node/Express bridge server for ESP32-S3 smart-bin scans.

## Ports

- Frontend: `http://127.0.0.1:5173`
- Backend: `http://127.0.0.1:3001`
- WebSocket: `ws://127.0.0.1:3001/ws/detections`

The frontend port is fixed to `5173` so it never accidentally steals the backend port.

## What It Does

- Stores every scan separately in PostgreSQL
- Saves scan image payloads in PostgreSQL
- Saves composition data like plastic, metal, organic, glass, and other
- Shows a live scan animation on the admin dashboard while the ESP32 is scanning
- Shows scan history as permanent logs

## Friend Setup

### 1. Clone and install

From the project root:

```bash
npm install
npm run setup:server
```

### 2. Install PostgreSQL

On macOS with Homebrew:

```bash
brew install postgresql@16
brew services start postgresql@16
```

On Windows:

1. Install PostgreSQL 16 from the official PostgreSQL installer
2. Keep note of the PostgreSQL username and password you choose during setup
3. Make sure the PostgreSQL service is running

### 3. Configure the backend

Inside `server/`, copy `.env.example` to `.env` and update `PGUSER` if needed.

Example:

```bash
cd server
cp .env.example .env
```

On Windows PowerShell:

```powershell
cd server
Copy-Item .env.example .env
```

If the OS account or PostgreSQL username is `alex`, then set:

```env
PGUSER=alex
```

On Windows, if you also set a PostgreSQL password, add:

```env
PGPASSWORD=your_postgres_password
```

### 4. Create database and tables

From the project root:

```bash
npm run db:init
```

If you ever want to wipe development/test scan data and return the dashboard to an empty real-time state:

```bash
npm run db:clear
```

### 5. Start the backend

From the project root:

```bash
npm run dev:server
```

Or inside `server/`:

```bash
npm run dev
```

Important:

- `server/` does not use Vite
- `npm run dev` inside `server/` now starts the Node server in watch mode
- If the frontend shows `ECONNREFUSED` for `/api/...`, it usually means the backend is not running yet

### 6. Start the frontend

From the project root in a second terminal:

```bash
npm run dev:client
```

Open:

```bash
http://127.0.0.1:5173
```

## Normal Local Workflow

Terminal 1:

```bash
npm run dev:server
```

Terminal 2:

```bash
npm run dev:client
```

## ESP32 API

These endpoints require `X-API-Key`.

### Start scan

```bash
curl -X POST http://127.0.0.1:3001/api/scan/start \
  -H "X-API-Key: pp-dev-key-2026" \
  -H "Content-Type: application/json" \
  -d '{"device_id":"esp-001","location_name":"Bandra West"}'
```

### Update progress

```bash
curl -X POST http://127.0.0.1:3001/api/scan/progress \
  -H "X-API-Key: pp-dev-key-2026" \
  -H "Content-Type: application/json" \
  -d '{"device_id":"esp-001","progress":45}'
```

### Complete detection

```bash
curl -X POST http://127.0.0.1:3001/api/detect \
  -H "X-API-Key: pp-dev-key-2026" \
  -H "Content-Type: application/json" \
  -d '{"device_id":"esp-001","plastic_type":"PET","confidence":0.94,"fill_level_pct":67,"composition":{"plastic":72,"metal":5,"organic":18,"glass":3,"other":2}}'
```

## Troubleshooting

### `npm run dev` fails inside `server/`

Use the updated script:

```bash
cd server
npm run dev
```

If that still fails, run:

```bash
npm run
```

and confirm `dev`, `start`, and `db:init` are listed.

### Frontend shows `http proxy error` or `ECONNREFUSED`

That means Vite is running but the backend on `3001` is not.

Start the backend first:

```bash
npm run dev:server
```

### Port already in use

Frontend is fixed to `5173` and backend to `3001`.

If one is occupied, stop the old process before restarting:

```bash
lsof -i :5173
lsof -i :3001
```

On Windows PowerShell:

```powershell
netstat -ano | findstr :5173
netstat -ano | findstr :3001
```

### PostgreSQL init fails

Make sure PostgreSQL is installed and running:

```bash
brew services start postgresql@16
```

Then retry:

```bash
npm run db:init
```

On Windows, common checks are:

- verify PostgreSQL is installed
- verify the PostgreSQL service is running
- verify `PGUSER` and `PGPASSWORD` in `server/.env` match the PostgreSQL account you created
