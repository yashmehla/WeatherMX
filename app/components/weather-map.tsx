"use client"

import { useEffect, useRef, useState } from "react"
import { Wind, MapPin, Thermometer, Navigation } from "lucide-react"

interface WeatherMapProps {
  weatherData: any
  city: string
}

export function WeatherMap({ weatherData, city }: WeatherMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [mounted, setMounted] = useState(false)
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [mapError, setMapError] = useState("")
  const current = weatherData.current_condition[0]

  useEffect(() => {
    // Use coordinates from weather data if available
    if (weatherData.latitude && weatherData.longitude) {
      setCoordinates({ lat: weatherData.latitude, lng: weatherData.longitude })
      return
    }

    const fetchCoordinates = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`,
          { headers: { "User-Agent": "WeatherMX/1.0" } },
        )

        if (!response.ok) throw new Error(`Geocoding failed: ${response.status}`)

        const data = await response.json()

        if (data && data.length > 0) {
          setCoordinates({
            lat: Number.parseFloat(data[0].lat),
            lng: Number.parseFloat(data[0].lon),
          })
          setMapError("")
        } else {
          throw new Error("City not found")
        }
      } catch (error) {
        console.error("Geocoding error:", error)
        setMapError("Unable to load map location")
        const fallback = getFallbackCoordinates(city)
        setCoordinates(fallback)
      }
    }

    fetchCoordinates()
  }, [city, weatherData.latitude, weatherData.longitude])

  const getFallbackCoordinates = (cityName: string) => {
    const fallbacks: { [key: string]: { lat: number; lng: number } } = {
      london: { lat: 51.5074, lng: -0.1278 },
      "new york": { lat: 40.7128, lng: -74.006 },
      tokyo: { lat: 35.6762, lng: 139.6503 },
      paris: { lat: 48.8566, lng: 2.3522 },
      delhi: { lat: 28.6139, lng: 77.209 },
      mumbai: { lat: 19.076, lng: 72.8777 },
      sydney: { lat: -33.8688, lng: 151.2093 },
      berlin: { lat: 52.52, lng: 13.405 },
    }
    return fallbacks[cityName.toLowerCase()] || { lat: 51.5074, lng: -0.1278 }
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !coordinates || !mapRef.current) return

    const initMap = async () => {
      try {
        const L = await import("leaflet")

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove()
          mapInstanceRef.current = null
        }

        if (mapRef.current) {
          mapRef.current.innerHTML = ""
        }

        const map = L.map(mapRef.current, { zoomControl: false }).setView([coordinates.lat, coordinates.lng], 10)
        mapInstanceRef.current = map

        // Add zoom control to bottom-right
        L.control.zoom({ position: "bottomright" }).addTo(map)

        // Dark grayscale tiles matching black/white/grey theme
        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }).addTo(map)

        // Label overlay for readability
        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png", {
          subdomains: "abcd",
          maxZoom: 19,
          opacity: 0.5,
        }).addTo(map)

        // Minimalist white marker with pulse
        const customIcon = L.divIcon({
          html: `
            <div style="
              position: relative;
              width: 12px;
              height: 12px;
            ">
              <div style="
                position: absolute;
                top: 0; left: 0;
                width: 12px;
                height: 12px;
                background: white;
                border-radius: 50%;
                box-shadow: 0 0 12px rgba(255,255,255,0.4);
              "></div>
              <div style="
                position: absolute;
                top: -8px;
                left: -8px;
                width: 28px;
                height: 28px;
                border: 1.5px solid rgba(255,255,255,0.3);
                border-radius: 50%;
                animation: pulse-ring 2s infinite;
              "></div>
            </div>
            <style>
              @keyframes pulse-ring {
                0% { transform: scale(0.8); opacity: 0.4; }
                50% { transform: scale(1.4); opacity: 0.1; }
                100% { transform: scale(1.8); opacity: 0; }
              }
            </style>
          `,
          className: "custom-marker",
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        })

        L.marker([coordinates.lat, coordinates.lng], { icon: customIcon }).addTo(map)

        // Wind direction and speed
        const windDeg = Number.parseInt(current.winddirDegree) || 0
        const windSpeed = Number.parseInt(current.windspeedKmph) || 0

        // Add animated wind flow arrows around the location
        const windRadians = (windDeg * Math.PI) / 180
        const arrowCount = 12
        const spreadRadius = 0.08 // degrees of lat/lng spread around marker

        // Animation tuning constants
        const MIN_ANIM_DURATION_S = 1.5
        const BASE_ANIM_DURATION_S = 4
        const WIND_SPEED_DIVISOR = 20 // km/h per 1s reduction in duration
        const BASE_MOVE_PX = 30
        const MOVE_PX_PER_KMH = 0.5

        for (let i = 0; i < arrowCount; i++) {
          // Position arrows in a grid around the marker
          const row = Math.floor(i / 4)
          const col = i % 4
          const offsetLat = (row - 1) * spreadRadius + (Math.random() - 0.5) * spreadRadius * 0.5
          const offsetLng = (col - 1.5) * spreadRadius + (Math.random() - 0.5) * spreadRadius * 0.5

          const arrowLat = coordinates.lat + offsetLat
          const arrowLng = coordinates.lng + offsetLng

          // Faster wind → shorter animation cycle
          const duration = Math.max(MIN_ANIM_DURATION_S, BASE_ANIM_DURATION_S - (windSpeed / WIND_SPEED_DIVISOR))
          const delay = (i * 0.3) % duration

          // Calculate movement delta based on wind direction
          const movePx = BASE_MOVE_PX + windSpeed * MOVE_PX_PER_KMH
          const dx = Math.sin(windRadians) * movePx
          const dy = -Math.cos(windRadians) * movePx

          const arrowIcon = L.divIcon({
            html: `
              <div class="wind-particle" style="
                --wind-dx: ${dx}px;
                --wind-dy: ${dy}px;
                --wind-duration: ${duration}s;
                --wind-delay: ${delay}s;
                width: 24px;
                height: 24px;
              ">
                <svg width="24" height="24" viewBox="0 0 24 24" style="
                  transform: rotate(${windDeg}deg);
                  filter: drop-shadow(0 0 3px rgba(255,255,255,0.3));
                ">
                  <path d="M12 2 L12 22 M12 2 L8 8 M12 2 L16 8" 
                    stroke="rgba(255,255,255,0.6)" 
                    stroke-width="1.5" 
                    fill="none" 
                    stroke-linecap="round" 
                    stroke-linejoin="round"/>
                </svg>
              </div>
            `,
            className: "wind-flow-arrow",
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          })

          L.marker([arrowLat, arrowLng], { icon: arrowIcon, interactive: false }).addTo(map)
        }

        setMapError("")
      } catch (error) {
        console.error("Map init error:", error)
        setMapError("Failed to load map")
      }
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [mounted, coordinates, city, current])

  if (!mounted) {
    return (
      <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white/30 text-xs font-mono">Loading map...</div>
      </div>
    )
  }

  if (mapError && !coordinates) {
    return (
      <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="text-white/40 text-xs font-mono mb-1">{mapError}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-[#0a0a0a] relative overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />

      {/* Top-left overlay: city name */}
      <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm border border-white/[0.1] px-2.5 py-1.5 z-[1000]">
        <div className="flex items-center gap-1.5 text-white text-[10px] font-mono">
          <MapPin className="w-2.5 h-2.5 text-white/50" />
          <span className="text-white/70 truncate max-w-[120px]">{city}</span>
        </div>
      </div>

      {/* Bottom-left overlay: weather + wind info */}
      <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm border border-white/[0.1] px-2.5 py-2 z-[1000]">
        <div className="text-[10px] font-mono space-y-1">
          <div className="flex items-center gap-1.5">
            <Thermometer className="w-2.5 h-2.5 text-white/40" />
            <span className="text-white/60">{current.temp_C}°C</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wind className="w-2.5 h-2.5 text-white/40" />
            <span className="text-white/60">{current.windspeedKmph} km/h</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Navigation className="w-2.5 h-2.5 text-white/40" style={{ transform: `rotate(${Number.parseInt(current.winddirDegree) || 0}deg)` }} />
            <span className="text-white/60">{current.winddir16Point} ({current.winddirDegree}°)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
