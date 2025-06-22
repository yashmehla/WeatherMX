"use client"

import { Wind, Thermometer } from "lucide-react"

interface WeatherTileProps {
  weatherData: any
  city: string
}

export function WeatherTile({ weatherData, city }: WeatherTileProps) {
  const current = weatherData.current_condition[0]
  const windDegrees = Number.parseInt(current.winddirDegree) || 0

  // Custom wind arrow component
  const WindArrow = ({ degrees, size = 24 }: { degrees: number; size?: number }) => {
    return (
      <div className="relative inline-block" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          className="text-white"
          style={{
            transform: `rotate(${degrees}deg)`,
            transformOrigin: "center center",
          }}
        >
          {/* Arrow shaft */}
          <line x1="12" y1="20" x2="12" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          {/* Arrow head */}
          <path d="M12 4 L8 8 L12 6 L16 8 Z" fill="currentColor" />
          {/* Arrow tail */}
          <path d="M12 20 L10 18 L12 19 L14 18 Z" fill="currentColor" />
        </svg>
      </div>
    )
  }

  return (
    <div className="h-full space-y-6">
      {/* Wind Information Tile */}
      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Wind Analysis</h3>
          <Wind className="w-6 h-6 text-gray-400" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-gray-400 text-sm">Speed</div>
            <div className="text-2xl font-bold text-white">{current.windspeedKmph} km/h</div>
          </div>
          <div className="space-y-2">
            <div className="text-gray-400 text-sm">Direction</div>
            <div className="flex items-center space-x-3">
              <WindArrow degrees={windDegrees} size={32} />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white">{current.winddir16Point}</span>
                <span className="text-sm text-gray-400">({windDegrees}°)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wind speed indicator */}
        <div className="mt-6 p-4 bg-gray-800/30 rounded-lg">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Wind Intensity</span>
            <span className="text-white">{current.windspeedKmph} km/h</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 relative overflow-hidden">
            <div
              className="h-3 rounded-full transition-all duration-1000 relative"
              style={{
                width: `${Math.min((Number.parseInt(current.windspeedKmph) / 50) * 100, 100)}%`,
                background: `linear-gradient(90deg, 
                  ${Number.parseInt(current.windspeedKmph) < 10 ? "#10b981" : ""} 0%,
                  ${Number.parseInt(current.windspeedKmph) < 20 ? "#f59e0b" : ""} 50%,
                  ${Number.parseInt(current.windspeedKmph) >= 20 ? "#ef4444" : ""} 100%
                )`,
              }}
            >
              {/* Animated particles effect */}
              <div className="absolute inset-0 opacity-60">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                    style={{
                      left: `${20 + i * 25}%`,
                      top: "50%",
                      transform: "translateY(-50%)",
                      animationDelay: `${i * 0.3}s`,
                      animationDuration: "1.5s",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Calm</span>
            <span>Moderate</span>
            <span>Strong</span>
          </div>
        </div>

        {/* Developer Credit */}
        <div className="mt-6 pt-4 border-t border-gray-700/50">
          <div className="text-center">
            <div className="text-gray-400 text-sm mb-1">Built By</div>
            <div className="text-white font-semibold text-lg">Yash Mehla</div>
            <div className="text-gray-500 text-xs mt-1">Computer Science Engineering</div>
          </div>
        </div>
      </div>

      {/* Additional Metrics Tile */}
      <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Atmospheric Data</h3>
          <Thermometer className="w-6 h-6 text-gray-400" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800/30 rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-1">UV Index</div>
            <div className="text-xl font-bold text-white">{current.uvIndex || "N/A"}</div>
          </div>
          <div className="bg-gray-800/30 rounded-xl p-4">
            <div className="text-gray-400 text-sm mb-1">Cloud Cover</div>
            <div className="text-xl font-bold text-white">{current.cloudcover}%</div>
          </div>
        </div>

        {/* Progress bars */}
        <div className="mt-4 space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Humidity</span>
              <span className="text-white">{current.humidity}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-300 h-2 rounded-full transition-all duration-500"
                style={{ width: `${current.humidity}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Visibility</span>
              <span className="text-white">{current.visibility} km</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-green-300 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((Number.parseInt(current.visibility) / 10) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Data source indicator */}
        <div className="mt-4 pt-3 border-t border-gray-700/50">
          <div className="text-xs text-green-400 text-center font-medium">
            ✓ Live Data • Updated: {new Date().toLocaleTimeString()}
          </div>
          <div className="text-xs text-gray-500 text-center mt-1">Powered by Open-Meteo & WeatherAPI</div>
        </div>
      </div>
    </div>
  )
}
