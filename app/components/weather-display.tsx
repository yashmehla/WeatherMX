"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Wind, Droplets, Eye, Gauge, RefreshCw, Sunrise, Sunset, Volume2, VolumeX } from "lucide-react"
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
          // Create a subtle refresh sound using Web Audio API
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
          // Success chime
          const successContext = new (window.AudioContext || (window as any).webkitAudioContext)()
          const successOsc = successContext.createOscillator()
          const successGain = successContext.createGain()

          successOsc.connect(successGain)
          successGain.connect(successContext.destination)

          successOsc.frequency.setValueAtTime(523, successContext.currentTime) // C5
          successOsc.frequency.setValueAtTime(659, successContext.currentTime + 0.1) // E5
          successOsc.frequency.setValueAtTime(784, successContext.currentTime + 0.2) // G5

          successGain.gain.setValueAtTime(0.1, successContext.currentTime)
          successGain.gain.exponentialRampToValueAtTime(0.01, successContext.currentTime + 0.3)

          successOsc.start(successContext.currentTime)
          successOsc.stop(successContext.currentTime + 0.3)
          break
        case "click":
          // Subtle click sound
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
    const cooldownTime = 3000 // 3 seconds cooldown

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

  // Enhanced weather icon system with day/night detection
  const getWeatherIcon = (code: string, isDay = true) => {
    const dayIcons: { [key: string]: string } = {
      // Clear/Sunny
      "0": "☀️",
      "113": "☀️",
      "800": "☀️",
      "1000": "☀️",
      // Partly Cloudy
      "1": "🌤️",
      "116": "⛅",
      "801": "🌤️",
      "1003": "⛅",
      // Cloudy
      "2": "⛅",
      "3": "☁️",
      "119": "☁️",
      "122": "☁️",
      "802": "☁️",
      "803": "☁️",
      "804": "☁️",
      "1006": "☁️",
      "1009": "☁️",
      // Fog/Mist
      "45": "🌫️",
      "48": "🌫️",
      "143": "🌫️",
      "248": "🌫️",
      "260": "🌫️",
      "701": "🌫️",
      "741": "🌫️",
      "1030": "🌫️",
      "1135": "🌫️",
      "1147": "🌫️",
      // Drizzle
      "51": "🌦️",
      "53": "🌦️",
      "55": "🌧️",
      "56": "🌧️",
      "57": "🌧️",
      "300": "🌦️",
      "301": "🌦️",
      "302": "🌧️",
      "310": "🌦️",
      "311": "🌦️",
      "312": "🌧️",
      "321": "🌦️",
      // Rain
      "61": "🌧️",
      "63": "🌧️",
      "65": "🌧️",
      "66": "🌧️",
      "67": "🌧️",
      "80": "🌦️",
      "81": "🌧️",
      "82": "⛈️",
      "500": "🌦️",
      "501": "🌧️",
      "502": "⛈️",
      "503": "⛈️",
      "504": "⛈️",
      "511": "🌧️",
      "520": "🌦️",
      "521": "🌧️",
      "522": "⛈️",
      "531": "🌧️",
      // Snow
      "71": "🌨️",
      "73": "❄️",
      "75": "❄️",
      "77": "❄️",
      "85": "🌨️",
      "86": "❄️",
      "600": "🌨️",
      "601": "❄️",
      "602": "❄️",
      "611": "🌨️",
      "612": "🌨️",
      "613": "🌨️",
      "615": "🌨️",
      "616": "🌨️",
      "620": "🌨️",
      "621": "❄️",
      "622": "❄️",
      // Thunderstorm
      "95": "⛈️",
      "96": "⛈️",
      "99": "⛈️",
      "200": "⛈️",
      "201": "⛈️",
      "202": "⛈️",
      "210": "⛈️",
      "211": "⛈️",
      "212": "⛈️",
      "221": "⛈️",
      "230": "⛈️",
      "231": "⛈️",
      "232": "⛈️",
    }

    const nightIcons: { [key: string]: string } = {
      // Clear Night
      "0": "🌙",
      "113": "🌙",
      "800": "🌙",
      "1000": "🌙",
      // Partly Cloudy Night
      "1": "🌙",
      "116": "☁️",
      "801": "🌙",
      "1003": "☁️",
      // Cloudy (same as day)
      "2": "☁️",
      "3": "☁️",
      "119": "☁️",
      "122": "☁️",
      "802": "☁️",
      "803": "☁️",
      "804": "☁️",
      "1006": "☁️",
      "1009": "☁️",
      // Fog/Mist (same as day)
      "45": "🌫️",
      "48": "🌫️",
      "143": "🌫️",
      "248": "🌫️",
      "260": "🌫️",
      "701": "🌫️",
      "741": "🌫️",
      "1030": "🌫️",
      "1135": "🌫️",
      "1147": "🌫️",
      // Rain (same as day)
      "51": "🌧️",
      "53": "🌧️",
      "55": "🌧️",
      "56": "🌧️",
      "57": "🌧️",
      "61": "🌧️",
      "63": "🌧️",
      "65": "🌧️",
      "66": "🌧️",
      "67": "🌧️",
      "80": "🌧️",
      "81": "🌧️",
      "82": "⛈️",
      // Snow (same as day)
      "71": "🌨️",
      "73": "❄️",
      "75": "❄️",
      "77": "❄️",
      "85": "🌨️",
      "86": "❄️",
      // Thunderstorm (same as day)
      "95": "⛈️",
      "96": "⛈️",
      "99": "⛈️",
    }

    const icons = isDay ? dayIcons : nightIcons
    return icons[code] || (isDay ? "🌤️" : "🌙")
  }

  // Determine if it's day or night
  const isCurrentlyDay = () => {
    if (weatherData.isDay !== undefined) {
      return weatherData.isDay
    }

    // Fallback: check current time vs sunrise/sunset
    if (today.sunrise && today.sunset) {
      const now = new Date()
      const sunrise = new Date(today.sunrise)
      const sunset = new Date(today.sunset)
      return now >= sunrise && now <= sunset
    }

    // Ultimate fallback: assume day between 6 AM and 6 PM
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
      <div className="flex items-center justify-between mb-8">
        <Button
          onClick={() => {
            playSound("click")
            onBack()
          }}
          variant="ghost"
          className="text-white hover:bg-gray-800/50 h-12 px-6 rounded"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Search
        </Button>

        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">{city}</h1>
          <p className="text-gray-400">Live Weather Data</p>
          <p className="text-xs text-gray-500 mt-1">Last updated: {new Date().toLocaleTimeString()}</p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Sound Toggle */}
          <Button
            onClick={() => {
              setSoundEnabled(!soundEnabled)
              if (!soundEnabled) playSound("click")
            }}
            variant="ghost"
            className="text-white hover:bg-gray-800/50 h-12 w-12 rounded"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>

          {/* Enhanced Refresh Button */}
          <Button
            onClick={handleRefresh}
            disabled={loading || refreshCooldown > 0}
            variant="ghost"
            className="text-white hover:bg-gray-800/50 h-12 px-6 rounded disabled:opacity-50 relative overflow-hidden"
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Updating..." : refreshCooldown > 0 ? `Wait ${refreshCooldown}s` : "Refresh"}

            {/* Cooldown progress bar */}
            {refreshCooldown > 0 && (
              <div
                className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-1000"
                style={{ width: `${((3 - refreshCooldown) / 3) * 100}%` }}
              />
            )}
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto">
        {/* Current Weather - Large Card */}
        <div className="lg:col-span-5">
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded p-8 h-full shadow-2xl">
            <div className="text-center">
              <div className="text-8xl mb-6">{getWeatherIcon(current.weatherCode, isDayTime)}</div>
              <div className="text-6xl font-bold text-white mb-4">{current.temp_C}°</div>
              <div className="text-xl text-gray-300 mb-2">{current.weatherDesc[0].value}</div>
              <div className="text-gray-400">Feels like {current.FeelsLikeC}°C</div>

              {/* Day/Night indicator */}
              <div className="mt-4 flex items-center justify-center space-x-4">
                <div
                  className={`flex items-center space-x-2 px-3 py-1 rounded ${isDayTime ? "bg-yellow-500/20 text-yellow-300" : "bg-blue-500/20 text-blue-300"}`}
                >
                  {isDayTime ? <Sunrise className="w-4 h-4" /> : <Sunset className="w-4 h-4" />}
                  <span className="text-sm font-medium">{isDayTime ? "Daytime" : "Nighttime"}</span>
                </div>
              </div>
            </div>

            {/* Enhanced Weather Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="bg-gray-800/40 rounded p-4 text-center border border-gray-700/30 hover:bg-gray-800/60 transition-colors">
                <Wind className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <div className="text-white font-semibold text-lg">{current.windspeedKmph}</div>
                <div className="text-gray-400 text-sm">km/h</div>
              </div>
              <div className="bg-gray-800/40 rounded p-4 text-center border border-gray-700/30 hover:bg-gray-800/60 transition-colors">
                <Droplets className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                <div className="text-white font-semibold text-lg">{current.humidity}</div>
                <div className="text-gray-400 text-sm">%</div>
              </div>
              <div className="bg-gray-800/40 rounded p-4 text-center border border-gray-700/30 hover:bg-gray-800/60 transition-colors">
                <Eye className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <div className="text-white font-semibold text-lg">{current.visibility}</div>
                <div className="text-gray-400 text-sm">km</div>
              </div>
              <div className="bg-gray-800/40 rounded p-4 text-center border border-gray-700/30 hover:bg-gray-800/60 transition-colors">
                <Gauge className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <div className="text-white font-semibold text-lg">{current.pressure}</div>
                <div className="text-gray-400 text-sm">mb</div>
              </div>
            </div>

            {/* Sunrise/Sunset Times */}
            {(today.sunrise || today.sunset) && (
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded p-4 text-center border border-orange-500/30">
                  <Sunrise className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                  <div className="text-white font-semibold text-lg">{formatTime(today.sunrise)}</div>
                  <div className="text-gray-400 text-sm">Sunrise</div>
                </div>
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded p-4 text-center border border-purple-500/30">
                  <Sunset className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <div className="text-white font-semibold text-lg">{formatTime(today.sunset)}</div>
                  <div className="text-gray-400 text-sm">Sunset</div>
                </div>
              </div>
            )}

            {/* Weather Status Indicator */}
          </div>
        </div>

        {/* Weather Tiles */}
        <div className="lg:col-span-7">
          <WeatherTile weatherData={weatherData} city={city} />
        </div>

        {/* Weather Map */}
        <div className="lg:col-span-12">
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6">Weather Map - {city}</h3>
            <div className="h-96">
              <WeatherMap weatherData={weatherData} city={city} />
            </div>
          </div>
        </div>

        {/* Forecast */}
        <div className="lg:col-span-12">
          <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              {weatherData.weather.length}-Day Forecast
            </h3>
            <div className="flex justify-center">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 max-w-4xl">
                {weatherData.weather.map((day: any, index: number) => (
                  <div
                    key={index}
                    className="bg-gray-800/30 rounded p-6 text-center hover:bg-gray-800/50 transition-colors min-w-[200px] border border-gray-700/30"
                  >
                    <div className="text-gray-400 text-sm mb-4 font-medium">
                      {index === 0
                        ? "Today"
                        : new Date(day.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "short",
                            day: "numeric",
                          })}
                    </div>
                    <div className="text-5xl mb-4">{getWeatherIcon(day.hourly[0].weatherCode, true)}</div>
                    <div className="text-white font-bold text-2xl mb-2">{day.maxtempC}°</div>
                    <div className="text-gray-400 text-lg mb-3">{day.mintempC}°</div>
                    <div className="text-gray-300 text-sm">{day.hourly[0].weatherDesc[0].value}</div>
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
