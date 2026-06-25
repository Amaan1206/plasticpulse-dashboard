/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  PlasticPulse Bridge Server v2 — PostgreSQL + API Key + Scan Flow  │
 * │                                                                      │
 * │  ESP32 S3  ──[HTTP POST]──→  This Server  ──[WebSocket]──→  Dashboard│
 * │                                                                      │
 * │  Setup:  cd server && npm install && node db-init.js                 │
 * │  Run:    node server.js                                              │
 * └──────────────────────────────────────────────────────────────────────┘
 */

import express from 'express'
import cors from 'cors'
import { createServer } from 'http'
import { WebSocketServer } from 'ws'
import pg from 'pg'

const { Pool } = pg

const app = express()
const PORT = process.env.PORT || 3001
const API_KEY = process.env.PLASTICPULSE_API_KEY || 'pp-dev-key-2026'
const DB_NAME = process.env.PGDATABASE || 'plasticpulse'
const PG_USER = process.env.PGUSER || process.env.USER || process.env.USERNAME || 'postgres'
const PG_HOST = process.env.PGHOST || '127.0.0.1'
const PG_PORT = Number(process.env.PGPORT || 5432)
const PG_PASSWORD = process.env.PGPASSWORD || undefined

// ─── PostgreSQL Pool ───
const pool = new Pool({
  user: PG_USER,
  host: PG_HOST,
  database: DB_NAME,
  port: PG_PORT,
  password: PG_PASSWORD,
  max: 20,
})

pool.on('error', (err) => {
  console.error('⚠️  PostgreSQL pool error:', err.message)
})

// ─── Middleware ───
app.use(cors())
app.use(express.json({ limit: '10mb' })) // 10MB for base64 images

// ─── API Key Middleware (ESP32 endpoints only) ───
function requireApiKey(req, res, next) {
  const key = req.headers['x-api-key']
  if (!key || key !== API_KEY) {
    return res.status(401).json({ error: 'Invalid or missing API key. Set X-API-Key header.' })
  }
  next()
}

function normalizeComposition(rawComposition) {
  if (!rawComposition || typeof rawComposition !== 'object' || Array.isArray(rawComposition)) {
    return {}
  }

  const normalized = {}
  for (const [key, value] of Object.entries(rawComposition)) {
    const numericValue = Number(value)
    if (Number.isFinite(numericValue) && numericValue >= 0) {
      normalized[key] = Math.round(numericValue * 10) / 10
    }
  }

  return normalized
}

function normalizeImageBase64(imageValue) {
  if (typeof imageValue !== 'string' || imageValue.trim().length === 0) {
    return null
  }

  return imageValue
    .replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '')
    .replace(/\s+/g, '')
}

// ─── HTTP Server + WebSocket ───
const server = createServer(app)
const wss = new WebSocketServer({ server, path: '/ws/detections' })

const dashboardClients = new Set()

wss.on('connection', async (ws) => {
  dashboardClients.add(ws)
  console.log(`🔌 Dashboard connected (${dashboardClients.size} total)`)

  // Send last 20 detections as initial burst
  try {
    const result = await pool.query(
      `SELECT scan_id as id, device_id, timestamp, plastic_type, resin_code,
              confidence, contaminated, correct_bin, fill_level_pct,
              location_name, lat, lng, composition, drive_id
       FROM scans ORDER BY timestamp DESC LIMIT 20`
    )
    result.rows.forEach(row => {
      try {
        ws.send(JSON.stringify({
          ...row,
          type: 'detection',
          location: { lat: row.lat, lng: row.lng },
        }))
      } catch {}
    })
  } catch {}

  ws.on('close', () => {
    dashboardClients.delete(ws)
    console.log(`🔌 Dashboard disconnected (${dashboardClients.size} remaining)`)
  })
})

// Broadcast to all dashboards
function broadcast(message) {
  const payload = JSON.stringify(message)
  for (const client of dashboardClients) {
    try {
      if (client.readyState === 1) client.send(payload)
    } catch {}
  }
}

// ─── In-memory scan progress tracker ───
const activeSessions = new Map() // device_id → { progress, startedAt, location_name }

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ESP32 ENDPOINTS (API key required)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * POST /api/scan/start
 * ESP32 calls when it begins scanning. Dashboard shows loading animation.
 * Body: { "device_id": "esp-001", "location_name": "Bandra West" }
 */
