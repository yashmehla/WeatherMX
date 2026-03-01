"use client"

import {
  ArrowLeft,
  Wind,
  Droplets,
  Eye,
  Gauge,
  RefreshCw,
  Sunrise,
  Sunset,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudLightning,
  CloudDrizzle,
  CloudFog,
  CloudSun,
  CloudMoon,
  Snowflake,
  Thermometer,
  CloudSnow,
  Waves,
  Timer,
} from "lucide-react"
import { WeatherTile } from "./weather-tile"
import { WeatherMap } from "./weather-map"
import { useState, useEffect } from "react"

interface WeatherDisplayProps {
  weatherData: any
  city: string
  onBack: () => void
  onRefresh: () => void
  loading: boolean
}

export function WeatherDisplay({ weatherData, city, onBack, onRefresh, loading }: WeatherDisplayProps) {
  const [lastRefresh, setLastRefresh] = useState<number>(0)
  const [refreshCooldown, setRefreshCooldown] = useState(0)
  const [autoRefresh, setAutoRefresh] = useState(false)

  const current = weatherData.current_condition[0]
  const today = weatherData.weather[0]

  const handleRefresh = () => {
    const now = Date.now()
    const timeSinceLastRefresh = now - lastRefresh
    const cooldownTime = 5000

    if (timeSinceLastRefresh < cooldownTime) {
      const remaining = Math.ceil((cooldownTime - timeSinceLastRefresh) / 1000)
      setRefreshCooldown(remaining)
      return
    }

    setLastRefresh(now)
    onRefresh()
  }

  // Cooldown timer
  useEffect(() => {
    if (refreshCooldown > 0) {
      const timer = setTimeout(() => {
        setRefreshCooldown(refreshCooldown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [refreshCooldown])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => {
      onRefresh()
    }, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [autoRefresh, onRefresh])

  // Weather code groupings
  const CLEAR_CODES = [0, 113, 800, 1000]
  const PARTLY_CLOUDY_CODES = [1, 116, 801, 1003]
  const CLOUDY_CODES = [2, 3, 119, 122, 802, 803, 804, 1006, 1009]
  const FOG_CODES = [45, 48, 143, 248, 260, 701, 741, 1030, 1135, 1147]
  const DRIZZLE_CODES = [51, 53, 55, 56, 57, 300, 301, 302, 310, 311, 312, 321, 1150, 1153, 1168, 1171]
  const RAIN_CODES = [
    61, 63, 65, 66, 67, 80, 81, 82,
    500, 501, 502, 503, 504, 511, 520, 521, 522, 531,
    1180, 1183, 1186, 1189, 1192, 1195, 1198, 1201, 1240, 1243, 1246,
  ]
  const SNOW_CODES = [
    71, 73, 75, 77, 85, 86,
    600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622,
    1210, 1213, 1216, 1219, 1222, 1225, 1237, 1249, 1252, 1255, 1258, 1261, 1264,
  ]
  const THUNDERSTORM_CODES = [
    95, 96, 99,
    200, 201, 202, 210, 211, 212, 221, 230, 231, 232,
    1087, 1273, 1276, 1279, 1282,
  ]

  const getWeatherIcon = (code: string, isDay = true, size = "w-16 h-16") => {
    const codeNum = parseInt(code)

    if (CLEAR_CODES.includes(codeNum)) {
      return isDay
        ? <Sun className={`${size} text-white`} strokeWidth={1} />
        : <Moon className={`${size} text-white/70`} strokeWidth={1} />
    }
    if (PARTLY_CLOUDY_CODES.includes(codeNum)) {
      return isDay
        ? <CloudSun className={`${size} text-white/80`} strokeWidth={1} />
        : <CloudMoon className={`${size} text-white/60`} strokeWidth={1} />
    }
    if (CLOUDY_CODES.includes(codeNum)) {
      return <Cloud className={`${size} text-white/60`} strokeWidth={1} />
    }
    if (FOG_CODES.includes(codeNum)) {
      return <CloudFog className={`${size} text-white/50`} strokeWidth={1} />
    }
    if (DRIZZLE_CODES.includes(codeNum)) {
      return <CloudDrizzle className={`${size} text-white/60`} strokeWidth={1} />
    }
    if (RAIN_CODES.includes(codeNum)) {
      return <CloudRain className={`${size} text-white/70`} strokeWidth={1} />
    }
    if (SNOW_CODES.includes(codeNum)) {
      return <Snowflake className={`${size} text-white/80`} strokeWidth={1} />
    }
    if (THUNDERSTORM_CODES.includes(codeNum)) {
      return <CloudLightning className={`${size} text-white`} strokeWidth={1} />
    }
    return isDay
      ? <CloudSun className={`${size} text-white/60`} strokeWidth={1} />
      : <CloudMoon className={`${size} text-white/50`} strokeWidth={1} />
  }

  const isCurrentlyDay = () => {
    if (weatherData.isDay !== undefined) return weatherData.isDay
    if (today.sunrise && today.sunset) {
      const now = new Date()
      const sunrise = new Date(today.sunrise)
      const sunset = new Date(today.sunset)
      return now >= sunrise && now <= sunset
    }
    const hour = new Date().getHours()
    return hour >= 6 && hour < 18
  }

  const formatTime = (timeString: string) => {
    if (!timeString || timeString === "N/A") return "—"
    try {
      const date = new Date(timeString)
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } catch {
      return "—"
    }
  }

  const formatHourlyTime = (timeString: string) => {
    try {
      const date = new Date(timeString)
      return date.toLocaleTimeString([], { hour: "2-digit" })
    } catch {
      return "—"
    }
  }

  const isDayTime = isCurrentlyDay()

  return (
    <div className="min-h-screen p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 max-w-7xl mx-auto fade-in">
        <button
          onClick={onBack}
          className="text-white/40 hover:text-white h-10 px-4 flex items-center gap-2 border border-transparent hover:border-white/[0.08] transition-all duration-200 text-xs font-mono tracking-wider uppercase"
        >
          <ArrowLeft className="w-3 h-3" />
          Back
        </button>

        <div className="text-center">
          <h1 className="text-lg font-light text-white tracking-[0.15em] uppercase">{city}</h1>
          <p className="text-white/20 text-[10px] font-mono mt-0.5 tracking-wider">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            {weatherData.timezone && <span className="ml-2 text-white/15">• {weatherData.timezone}</span>}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`h-10 px-3 flex items-center gap-1.5 border transition-all duration-200 text-[10px] font-mono tracking-wider uppercase ${
              autoRefresh
                ? "border-white/20 text-white/60"
                : "border-transparent text-white/25 hover:text-white/40 hover:border-white/[0.08]"
            }`}
            title="Auto-refresh every 5 minutes"
          >
            <Timer className="w-3 h-3" />
            <span className="hidden sm:inline">{autoRefresh ? "Auto" : "Auto"}</span>
            {autoRefresh && <div className="w-1.5 h-1.5 bg-white pulse-dot" />}
          </button>

          <button
            onClick={handleRefresh}
            disabled={loading || refreshCooldown > 0}
            className="text-white/30 hover:text-white h-10 px-4 flex items-center gap-2 border border-transparent hover:border-white/[0.08] transition-all duration-200 disabled:opacity-20 text-xs font-mono tracking-wider uppercase"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            {loading ? "..." : refreshCooldown > 0 ? `${refreshCooldown}s` : "Refresh"}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 max-w-7xl mx-auto">

        {/* Current Weather - Hero Card */}
        <div className="lg:col-span-5 fade-in fade-in-delay-1">
          <div className="bg-white/[0.03] border border-white/[0.06] p-8 h-full">
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                {getWeatherIcon(current.weatherCode, isDayTime, "w-20 h-20")}
              </div>
              <div className="text-8xl font-extralight text-white mb-1 tracking-tighter font-mono">{current.temp_C}°</div>
              <div className="text-white/40 text-xs font-mono tracking-[0.15em] uppercase mb-0.5">{current.weatherDesc[0].value}</div>
              <div className="text-white/20 text-[10px] font-mono">Feels like {current.FeelsLikeC}°C</div>

              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-white/[0.03] border border-white/[0.06]">
                {isDayTime ? <Sun className="w-3 h-3 text-white/40" /> : <Moon className="w-3 h-3 text-white/40" />}
                <span className="text-white/30 text-[10px] font-mono tracking-wider uppercase">{isDayTime ? "Day" : "Night"}</span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 mt-8">
              {[
                { icon: Wind, label: "Wind", value: current.windspeedKmph, unit: "km/h" },
                { icon: Droplets, label: "Humidity", value: current.humidity, unit: "%" },
                { icon: Eye, label: "Visibility", value: current.visibility, unit: "km" },
                { icon: Gauge, label: "Pressure", value: current.pressure, unit: "mb" },
              ].map(({ icon: Icon, label, value, unit }) => (
                <div key={label} className="bg-white/[0.02] border border-white/[0.04] p-4 text-center hover:bg-white/[0.04] transition-colors duration-300">
                  <Icon className="w-4 h-4 text-white/20 mx-auto mb-2" />
                  <div className="text-white font-mono text-lg font-light">{value}</div>
                  <div className="text-white/20 text-[10px] font-mono tracking-wider uppercase">{unit}</div>
                </div>
              ))}
            </div>

            {/* Sunrise/Sunset */}
            {(today.sunrise || today.sunset) && today.sunrise !== "N/A" && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="bg-white/[0.02] border border-white/[0.04] p-4 text-center">
                  <Sunrise className="w-4 h-4 text-white/20 mx-auto mb-2" />
                  <div className="text-white font-mono text-sm">{formatTime(today.sunrise)}</div>
                  <div className="text-white/20 text-[10px] font-mono tracking-wider uppercase">Sunrise</div>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.04] p-4 text-center">
                  <Sunset className="w-4 h-4 text-white/20 mx-auto mb-2" />
                  <div className="text-white font-mono text-sm">{formatTime(today.sunset)}</div>
                  <div className="text-white/20 text-[10px] font-mono tracking-wider uppercase">Sunset</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Weather Tiles */}
        <div className="lg:col-span-7 fade-in fade-in-delay-2">
          <WeatherTile weatherData={weatherData} city={city} />
        </div>

        {/* Hourly Forecast */}
        {weatherData.hourly && weatherData.hourly.length > 0 && (
          <div className="lg:col-span-12 fade-in fade-in-delay-3">
            <div className="bg-white/[0.03] border border-white/[0.06] p-6">
              <h3 className="text-[10px] font-mono text-white/30 mb-4 tracking-[0.2em] uppercase">24-Hour Forecast</h3>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {weatherData.hourly.slice(0, 24).map((hour: any, index: number) => (
                  <div
                    key={index}
                    className={`flex-shrink-0 w-16 p-3 text-center border transition-colors duration-200 ${
                      index === 0
                        ? "bg-white/[0.06] border-white/[0.10]"
                        : "bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="text-white/30 text-[9px] font-mono mb-2">
                      {index === 0 ? "NOW" : formatHourlyTime(hour.time)}
                    </div>
                    <div className="mb-2 flex justify-center">
                      {getWeatherIcon(hour.weatherCode, isDayTime, "w-5 h-5")}
                    </div>
                    <div className="text-white font-mono text-sm font-light">{hour.temp_C}°</div>
                    {hour.precipProb && parseInt(hour.precipProb) > 0 && (
                      <div className="text-white/20 text-[9px] font-mono mt-1">
                        <Droplets className="w-2 h-2 inline mr-0.5" />
                        {hour.precipProb}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Weather Map */}
        <div className="lg:col-span-12 fade-in fade-in-delay-3">
          <div className="bg-white/[0.03] border border-white/[0.06] p-6">
            <h3 className="text-[10px] font-mono text-white/30 mb-4 tracking-[0.2em] uppercase">Location</h3>
            <div className="h-80 overflow-hidden">
              <WeatherMap weatherData={weatherData} city={city} />
            </div>
          </div>
        </div>

        {/* 7-Day Forecast */}
        <div className="lg:col-span-12 fade-in fade-in-delay-4">
          <div className="bg-white/[0.03] border border-white/[0.06] p-6">
            <h3 className="text-[10px] font-mono text-white/30 mb-4 tracking-[0.2em] uppercase">
              {weatherData.weather.length}-Day Forecast
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2">
              {weatherData.weather.map((day: any, index: number) => (
                <div
                  key={index}
                  className={`p-4 text-center border transition-colors duration-200 ${
                    index === 0
                      ? "bg-white/[0.06] border-white/[0.10]"
                      : "bg-white/[0.02] border-white/[0.04] hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="text-white/30 text-[10px] font-mono mb-3 tracking-wider uppercase">
                    {index === 0
                      ? "Today"
                      : new Date(day.date).toLocaleDateString("en-US", { weekday: "short" })}
                  </div>
                  <div className="mb-3 flex justify-center">
                    {getWeatherIcon(day.hourly[0].weatherCode, true, "w-8 h-8")}
                  </div>
                  <div className="text-white font-mono text-lg font-light">{day.maxtempC}°</div>
                  <div className="text-white/25 font-mono text-sm">{day.mintempC}°</div>
                  <div className="text-white/20 text-[9px] font-mono mt-1 truncate">{day.hourly[0].weatherDesc[0].value}</div>
                  {day.precipMM && parseFloat(day.precipMM) > 0 && (
                    <div className="text-white/15 text-[9px] font-mono mt-1">
                      <Droplets className="w-2 h-2 inline mr-0.5" />{parseFloat(day.precipMM).toFixed(1)}mm
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="lg:col-span-12 pb-4">
          <div className="text-center pt-4 border-t border-white/[0.04]">
            <p className="text-white/10 text-[9px] font-mono tracking-[0.2em] uppercase">
              WeatherMX • Built by Yash Mehla • Data from Open-Meteo
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
