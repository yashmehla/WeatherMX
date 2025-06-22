"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Zap } from "lucide-react"

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
      {/* Main container */}
      <div className="relative bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 mb-6 shadow-lg">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
            Weather<span className="text-gray-400">MX</span>
          </h1>
          <p className="text-gray-400 text-lg">Advanced weather analytics platform</p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
            <div className="relative">
              <Input
                type="text"
                placeholder="Enter city name..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="h-14 pl-14 pr-4 bg-gray-800/50 border-gray-600/50 text-white placeholder:text-gray-400 text-lg rounded-xl focus:bg-gray-800/70 focus:border-gray-500 transition-all duration-200"
                disabled={loading}
              />
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-14 bg-white text-black hover:bg-gray-100 font-semibold text-lg rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
            disabled={loading || !city.trim()}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                <span>Analyzing...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Get Weather Data</span>
              </div>
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">Project WeatherMX</p>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute -top-4 -left-4 w-8 h-8 border-l-2 border-t-2 border-gray-600 rounded-tl-lg"></div>
      <div className="absolute -top-4 -right-4 w-8 h-8 border-r-2 border-t-2 border-gray-600 rounded-tr-lg"></div>
      <div className="absolute -bottom-4 -left-4 w-8 h-8 border-l-2 border-b-2 border-gray-600 rounded-bl-lg"></div>
      <div className="absolute -bottom-4 -right-4 w-8 h-8 border-r-2 border-b-2 border-gray-600 rounded-br-lg"></div>
    </div>
  )
}