app.post('/api/scan/start', requireApiKey, (req, res) => {
  const { device_id, location_name } = req.body
  if (!device_id) return res.status(400).json({ error: 'Missing device_id' })

  activeSessions.set(device_id, {
    progress: 0,
    startedAt: Date.now(),
    location_name: location_name || `Bin ${device_id}`,
  })

  broadcast({
    type: 'scan_start',
    device_id,
    location_name: location_name || `Bin ${device_id}`,
  })

  console.log(`🔍 Scan started: ${device_id} at ${location_name || 'unknown'}`)
  res.json({ status: 'ok' })
})

/**
 * POST /api/scan/progress
 * ESP32 sends progress updates during inference.
 * Body: { "device_id": "esp-001", "progress": 45 }
 */
app.post('/api/scan/progress', requireApiKey, (req, res) => {
  const { device_id, progress } = req.body
  if (!device_id || progress === undefined) {
    return res.status(400).json({ error: 'Missing device_id or progress' })
  }

  const session = activeSessions.get(device_id)
  if (session) {
    session.progress = Math.min(100, Math.max(0, progress))
  }

  broadcast({
    type: 'scan_progress',
    device_id,
    progress: Math.min(100, Math.max(0, progress)),
  })

  res.json({ status: 'ok' })
})

/**
 * POST /api/detect
 * ESP32 sends the final detection result with optional image and composition.
 *
 * Body:
 * {
 *   "device_id": "esp-001",
 *   "plastic_type": "PET",
 *   "confidence": 0.94,
 *   "fill_level_pct": 67,
 *   "correct_bin": true,
 *   "contaminated": false,
 *   "location_name": "Bandra West",
 *   "lat": 19.076, "lng": 72.877,
 *   "image": "<base64 JPEG string>",
 *   "composition": { "plastic": 72.1, "metal": 5.3, "organic": 18.2, "glass": 2.8, "other": 1.6 }
 * }
 */
app.post('/api/detect', requireApiKey, async (req, res) => {
  const body = req.body

  if (!body.device_id || !body.plastic_type) {
    return res.status(400).json({
      error: 'Missing required fields: device_id, plastic_type',
      example: {
        device_id: 'esp-001',
        plastic_type: 'PET',
        confidence: 0.94,
        fill_level_pct: 67,
        composition: { plastic: 72, metal: 5, organic: 18, glass: 3, other: 2 },
      },
    })
  }

  const resinMap = { PET: 1, HDPE: 2, PVC: 3, LDPE: 4, PP: 5, PS: 6, Other: 7 }
  const scanId = `det-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  const plasticType = body.plastic_type.toUpperCase()
  const timestamp = new Date().toISOString()
  const composition = normalizeComposition(body.composition)
  const imageBase64 = normalizeImageBase64(body.image)

  try {
    // Insert into PostgreSQL
    await pool.query(
      `INSERT INTO scans (scan_id, device_id, timestamp, plastic_type, resin_code,
        confidence, contaminated, correct_bin, fill_level_pct, location_name,
        lat, lng, image_base64, composition, drive_id, api_key_used)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
      [
        scanId,
        body.device_id,
        timestamp,
        plasticType,
        body.resin_code || resinMap[plasticType] || 7,
        body.confidence ?? 0.85,
        body.contaminated ?? false,
        body.correct_bin ?? true,
        body.fill_level_pct ?? null,
        body.location_name ?? null,
        body.lat ?? null,
        body.lng ?? null,
        imageBase64,
        JSON.stringify(composition),
        body.drive_id ?? null,
        API_KEY.slice(-8),
      ]
    )

    // Update bin status
    await pool.query(
      `INSERT INTO bins (device_id, location_name, lat, lng, fill_level_pct, last_detection, top_plastic_type, fill_history_24h)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (device_id) DO UPDATE SET
         location_name = COALESCE($2, bins.location_name),
         lat = COALESCE($3, bins.lat),
         lng = COALESCE($4, bins.lng),
         fill_level_pct = COALESCE($5, bins.fill_level_pct),
         last_detection = $6,
         top_plastic_type = $7,
         fill_history_24h = (
           SELECT jsonb_agg(v)
           FROM (
             SELECT v FROM jsonb_array_elements(bins.fill_history_24h) v
             UNION ALL SELECT to_jsonb($5::int)
           ) sub
           LIMIT 12
         )`,
      [
        body.device_id,
        body.location_name ?? `Bin ${body.device_id}`,
        body.lat ?? 19.0760,
        body.lng ?? 72.8777,
        body.fill_level_pct ?? 0,
        timestamp,
        plasticType,
        JSON.stringify([body.fill_level_pct ?? 0]),
      ]
    )

    // Clear active scanning session
    activeSessions.delete(body.device_id)

    // Build detection message (without base64 image for WebSocket — too large)
    const detection = {
      type: 'scan_complete',
      id: scanId,
      device_id: body.device_id,
      timestamp,
      plastic_type: plasticType,
      resin_code: body.resin_code || resinMap[plasticType] || 7,
      confidence: body.confidence ?? 0.85,
      contaminated: body.contaminated ?? false,
      correct_bin: body.correct_bin ?? true,
      fill_level_pct: body.fill_level_pct ?? null,
      location_name: body.location_name ?? null,
      location: { lat: body.lat ?? null, lng: body.lng ?? null },
      composition,
      drive_id: body.drive_id ?? null,
      has_image: !!imageBase64,
    }

    broadcast(detection)

    console.log(`✅ Detection: ${plasticType} (${((body.confidence ?? 0.85) * 100).toFixed(0)}%) from ${body.device_id} → PostgreSQL`)
    res.status(201).json({ status: 'ok', id: scanId })
  } catch (err) {
    console.error('❌ Detection insert failed:', err.message)
    res.status(500).json({ error: 'Database error', details: err.message })
  }
})

