import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { handlingActionFor } from '../lib/categories.js'

const WebSocketContext = createContext(null)

// Bridge server URLs — Vite proxies /api/* to port 3001 in dev
const API_BASE_URL = '' // Leave empty — Vite proxy handles /api/* routing
const WS_URL = 'ws://localhost:3001/ws/detections'
const CAMERA_URL_KEY = 'wastewise_camera_url'

export function WebSocketProvider({ children }) {
  const [status, setStatus] = useState('offline') // connecting, live, polling, offline
  const [detections, setDetections] = useState([])
  const [driveCounters, setDriveCounters] = useState({})
  const [scanProgress, setScanProgress] = useState({}) // { device_id: { progress, location_name, status } }
  const [cameraStreamUrl, setCameraStreamUrlState] = useState(
    () => (typeof localStorage !== 'undefined' ? localStorage.getItem(CAMERA_URL_KEY) || '' : '')
  )

  // Persist the ESP32 camera stream URL so it survives reloads.
  const setCameraStreamUrl = useCallback((url) => {
    setCameraStreamUrlState(url)
    try {
      if (url) localStorage.setItem(CAMERA_URL_KEY, url)
      else localStorage.removeItem(CAMERA_URL_KEY)
    } catch {
      // localStorage unavailable — keep in-memory state only
    }
  }, [])
  const wsRef = useRef(null)
  const pollRef = useRef(null)
  const retryTimeoutRef = useRef(null)

  // ─── Process an incoming message (shared by WS and polling) ───
  const processMessage = useCallback((data) => {
    // Handle different message types from the bridge server
    if (data.type === 'scan_start') {
      setScanProgress(prev => ({
        ...prev,
        [data.device_id]: {
          progress: 0,
          location_name: data.location_name || data.device_id,
          status: 'scanning',
          startedAt: Date.now(),
        },
      }))
      return
    }

    if (data.type === 'scan_progress') {
      setScanProgress(prev => ({
        ...prev,
        [data.device_id]: {
          ...prev[data.device_id],
          progress: data.progress,
          status: 'scanning',
        },
      }))
      return
    }

    if (data.type === 'scan_complete') {
      // Show completion state briefly, then clear
      setScanProgress(prev => ({
        ...prev,
        [data.device_id]: {
          ...prev[data.device_id],
          progress: 100,
          status: 'complete',
          result: data,
        },
      }))

      // Clear after 3 seconds (allows UI to show completion animation)
      setTimeout(() => {
        setScanProgress(prev => {
          const next = { ...prev }
          delete next[data.device_id]
          return next
        })
      }, 3000)
    }

    // Process as a detection (both 'scan_complete' and 'detection' types, or legacy format)
    if (data.type === 'scan_complete' || data.type === 'detection' || data.id) {
      // Map the backend's legacy `plastic_type` field to the new
      // 9-category `material_category` model used throughout the UI.
      const materialCategory = data.material_category || data.plastic_type
      const detection = {
        id: data.id || data.scan_id,
        device_id: data.device_id,
        timestamp: data.timestamp,
        material_category: materialCategory,
        confidence: data.confidence,
        contaminated: data.contaminated,
        handling_action: data.handling_action || handlingActionFor(materialCategory),
        fill_level_pct: data.fill_level_pct,
        location_name: data.location_name,
        location: data.location || { lat: data.lat, lng: data.lng },
        composition: data.composition,
        drive_id: data.drive_id,
        has_image: data.has_image,
      }

      setDetections(prev => {
        const withoutDuplicate = prev.filter(item => item.id !== detection.id)
        return [detection, ...withoutDuplicate].slice(0, 50)
      })

      if (detection.drive_id) {
        setDriveCounters(prev => ({
          ...prev,
          [detection.drive_id]: (prev[detection.drive_id] || 0) + 1,
        }))
      }
    }
  }, [])

  // ─── Polling fallback: fetch /api/detections every 5s ───
  const startPolling = useCallback(() => {
    if (pollRef.current) return

    setStatus('polling')
    let lastTimestamp = null

    pollRef.current = setInterval(async () => {
      try {
        const url = `${API_BASE_URL}/api/detections${lastTimestamp ? `?since=${encodeURIComponent(lastTimestamp)}` : '?limit=20'}`
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          data.forEach(d => processMessage({ ...d, type: 'detection' }))
          lastTimestamp = data[0].timestamp || new Date().toISOString()
        }

        setStatus(prev => prev === 'offline' ? 'polling' : prev)
      } catch {
        // Silently stay in current status
      }
    }, 5000)
  }, [processMessage])

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  // ─── WebSocket connection ───
  const connectWebSocket = useCallback(() => {
    if (!WS_URL) {
      if (API_BASE_URL) startPolling()
      return
    }

    setStatus('connecting')

    try {
      const ws = new WebSocket(WS_URL)
      wsRef.current = ws

      ws.onopen = () => {
        setStatus('live')
        stopPolling()
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          processMessage(data)
        } catch {
          // Ignore malformed messages
        }
      }

      ws.onclose = () => {
        wsRef.current = null
        startPolling()
        retryTimeoutRef.current = setTimeout(connectWebSocket, 10000)
      }

      ws.onerror = () => {
        // onclose will fire after this
      }
    } catch {
      startPolling()
    }
  }, [processMessage, startPolling, stopPolling])

  // ─── Lifecycle ───
  useEffect(() => {
    const fetchActiveScans = async () => {
      try {
        const res = await fetch('/api/scans/active')
        if (!res.ok) return

        const sessions = await res.json()
        if (!Array.isArray(sessions) || sessions.length === 0) return

        setScanProgress(prev => {
          const next = { ...prev }
          sessions.forEach(session => {
            next[session.device_id] = {
              progress: session.progress ?? 0,
              location_name: session.location_name || session.device_id,
              status: 'scanning',
              startedAt: session.startedAt || Date.now(),
            }
          })
          return next
        })
      } catch {
        // Server may not be available yet.
      }
    }

    fetchActiveScans()
    connectWebSocket()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      stopPolling()
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current)
      }
    }
  }, [connectWebSocket, stopPolling])

  const value = {
    status,
    detections,
    driveCounters,
    scanProgress,
    cameraStreamUrl,
    setCameraStreamUrl,
    setStatus,
    setDetections,
    setDriveCounters,
    setScanProgress,
  }

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  const context = useContext(WebSocketContext)
  if (!context) throw new Error('useWebSocket must be used within WebSocketProvider')
  return context
}
