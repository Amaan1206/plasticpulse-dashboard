import { useState, useEffect } from 'react'

export function useBinStatus() {
  const [bins, setBins] = useState([])
  const [lastUpdate, setLastUpdate] = useState(Date.now())

  useEffect(() => {
    const fetchBins = async () => {
      try {
        const res = await fetch('/api/bins')
        if (!res.ok) return
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          setBins(data)
          setLastUpdate(Date.now())
        }
      } catch {
        // Server not available — bins stay empty, UI shows empty state
      }
    }

    fetchBins()
    // Poll every 15 seconds for updated bin statuses
    const interval = setInterval(fetchBins, 15000)
    return () => clearInterval(interval)
  }, [])

  return { bins, setBins, lastUpdate }
}
