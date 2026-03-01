"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin, CloudSun } from "lucide-react"

interface CityInputProps {
  onSubmit: (city: string) => void
  loading: boolean
}

export function CityInput({ onSubmit, loading }: CityInputProps) {
  const [city, setCity] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (city.trim()) {
      onSubmit(city.trim())
    }
  }

  return (
    <div className="relative">
      <div className="relative bg-white/[0.04] backdrop-blur-2xl border border-white/[0.08] rounded-lg p-10 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-blue-500/10 border border-blue-500/20 mb-6">
            <CloudSun className="w-7 h-7 text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
            Weather<span className="text-blue-400">MX</span>
          </h1>
          <p className="text-white/40 text-sm font-medium uppercase tracking-widest">Weather Analytics</p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search for a city..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="h-12 pl-11 pr-4 bg-white/[0.05] border-white/[0.08] text-white placeholder:text-white/30 text-sm rounded-lg focus:bg-white/[0.08] focus:border-blue-500/40 transition-all duration-300"
              disabled={loading}
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/30" />
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-blue-500 text-white hover:bg-blue-600 font-medium text-sm rounded-lg transition-all duration-300 disabled:opacity-40"
            disabled={loading || !city.trim()}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Searching...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Get Weather</span>
              </div>
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-white/20 text-xs tracking-wide">Real-time weather data</p>
        </div>
      </div>
    </div>
  )
}