/**
 * POST /api/bin/register
 * Register or update a bin's static info.
 */
app.post('/api/bin/register', requireApiKey, async (req, res) => {
  const { device_id, location_name, lat, lng } = req.body
  if (!device_id) return res.status(400).json({ error: 'Missing device_id' })

  try {
    await pool.query(
      `INSERT INTO bins (device_id, location_name, lat, lng)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (device_id) DO UPDATE SET
         location_name = COALESCE($2, bins.location_name),
         lat = COALESCE($3, bins.lat),
         lng = COALESCE($4, bins.lng)`,
      [device_id, location_name || `Bin ${device_id}`, lat ?? 19.0760, lng ?? 72.8777]
    )
    console.log(`📍 Bin registered: ${device_id} at ${location_name}`)
    res.json({ status: 'ok' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DASHBOARD ENDPOINTS (no API key required)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// GET /api/detections — Recent detections (polling fallback)
app.get('/api/detections', async (req, res) => {
  const { since, limit = 20 } = req.query
  try {
    let result
    if (since) {
      result = await pool.query(
        `SELECT scan_id as id, device_id, timestamp, plastic_type, resin_code,
                confidence, contaminated, correct_bin, fill_level_pct,
                location_name, lat, lng, composition, drive_id
         FROM scans WHERE timestamp > $1 ORDER BY timestamp DESC LIMIT 100`,
        [since]
      )
    } else {
      result = await pool.query(
        `SELECT scan_id as id, device_id, timestamp, plastic_type, resin_code,
                confidence, contaminated, correct_bin, fill_level_pct,
                location_name, lat, lng, composition, drive_id
         FROM scans ORDER BY timestamp DESC LIMIT $1`,
        [parseInt(limit)]
      )
    }
    res.json(result.rows.map(r => ({
      ...r,
      location: { lat: r.lat, lng: r.lng },
    })))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/bins — All bin statuses
app.get('/api/bins', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM bins ORDER BY last_detection DESC NULLS LAST`)
    // Parse fill_history_24h from JSONB
    res.json(result.rows.map(b => ({
      ...b,
      id: b.device_id,
      fill_history_24h: b.fill_history_24h || [],
    })))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/analytics — Aggregated analytics
app.get('/api/analytics', async (req, res) => {
  const { range = '7d' } = req.query

  let days = 7
  if (range === '1d' || range === 'Today') days = 1
  else if (range === '7d' || range === 'Last 7 Days') days = 7
  else if (range === '30d' || range === 'Last 30 Days') days = 30

  try {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    // Total scans and correct count
    const statsResult = await pool.query(
      `SELECT COUNT(*) as total, 
              COUNT(*) FILTER (WHERE correct_bin = true) as correct,
              ROUND(COUNT(*)::numeric * 0.15, 1) as kg
       FROM scans WHERE timestamp >= $1`, [cutoff]
    )
    const stats = statsResult.rows[0]
    const total = parseInt(stats.total)
    if (total === 0) return res.json(null)

    const correctPct = Math.round((parseInt(stats.correct) / total) * 1000) / 10

    // Type breakdown
    const typeResult = await pool.query(
      `SELECT plastic_type as type, MIN(resin_code) as resin_code, 
              COUNT(*) as count,
              ROUND(COUNT(*)::numeric / $2 * 100, 1) as pct
       FROM scans WHERE timestamp >= $1
       GROUP BY plastic_type ORDER BY count DESC`,
      [cutoff, total]
    )

    // Placement accuracy
    const placementResult = await pool.query(
      `SELECT plastic_type as type,
              COUNT(*) FILTER (WHERE correct_bin = true) as correct,
              COUNT(*) FILTER (WHERE correct_bin = false) as incorrect
       FROM scans WHERE timestamp >= $1
       GROUP BY plastic_type ORDER BY (COUNT(*)) DESC`,
      [cutoff]
    )

    // Volume over time (4-hour buckets)
    const volumeResult = await pool.query(
      `SELECT date_trunc('hour', timestamp) - 
              (EXTRACT(hour FROM timestamp)::int % 4) * interval '1 hour' as bucket,
              COUNT(*) as count
       FROM scans WHERE timestamp >= $1
       GROUP BY bucket ORDER BY bucket`,
      [cutoff]
    )

    res.json({
      total_scans: total,
      correct_pct: correctPct,
      kg_recorded: parseFloat(stats.kg),
      type_breakdown: typeResult.rows.map(r => ({ ...r, count: parseInt(r.count), pct: parseFloat(r.pct) })),
      placement_accuracy: placementResult.rows.map(r => ({ ...r, correct: parseInt(r.correct), incorrect: parseInt(r.incorrect) })),
      volume_over_time: volumeResult.rows.map(r => ({ timestamp: r.bucket, count: parseInt(r.count) })),
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/heatmap — Heatmap from bins
app.get('/api/heatmap', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT lat, lng, fill_level_pct FROM bins WHERE lat IS NOT NULL AND lng IS NOT NULL`
    )
    res.json({
      points: result.rows.map(b => ({
        lat: b.lat, lng: b.lng,
        intensity: Math.min(1, (b.fill_level_pct || 0) / 100),
      })),
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/drives
app.get('/api/drives', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM drives ORDER BY date DESC`)
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/drives
app.post('/api/drives', async (req, res) => {
  const { title, area, target_kg, date, lat, lng } = req.body
  if (!title || !area || !target_kg || !date) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  const id = `drv-${Date.now()}`
  try {
    await pool.query(
      `INSERT INTO drives (id, title, area, target_kg, date, lat, lng)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [id, title, area, parseFloat(target_kg), date, lat ?? 19.0760, lng ?? 72.8777]
    )
    res.status(201).json({ id, title, area, target_kg: parseFloat(target_kg), collected_kg: 0, participant_count: 0, date, status: 'upcoming', lat: lat ?? 19.0760, lng: lng ?? 72.8777 })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/drives/:id
app.put('/api/drives/:id', async (req, res) => {
  const { id } = req.params
  const fields = req.body
  try {
    const sets = Object.keys(fields).map((k, i) => `${k} = $${i + 2}`).join(', ')
    await pool.query(`UPDATE drives SET ${sets} WHERE id = $1`, [id, ...Object.values(fields)])
    res.json({ status: 'ok' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/scoreboard
app.get('/api/scoreboard', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT location_name as area, '-' as ward,
              COUNT(*) as total_scans,
              COUNT(*) FILTER (WHERE correct_bin = true) as correct,
              ROUND(COUNT(*) FILTER (WHERE correct_bin = true)::numeric / GREATEST(COUNT(*), 1) * 100, 1) as correct_pct,
              ROUND(COUNT(*) FILTER (WHERE correct_bin = true)::numeric / GREATEST(COUNT(*), 1) * 100) as score
       FROM scans
       WHERE location_name IS NOT NULL
       GROUP BY location_name
       ORDER BY score DESC`
    )
    res.json({
      area_rankings: result.rows.map(r => ({
        ...r, total_scans: parseInt(r.total_scans),
        correct_pct: parseFloat(r.correct_pct),
        score: parseInt(r.score), trend: 'up',
      })),
      citizen_leaderboard: [],
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/municipal
app.get('/api/municipal', async (req, res) => {
  try {
    const wardResult = await pool.query(
      `SELECT location_name as name, '-' as zone, COUNT(*) as nodes_deployed,
              'Active' as status, NULL as avg_response_hours,
              COUNT(*) FILTER (WHERE fill_level_pct >= 90) as overflows_7d
       FROM bins GROUP BY location_name`
    )
    const logResult = await pool.query(
      `SELECT b.location_name as bin_location, b.last_detection as flagged_at,
              NULL as serviced_at, 'Pending' as response_time,
              b.location_name as ward, 'Pending' as status
       FROM bins b WHERE b.fill_level_pct >= 85
       ORDER BY b.last_detection DESC`
    )
    res.json({
      wards: wardResult.rows.map(r => ({ ...r, nodes_deployed: parseInt(r.nodes_deployed), overflows_7d: parseInt(r.overflows_7d) })),
      response_log: logResult.rows,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/areas
app.get('/api/areas', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT location_name FROM bins WHERE location_name IS NOT NULL ORDER BY location_name`
    )
    res.json(result.rows.map(r => r.location_name))
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/reports/compare
app.post('/api/reports/compare', async (req, res) => {
  const { area, before, after } = req.body

  try {
    const buildStats = async (start, end) => {
      const areaFilter = area === 'All' ? '' : ` AND location_name LIKE $3`
      const params = [start, end + 'T23:59:59.999Z']
      if (area !== 'All') params.push(`%${area}%`)

      const statsQ = await pool.query(
        `SELECT COUNT(*) as total,
                COUNT(*) FILTER (WHERE correct_bin = true) as correct
         FROM scans WHERE timestamp >= $1 AND timestamp <= $2${areaFilter}`, params
      )
      const total = parseInt(statsQ.rows[0].total)
      const correct = parseInt(statsQ.rows[0].correct)

      const typeQ = await pool.query(
        `SELECT plastic_type as type, COUNT(*) as count,
                ROUND(COUNT(*)::numeric / GREATEST($${params.length + 1}, 1) * 100, 1) as pct
         FROM scans WHERE timestamp >= $1 AND timestamp <= $2${areaFilter}
         GROUP BY plastic_type ORDER BY count DESC`,
        [...params, total]
      )

      const placementQ = await pool.query(
        `SELECT plastic_type as type,
                COUNT(*) FILTER (WHERE correct_bin = true) as correct,
                COUNT(*) FILTER (WHERE correct_bin = false) as incorrect
         FROM scans WHERE timestamp >= $1 AND timestamp <= $2${areaFilter}
         GROUP BY plastic_type`, params
      )

      let mostMisplaced = 'N/A'
      let maxIncorrect = 0
      placementQ.rows.forEach(r => {
        if (parseInt(r.incorrect) > maxIncorrect) {
          maxIncorrect = parseInt(r.incorrect)
          mostMisplaced = r.type
        }
      })

      return {
        total_scans: total,
        correct_pct: total > 0 ? Math.round((correct / total) * 1000) / 10 : 0,
        most_misplaced: mostMisplaced,
        sustainability_score: total > 0 ? Math.round((correct / total) * 100) : 0,
        breakdown: typeQ.rows.map(r => ({ ...r, count: parseInt(r.count), pct: parseFloat(r.pct) })),
        placement: placementQ.rows.map(r => ({ ...r, correct: parseInt(r.correct), incorrect: parseInt(r.incorrect) })),
      }
    }

    const beforeStats = await buildStats(before.start, before.end)
    const afterStats = await buildStats(after.start, after.end)

    res.json({
      area,
      before: { start: before.start, end: before.end, ...beforeStats },
      after: { start: after.start, end: after.end, ...afterStats },
      before_breakdown: beforeStats.breakdown,
      after_breakdown: afterStats.breakdown,
      placement_comparison: afterStats.placement.map(p => {
        const bp = beforeStats.placement.find(b => b.type === p.type) || { correct: 0, incorrect: 0 }
        return { type: p.type, before_correct: bp.correct, before_incorrect: bp.incorrect, after_correct: p.correct, after_incorrect: p.incorrect }
      }),
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCAN HISTORY ENDPOINTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// GET /api/scans/history — Paginated scan log
app.get('/api/scans/history', async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1)
  const limit = Math.min(50, parseInt(req.query.limit) || 20)
  const device = req.query.device || null
  const startDate = req.query.start_date || null
  const endDate = req.query.end_date || null
  const offset = (page - 1) * limit

  try {
    const filters = []
    const filterParams = []

    if (device) {
      filterParams.push(device)
      filters.push(`device_id = $${filterParams.length}`)
    }

    if (startDate) {
      filterParams.push(`${startDate}T00:00:00.000Z`)
      filters.push(`timestamp >= $${filterParams.length}`)
    }

    if (endDate) {
      filterParams.push(`${endDate}T23:59:59.999Z`)
      filters.push(`timestamp <= $${filterParams.length}`)
    }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : ''
    const resultParams = [...filterParams, limit, offset]

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM scans ${whereClause}`,
      filterParams
    )
    const totalCount = parseInt(countResult.rows[0].count)

    const result = await pool.query(
      `SELECT scan_id as id, device_id, timestamp, plastic_type, resin_code,
              confidence, contaminated, correct_bin, fill_level_pct,
              location_name, lat, lng, composition, drive_id,
              CASE WHEN image_base64 IS NOT NULL THEN true ELSE false END as has_image
       FROM scans ${whereClause}
       ORDER BY timestamp DESC
       LIMIT $${filterParams.length + 1} OFFSET $${filterParams.length + 2}`,
      resultParams
    )

    res.json({
      scans: result.rows,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/scans/:id/image — Serve a scan's image
app.get('/api/scans/:id/image', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT image_base64 FROM scans WHERE scan_id = $1`, [req.params.id]
    )
    if (result.rows.length === 0 || !result.rows[0].image_base64) {
      return res.status(404).json({ error: 'Image not found' })
    }

    const normalizedImage = normalizeImageBase64(result.rows[0].image_base64)
    if (!normalizedImage) {
      return res.status(404).json({ error: 'Image not found' })
    }

    const imgBuffer = Buffer.from(normalizedImage, 'base64')
    res.set('Content-Type', 'image/jpeg')
    res.set('Cache-Control', 'public, max-age=86400')
    res.send(imgBuffer)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/scans/active — Currently active scan sessions
app.get('/api/scans/active', (req, res) => {
  const sessions = []
  for (const [device_id, session] of activeSessions) {
    sessions.push({ device_id, ...session })
  }
  res.json(sessions)
})

// ─── Health Check ───
app.get('/api/health', async (req, res) => {
  try {
    const dbCheck = await pool.query('SELECT COUNT(*) as count FROM scans')
    res.json({
      status: 'ok',
      uptime: process.uptime(),
      database: 'postgresql',
      scans_stored: parseInt(dbCheck.rows[0].count),
      dashboards_connected: dashboardClients.size,
      active_scans: activeSessions.size,
    })
  } catch (err) {
    res.json({ status: 'degraded', database: 'error', error: err.message })
  }
})

// ─── Start Server ───
server.listen(PORT, '0.0.0.0', () => {
  console.log('')
  console.log('╔══════════════════════════════════════════════════════════════╗')
  console.log('║        🧪  PlasticPulse Bridge Server v2                    ║')
  console.log('║        📦  PostgreSQL · 🔑 API Key · 📡 WebSocket          ║')
  console.log('╠══════════════════════════════════════════════════════════════╣')
  console.log(`║  HTTP API:     http://localhost:${PORT}                       ║`)
  console.log(`║  WebSocket:    ws://localhost:${PORT}/ws/detections            ║`)
  console.log(`║  Health:       http://localhost:${PORT}/api/health             ║`)
  console.log('╠══════════════════════════════════════════════════════════════╣')
  console.log(`║  API Key:      ${API_KEY}                          ║`)
  console.log(`║  Database:     ${DB_NAME}                              ║`)
  console.log('╠══════════════════════════════════════════════════════════════╣')
  console.log('║                                                              ║')
  console.log('║  ESP32 endpoints (require X-API-Key header):                 ║')
  console.log(`║    POST /api/scan/start     → start scanning animation       ║`)
  console.log(`║    POST /api/scan/progress  → update progress 0-100          ║`)
  console.log(`║    POST /api/detect         → submit result + image          ║`)
  console.log('║                                                              ║')
  console.log('╚══════════════════════════════════════════════════════════════╝')
  console.log('')
  console.log('Waiting for ESP32 detections...')
  console.log('')
})

process.on('SIGINT', async () => {
  console.log('\n💾 Shutting down...')
  await pool.end()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await pool.end()
  process.exit(0)
})
