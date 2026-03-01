"use client"

import { Wind, Thermometer, Sun, CloudRain, Droplets } from "lucide-react"

interface WeatherTileProps {
  weatherData: any
  city: string
}

export function WeatherTile({ weatherData, city }: WeatherTileProps) {
  const current = weatherData.current_condition[0]
  const windDegrees = Number.parseInt(current.winddirDegree) || 0

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
          <line x1="12" y1="20" x2="12" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
          <path d="M12 4 L8 8 L12 6 L16 8 Z" fill="currentColor" />
          <path d="M12 20 L10 18 L12 19 L14 18 Z" fill="currentColor" />
        </svg>
      </div>
    )
  }

  const windSpeed = Number.parseInt(current.windspeedKmph) || 0
  const windIntensity = windSpeed < 10 ? "Calm" : windSpeed < 20 ? "Light" : windSpeed < 40 ? "Moderate" : "Strong"
  const windPercent = Math.min((windSpeed / 60) * 100, 100)

  return (
    <div className="h-full space-y-3">
      {/* Wind Information Tile */}
      <div className="bg-white/[0.03] border border-white/[0.06] p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[10px] font-mono text-white/30 tracking-[0.2em] uppercase">Wind Analysis</h3>
          <Wind className="w-3 h-3 text-white/15" />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <div className="text-white/25 text-[10px] font-mono tracking-[0.15em] uppercase">Speed</div>
            <div className="text-3xl font-extralight text-white font-mono">{current.windspeedKmph} <span className="text-xs text-white/25">km/h</span></div>
            {current.windGustsKmph && parseInt(current.windGustsKmph) > 0 && (
              <div className="text-white/15 text-[10px] font-mono">Gusts: {current.windGustsKmph} km/h</div>
            )}
          </div>
          <div className="space-y-1">
            <div className="text-white/25 text-[10px] font-mono tracking-[0.15em] uppercase">Direction</div>
            <div className="flex items-center gap-3">
              <WindArrow degrees={windDegrees} size={28} />
              <div className="flex flex-col">
                <span className="text-2xl font-extralight text-white font-mono">{current.winddir16Point}</span>
                <span className="text-[10px] text-white/20 font-mono">{windDegrees}°</span>
              </div>
            </div>
          </div>
        </div>

        {/* Wind intensity bar */}
        <div className="mt-6 p-4 bg-white/[0.02] border border-white/[0.04]">
          <div className="flex justify-between text-[10px] font-mono mb-2">
            <span className="text-white/25 tracking-wider uppercase">{windIntensity}</span>
            <span className="text-white/40">{current.windspeedKmph} km/h</span>
          </div>
          <div className="w-full bg-white/[0.06] h-1 relative overflow-hidden">
            <div
              className="h-1 bg-white/40 transition-all duration-1000"
              style={{ width: `${windPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-white/15 mt-1.5 font-mono">
            <span>0</span>
            <span>20</span>
            <span>40</span>
            <span>60+</span>
          </div>
        </div>
      </div>

      {/* Atmospheric Data Tile */}
      <div className="bg-white/[0.03] border border-white/[0.06] p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[10px] font-mono text-white/30 tracking-[0.2em] uppercase">Atmospheric Data</h3>
          <Thermometer className="w-3 h-3 text-white/15" />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/[0.02] border border-white/[0.04] p-4">
            <div className="text-white/25 text-[10px] font-mono tracking-wider uppercase mb-1">UV Index</div>
            <div className="text-xl font-extralight text-white font-mono">{current.uvIndex || "—"}</div>
            <div className="text-white/15 text-[9px] font-mono mt-1">
              {current.uvIndex !== "N/A" && current.uvIndex
                ? parseInt(current.uvIndex) <= 2 ? "Low" : parseInt(current.uvIndex) <= 5 ? "Moderate" : parseInt(current.uvIndex) <= 7 ? "High" : "Very High"
                : ""}
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.04] p-4">
            <div className="text-white/25 text-[10px] font-mono tracking-wider uppercase mb-1">Cloud Cover</div>
            <div className="text-xl font-extralight text-white font-mono">{current.cloudcover}%</div>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.04] p-4">
            <div className="text-white/25 text-[10px] font-mono tracking-wider uppercase mb-1">Precip</div>
            <div className="text-xl font-extralight text-white font-mono">{current.precipMM || "0"}<span className="text-[10px] text-white/20">mm</span></div>
          </div>
        </div>

        {/* Progress bars */}
        <div className="mt-4 space-y-4">
          <div>
            <div className="flex justify-between text-[10px] font-mono mb-1.5">
              <span className="text-white/25 tracking-wider uppercase">Humidity</span>
              <span className="text-white/40">{current.humidity}%</span>
            </div>
            <div className="w-full bg-white/[0.06] h-1">
              <div
                className="bg-white/30 h-1 transition-all duration-500"
                style={{ width: `${current.humidity}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-[10px] font-mono mb-1.5">
              <span className="text-white/25 tracking-wider uppercase">Visibility</span>
              <span className="text-white/40">{current.visibility} km</span>
            </div>
            <div className="w-full bg-white/[0.06] h-1">
              <div
                className="bg-white/30 h-1 transition-all duration-500"
                style={{ width: `${Math.min((Number.parseInt(current.visibility) / 15) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Data source */}
        <div className="mt-4 pt-3 border-t border-white/[0.04]">
          <div className="text-[9px] text-white/15 text-center font-mono tracking-wider uppercase">
            Live data • Open-Meteo & WeatherAPI
          </div>
        </div>
      </div>
    </div>
  )
}
