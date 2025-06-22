"use client"

import { useEffect, useState } from "react"

export function NoiseBackground() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <>
      {/* Primary noise overlay - More visible */}
      <div
        className="fixed inset-0 opacity-[0.15] pointer-events-none z-0 mix-blend-screen"
        style={{
          backgroundImage: "url(/noise.gif)",
          backgroundRepeat: "repeat",
          backgroundSize: "300px 300px",
        }}
      />

      {/* Secondary noise layer for more texture */}
      <div
        className="fixed inset-0 opacity-[0.08] pointer-events-none z-0 mix-blend-overlay"
        style={{
          backgroundImage: "url(/noise.gif)",
          backgroundRepeat: "repeat",
          backgroundSize: "150px 150px",
          transform: "rotate(45deg) scale(1.2)",
        }}
      />

      {/* Gradient overlay - Reduced opacity to show noise better */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800 opacity-85 pointer-events-none z-0" />
    </>
  )
}
