"use client"

import { useEffect, useRef, useState } from "react"
import { Wind, MapPin, Thermometer } from "lucide-react"

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

        const map = L.map(mapRef.current).setView([coordinates.lat, coordinates.lng], 10)
        mapInstanceRef.current = map

        // Dark grayscale tiles matching black/white/grey theme
        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }).addTo(map)

        // Minimalist white marker
        const customIcon = L.divIcon({
          html: `
            <div style="
              background: white;
              width: 10px;
              height: 10px;
              border: 2px solid rgba(255,255,255,0.3);
              box-shadow: 0 0 20px rgba(255,255,255,0.15);
            ">
              <div style="
                position: absolute;
                top: -6px;
                left: -6px;
                width: 22px;
                height: 22px;
                border: 1px solid rgba(255,255,255,0.2);
                animation: pulse-ring 2s infinite;
              "></div>
            </div>
            <style>
              @keyframes pulse-ring {
                0% { transform: scale(0.8); opacity: 0.3; }
                50% { transform: scale(1.3); opacity: 0.1; }
                100% { transform: scale(1.8); opacity: 0; }
              }
            </style>
          `,
          className: "custom-marker",
          iconSize: [10, 10],
          iconAnchor: [5, 5],
        })

        L.marker([coordinates.lat, coordinates.lng], { icon: customIcon }).addTo(map)

        // Subtle temperature circle
        const temp = Number.parseInt(current.temp_C) || 20
        L.circle([coordinates.lat, coordinates.lng], {
          color: "rgba(255,255,255,0.15)",
          fillColor: "rgba(255,255,255,0.05)",
          fillOpacity: 1,
          radius: 5000,
          weight: 1,
        }).addTo(map)

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
        <div className="text-white/20 text-xs font-mono">Loading map...</div>
      </div>
    )
  }

  if (mapError && !coordinates) {
    return (
      <div className="w-full h-full bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="text-white/30 text-xs font-mono mb-1">{mapError}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-[#0a0a0a] relative overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />

      {/* Minimal corner overlays */}
      <div className="absolute top-2 left-2 bg-black/90 border border-white/[0.08] p-2 z-[1000]">
        <div className="flex items-center gap-1.5 text-white text-[10px] font-mono">
          <MapPin className="w-2.5 h-2.5 text-white/40" />
          <span className="text-white/60 truncate max-w-[120px]">{city}</span>
        </div>
      </div>

      <div className="absolute bottom-2 left-2 bg-black/90 border border-white/[0.08] p-2 z-[1000]">
        <div className="text-[10px] font-mono space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Thermometer className="w-2.5 h-2.5 text-white/30" />
            <span className="text-white/50">{current.temp_C}°C</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wind className="w-2.5 h-2.5 text-white/30" />
            <span className="text-white/50">{current.windspeedKmph} km/h {current.winddir16Point}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
