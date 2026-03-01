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
          <line x1="12" y1="20" x2="12" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 4 L8 8 L12 6 L16 8 Z" fill="currentColor" />
          <path d="M12 20 L10 18 L12 19 L14 18 Z" fill="currentColor" />
        </svg>
      </div>
    )
  }

  return (
    <div className="h-full space-y-4">
      {/* Wind Information Tile */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.06] rounded-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Wind Analysis</h3>
          <Wind className="w-4 h-4 text-white/20" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-white/40 text-xs uppercase tracking-wider">Speed</div>
            <div className="text-2xl font-light text-white">{current.windspeedKmph} <span className="text-sm text-white/40">km/h</span></div>
          </div>
          <div className="space-y-1">
            <div className="text-white/40 text-xs uppercase tracking-wider">Direction</div>
            <div className="flex items-center space-x-3">
              <WindArrow degrees={windDegrees} size={28} />
              <div className="flex flex-col">
                <span className="text-xl font-light text-white">{current.winddir16Point}</span>
                <span className="text-xs text-white/30">{windDegrees}°</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wind speed indicator */}
        <div className="mt-6 p-4 bg-white/[0.03] rounded-lg">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-white/40">Intensity</span>
            <span className="text-white/60">{current.windspeedKmph} km/h</span>
          </div>
          <div className="w-full bg-white/[0.06] rounded-full h-1.5 relative overflow-hidden">
            <div
              className="h-1.5 rounded-full transition-all duration-1000"
              style={{
                width: `${Math.min((Number.parseInt(current.windspeedKmph) / 50) * 100, 100)}%`,
                background:
                  Number.parseInt(current.windspeedKmph) < 10
                    ? "#34d399"
                    : Number.parseInt(current.windspeedKmph) < 20
                      ? "#fbbf24"
                      : "#f87171",
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-white/20 mt-1.5">
            <span>Calm</span>
            <span>Moderate</span>
            <span>Strong</span>
          </div>
        </div>

        {/* Developer Credit */}
        <div className="mt-6 pt-4 border-t border-white/[0.06]">
          <div className="text-center">
            <div className="text-white/30 text-xs mb-0.5">Built by</div>
            <div className="text-white/80 font-medium text-sm">Yash Mehla</div>
            <div className="text-white/20 text-xs mt-0.5">Computer Science Engineering</div>
          </div>
        </div>
      </div>

      {/* Additional Metrics Tile */}
      <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.06] rounded-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Atmospheric Data</h3>
          <Thermometer className="w-4 h-4 text-white/20" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/[0.03] rounded-lg p-4 border border-white/[0.04]">
            <div className="text-white/40 text-xs uppercase tracking-wider mb-1">UV Index</div>
            <div className="text-xl font-light text-white">{current.uvIndex || "N/A"}</div>
          </div>
          <div className="bg-white/[0.03] rounded-lg p-4 border border-white/[0.04]">
            <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Cloud Cover</div>
            <div className="text-xl font-light text-white">{current.cloudcover}%</div>
          </div>
        </div>

        {/* Progress bars */}
        <div className="mt-4 space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-white/40">Humidity</span>
              <span className="text-white/60">{current.humidity}%</span>
            </div>
            <div className="w-full bg-white/[0.06] rounded-full h-1.5">
              <div
                className="bg-blue-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${current.humidity}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-white/40">Visibility</span>
              <span className="text-white/60">{current.visibility} km</span>
            </div>
            <div className="w-full bg-white/[0.06] rounded-full h-1.5">
              <div
                className="bg-emerald-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((Number.parseInt(current.visibility) / 10) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Data source indicator */}
        <div className="mt-4 pt-3 border-t border-white/[0.06]">
          <div className="text-[10px] text-white/30 text-center">
            Live data from Open-Meteo & WeatherAPI
          </div>
        </div>
      </div>
    </div>
  )
}
