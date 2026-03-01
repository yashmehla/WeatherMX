"use client"

import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  Wind,
  Droplets,
  Eye,
  Gauge,
  RefreshCw,
  Sunrise,
  Sunset,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudDrizzle,
  CloudFog,
  CloudSun,
  CloudMoon,
  Snowflake,
  Cloudy,
  Thermometer,
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
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<number>(0)
  const [refreshCooldown, setRefreshCooldown] = useState(0)

  const current = weatherData.current_condition[0]
  const today = weatherData.weather[0]

  // Play sound effects
  const playSound = (type: "refresh" | "success" | "error" | "click") => {
    if (!soundEnabled) return

    try {
      const audio = new Audio()
      switch (type) {
        case "refresh":
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
          const oscillator = audioContext.createOscillator()
          const gainNode = audioContext.createGain()

          oscillator.connect(gainNode)
          gainNode.connect(audioContext.destination)

          oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
          oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1)

          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)

          oscillator.start(audioContext.currentTime)
          oscillator.stop(audioContext.currentTime + 0.1)
          break
        case "success":
          const successContext = new (window.AudioContext || (window as any).webkitAudioContext)()
          const successOsc = successContext.createOscillator()
          const successGain = successContext.createGain()

          successOsc.connect(successGain)
          successGain.connect(successContext.destination)

          successOsc.frequency.setValueAtTime(523, successContext.currentTime)
          successOsc.frequency.setValueAtTime(659, successContext.currentTime + 0.1)
          successOsc.frequency.setValueAtTime(784, successContext.currentTime + 0.2)

          successGain.gain.setValueAtTime(0.1, successContext.currentTime)
          successGain.gain.exponentialRampToValueAtTime(0.01, successContext.currentTime + 0.3)

          successOsc.start(successContext.currentTime)
          successOsc.stop(successContext.currentTime + 0.3)
          break
        case "click":
          const clickContext = new (window.AudioContext || (window as any).webkitAudioContext)()
          const clickOsc = clickContext.createOscillator()
          const clickGain = clickContext.createGain()

          clickOsc.connect(clickGain)
          clickGain.connect(clickContext.destination)

          clickOsc.frequency.setValueAtTime(1000, clickContext.currentTime)
          clickGain.gain.setValueAtTime(0.05, clickContext.currentTime)
          clickGain.gain.exponentialRampToValueAtTime(0.01, clickContext.currentTime + 0.05)

          clickOsc.start(clickContext.currentTime)
          clickOsc.stop(clickContext.currentTime + 0.05)
          break
      }
    } catch (error) {
      console.warn("Sound playback failed:", error)
    }
  }

  // Enhanced refresh with cooldown and sound
  const handleRefresh = () => {
    const now = Date.now()
    const timeSinceLastRefresh = now - lastRefresh
    const cooldownTime = 3000

    if (timeSinceLastRefresh < cooldownTime) {
      const remaining = Math.ceil((cooldownTime - timeSinceLastRefresh) / 1000)
      setRefreshCooldown(remaining)
      return
    }

    playSound("refresh")
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

  // Play success sound when data loads
  useEffect(() => {
    if (weatherData && !loading) {
      playSound("success")
    }
  }, [weatherData, loading])

  // SVG icon-based weather icon system
  const getWeatherIcon = (code: string, isDay = true, size = "w-16 h-16") => {
    const codeNum = parseInt(code)

    // Clear/Sunny
    if ([0, 113, 800, 1000].includes(codeNum)) {
      return isDay
        ? <Sun className={`${size} text-amber-400`} strokeWidth={1.5} />
        : <Moon className={`${size} text-blue-300`} strokeWidth={1.5} />
    }

    // Partly Cloudy
    if ([1, 116, 801, 1003].includes(codeNum)) {
      return isDay
        ? <CloudSun className={`${size} text-amber-300`} strokeWidth={1.5} />
        : <CloudMoon className={`${size} text-blue-200`} strokeWidth={1.5} />
    }

    // Cloudy / Overcast
    if ([2, 3, 119, 122, 802, 803, 804, 1006, 1009].includes(codeNum)) {
      return <Cloud className={`${size} text-gray-300`} strokeWidth={1.5} />
    }

    // Fog / Mist
    if ([45, 48, 143, 248, 260, 701, 741, 1030, 1135, 1147].includes(codeNum)) {
      return <CloudFog className={`${size} text-gray-400`} strokeWidth={1.5} />
    }

    // Drizzle
    if ([51, 53, 55, 56, 57, 300, 301, 302, 310, 311, 312, 321, 1150, 1153, 1168, 1171].includes(codeNum)) {
      return <CloudDrizzle className={`${size} text-blue-300`} strokeWidth={1.5} />
    }

    // Rain
    if ([61, 63, 65, 66, 67, 80, 81, 82, 500, 501, 502, 503, 504, 511, 520, 521, 522, 531, 1180, 1183, 1186, 1189, 1192, 1195, 1198, 1201, 1240, 1243, 1246].includes(codeNum)) {
      return <CloudRain className={`${size} text-blue-400`} strokeWidth={1.5} />
    }

    // Snow
    if ([71, 73, 75, 77, 85, 86, 600, 601, 602, 611, 612, 613, 615, 616, 620, 621, 622, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1249, 1252, 1255, 1258, 1261, 1264].includes(codeNum)) {
      return <Snowflake className={`${size} text-sky-200`} strokeWidth={1.5} />
    }

    // Thunderstorm
    if ([95, 96, 99, 200, 201, 202, 210, 211, 212, 221, 230, 231, 232, 1087, 1273, 1276, 1279, 1282].includes(codeNum)) {
      return <CloudLightning className={`${size} text-yellow-300`} strokeWidth={1.5} />
    }

    // Default fallback
    return isDay
      ? <CloudSun className={`${size} text-gray-300`} strokeWidth={1.5} />
      : <CloudMoon className={`${size} text-gray-400`} strokeWidth={1.5} />
  }

  // Determine if it's day or night
  const isCurrentlyDay = () => {
    if (weatherData.isDay !== undefined) {
      return weatherData.isDay
    }

    if (today.sunrise && today.sunset) {
      const now = new Date()
      const sunrise = new Date(today.sunrise)
      const sunset = new Date(today.sunset)
      return now >= sunrise && now <= sunset
    }

    const hour = new Date().getHours()
    return hour >= 6 && hour < 18
  }

  // Format time for display
  const formatTime = (timeString: string) => {
    if (!timeString) return "N/A"
    try {
      const date = new Date(timeString)
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } catch {
      return "N/A"
    }
  }

  const isDayTime = isCurrentlyDay()

  return (
    <div className="min-h-screen p-4 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 max-w-7xl mx-auto">
        <Button
          onClick={() => {
            playSound("click")
            onBack()
          }}
          variant="ghost"
          className="text-white/60 hover:text-white hover:bg-white/[0.06] h-10 px-4 rounded-lg text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="text-center">
          <h1 className="text-2xl font-semibold text-white tracking-tight">{city}</h1>
          <p className="text-white/30 text-xs mt-0.5">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>

        <div className="flex items-center space-x-1">
          <Button
            onClick={() => {
              setSoundEnabled(!soundEnabled)
              if (!soundEnabled) playSound("click")
            }}
            variant="ghost"
            className="text-white/40 hover:text-white hover:bg-white/[0.06] h-10 w-10 rounded-lg"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>

          <Button
            onClick={handleRefresh}
            disabled={loading || refreshCooldown > 0}
            variant="ghost"
            className="text-white/40 hover:text-white hover:bg-white/[0.06] h-10 px-4 rounded-lg disabled:opacity-30 relative overflow-hidden text-sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Updating" : refreshCooldown > 0 ? `${refreshCooldown}s` : "Refresh"}
            {refreshCooldown > 0 && (
              <div
                className="absolute bottom-0 left-0 h-0.5 bg-blue-500 transition-all duration-1000"
                style={{ width: `${((3 - refreshCooldown) / 3) * 100}%` }}
              />
            )}
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 max-w-7xl mx-auto">
        {/* Current Weather - Large Card */}
        <div className="lg:col-span-5">
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.06] rounded-lg p-8 h-full">
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                {getWeatherIcon(current.weatherCode, isDayTime, "w-20 h-20")}
              </div>
              <div className="text-7xl font-light text-white mb-2 tracking-tighter">{current.temp_C}°</div>
              <div className="text-white/60 text-sm font-medium mb-1">{current.weatherDesc[0].value}</div>
              <div className="text-white/30 text-xs">Feels like {current.FeelsLikeC}°C</div>

              <div className="mt-5 inline-flex items-center space-x-2 px-3 py-1.5 rounded-md bg-white/[0.04] border border-white/[0.06]">
                {isDayTime ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-blue-300" />}
                <span className="text-white/50 text-xs font-medium">{isDayTime ? "Daytime" : "Nighttime"}</span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mt-8">
              <div className="bg-white/[0.03] rounded-lg p-4 text-center border border-white/[0.04] hover:bg-white/[0.06] transition-colors duration-300">
                <Wind className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                <div className="text-white font-medium text-lg">{current.windspeedKmph}</div>
                <div className="text-white/30 text-xs">km/h</div>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-4 text-center border border-white/[0.04] hover:bg-white/[0.06] transition-colors duration-300">
                <Droplets className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                <div className="text-white font-medium text-lg">{current.humidity}</div>
                <div className="text-white/30 text-xs">%</div>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-4 text-center border border-white/[0.04] hover:bg-white/[0.06] transition-colors duration-300">
                <Eye className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                <div className="text-white font-medium text-lg">{current.visibility}</div>
                <div className="text-white/30 text-xs">km</div>
              </div>
              <div className="bg-white/[0.03] rounded-lg p-4 text-center border border-white/[0.04] hover:bg-white/[0.06] transition-colors duration-300">
                <Gauge className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                <div className="text-white font-medium text-lg">{current.pressure}</div>
                <div className="text-white/30 text-xs">mb</div>
              </div>
            </div>

            {/* Sunrise/Sunset */}
            {(today.sunrise || today.sunset) && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-white/[0.03] rounded-lg p-4 text-center border border-white/[0.04]">
                  <Sunrise className="w-5 h-5 text-orange-400 mx-auto mb-2" />
                  <div className="text-white font-medium">{formatTime(today.sunrise)}</div>
                  <div className="text-white/30 text-xs">Sunrise</div>
                </div>
                <div className="bg-white/[0.03] rounded-lg p-4 text-center border border-white/[0.04]">
                  <Sunset className="w-5 h-5 text-violet-400 mx-auto mb-2" />
                  <div className="text-white font-medium">{formatTime(today.sunset)}</div>
                  <div className="text-white/30 text-xs">Sunset</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Weather Tiles */}
        <div className="lg:col-span-7">
          <WeatherTile weatherData={weatherData} city={city} />
        </div>

        {/* Weather Map */}
        <div className="lg:col-span-12">
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.06] rounded-lg p-6">
            <h3 className="text-sm font-medium text-white/60 mb-4 uppercase tracking-wider">Location</h3>
            <div className="h-96 rounded-lg overflow-hidden">
              <WeatherMap weatherData={weatherData} city={city} />
            </div>
          </div>
        </div>

        {/* Forecast */}
        <div className="lg:col-span-12">
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.06] rounded-lg p-6">
            <h3 className="text-sm font-medium text-white/60 mb-4 uppercase tracking-wider">
              {weatherData.weather.length}-Day Forecast
            </h3>
            <div className="flex justify-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
                {weatherData.weather.map((day: any, index: number) => (
                  <div
                    key={index}
                    className="bg-white/[0.03] rounded-lg p-6 text-center hover:bg-white/[0.06] transition-colors duration-300 border border-white/[0.04]"
                  >
                    <div className="text-white/40 text-xs mb-4 font-medium uppercase tracking-wider">
                      {index === 0
                        ? "Today"
                        : new Date(day.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                    </div>
                    <div className="mb-4 flex justify-center">
                      {getWeatherIcon(day.hourly[0].weatherCode, true, "w-10 h-10")}
                    </div>
                    <div className="text-white font-medium text-xl mb-1">{day.maxtempC}°</div>
                    <div className="text-white/30 text-sm mb-2">{day.mintempC}°</div>
                    <div className="text-white/40 text-xs">{day.hourly[0].weatherDesc[0].value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
