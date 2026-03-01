"use client"

import type React from "react"
import { useState } from "react"
import { Search, MapPin, Navigation } from "lucide-react"

interface CityInputProps {
  onSubmit: (city: string) => void
  loading: boolean
}

export function CityInput({ onSubmit, loading }: CityInputProps) {
  const [city, setCity] = useState("")
  const [geoLoading, setGeoLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (city.trim()) {
      onSubmit(city.trim())
    }
  }

  const handleGeolocation = () => {
    if (!navigator.geolocation) return
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const geoResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { headers: { "User-Agent": "WeatherMX/1.0" } }
          )
          if (geoResponse.ok) {
            const data = await geoResponse.json()
            const cityName = data.address?.city || data.address?.town || data.address?.village || data.name
            if (cityName) {
              setCity(cityName)
              onSubmit(cityName)
            }
          }
        } catch (error) {
          console.warn("Geolocation lookup failed:", error)
        } finally {
          setGeoLoading(false)
        }
      },
      () => setGeoLoading(false),
      { timeout: 10000 }
    )
  }

  return (
    <div className="relative fade-in">
      <div className="relative bg-white/[0.03] border border-white/[0.08] p-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 border border-white/[0.15] mb-6">
            <div className="w-2 h-2 bg-white" />
          </div>
          <h1 className="text-3xl font-light text-white tracking-[0.2em] uppercase mb-2">
            Weather<span className="font-normal">MX</span>
          </h1>
          <p className="text-white/30 text-[10px] font-mono tracking-[0.3em] uppercase">
            Precision Weather Intelligence
          </p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Enter city name..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full h-12 pl-10 pr-4 bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 text-sm font-mono tracking-wide focus:outline-none focus:border-white/[0.25] transition-colors duration-300"
              disabled={loading}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/20" />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 h-12 bg-white text-black font-mono text-xs tracking-[0.15em] uppercase hover:bg-white/90 transition-colors duration-200 disabled:opacity-30 flex items-center justify-center gap-2"
              disabled={loading || !city.trim()}
            >
              {loading ? (
                <>
                  <div className="w-3 h-3 border border-black/30 border-t-black animate-spin" />
                  <span>Searching</span>
                </>
              ) : (
                <>
                  <MapPin className="w-3 h-3" />
                  <span>Get Weather</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleGeolocation}
              disabled={loading || geoLoading}
              className="h-12 w-12 border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.05] transition-colors duration-200 disabled:opacity-30"
              title="Use current location"
            >
              <Navigation className={`w-4 h-4 text-white/50 ${geoLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </form>

        {/* Quick cities */}
        <div className="mt-8 pt-6 border-t border-white/[0.06]">
          <p className="text-white/20 text-[10px] font-mono tracking-[0.2em] uppercase mb-3">Quick Access</p>
          <div className="flex flex-wrap gap-2">
            {["Tokyo", "London", "New York", "Paris", "Mumbai"].map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCity(c)
                  onSubmit(c)
                }}
                disabled={loading}
                className="px-3 py-1.5 text-[11px] font-mono text-white/40 border border-white/[0.06] hover:border-white/[0.15] hover:text-white/60 transition-all duration-200 disabled:opacity-30"
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-white/10 text-[9px] font-mono tracking-[0.2em] uppercase">Real-time data • Open-Meteo API</p>
        </div>
      </div>
    </div>
  )
}
