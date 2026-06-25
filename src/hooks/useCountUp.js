import { useState, useEffect, useRef } from 'react'

export function useCountUp(end, duration = 1500, start = 0) {
  const [value, setValue] = useState(start)
  const startTimeRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(() => {
    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(start + (end - start) * easeOut))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      startTimeRef.current = null
    }
  }, [end, duration, start])

  return value
}
