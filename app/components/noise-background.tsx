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
      {/* Pure black base */}
      <div className="fixed inset-0 z-0 animated-bg" />

      {/* Animated grid */}
      <div className="fixed inset-0 z-0 grid-bg" />

      {/* Floating particles */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="particle particle-1" />
        <div className="particle particle-2" />
        <div className="particle particle-3" />
        <div className="particle particle-4" />
        <div className="particle particle-5" />
        <div className="particle particle-6" />
        <div className="particle particle-7" />
        <div className="particle particle-8" />
      </div>

      {/* Scan line overlay */}
      <div className="scan-line z-0" />
    </>
  )
}
