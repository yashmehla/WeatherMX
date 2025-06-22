"use client"

import { useEffect, useRef, useState } from "react"
import { Wind, MapPin, Thermometer } from "lucide-react"

interface WeatherMapProps {
  weatherData: any
  city: string
}

// Custom Wind Arrow Component (same as Wind Analysis)
const WindArrow = ({ degrees, size = 24 }: { degrees: number; size?: number }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className="text-blue-400"
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
  )
}

export function WeatherMap({ weatherData, city }: WeatherMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [mounted, setMounted] = useState(false)
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [mapError, setMapError] = useState("")
  const current = weatherData.current_condition[0]

  // Get city coordinates with better error handling
  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        console.log("Fetching coordinates for:", city)
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1&addressdetails=1`,
          {
            headers: {
              "User-Agent": "WeatherApp/1.0",
            },
          },
        )

        if (!response.ok) {
          throw new Error(`Geocoding failed: ${response.status}`)
        }

        const data = await response.json()
        console.log("Geocoding response:", data)

        if (data && data.length > 0) {
          const coords = {
            lat: Number.parseFloat(data[0].lat),
            lng: Number.parseFloat(data[0].lon),
          }
          console.log("Coordinates found:", coords)
          setCoordinates(coords)
          setMapError("")
        } else {
          throw new Error("City not found in geocoding service")
        }
      } catch (error) {
        console.error("Error fetching coordinates:", error)
        setMapError("Unable to load map location")

        // Use fallback coordinates based on common cities
        const fallbackCoords = getFallbackCoordinates(city)
        setCoordinates(fallbackCoords)
      }
    }

    fetchCoordinates()
  }, [city])

  // Fallback coordinates for common cities
  const getFallbackCoordinates = (cityName: string) => {
    const fallbacks: { [key: string]: { lat: number; lng: number } } = {
      london: { lat: 51.5074, lng: -0.1278 },
      "new york": { lat: 40.7128, lng: -74.006 },
      tokyo: { lat: 35.6762, lng: 139.6503 },
      paris: { lat: 48.8566, lng: 2.3522 },
      delhi: { lat: 28.6139, lng: 77.209 },
      mumbai: { lat: 19.076, lng: 72.8777 },
      bangalore: { lat: 12.9716, lng: 77.5946 },
      sydney: { lat: -33.8688, lng: 151.2093 },
      berlin: { lat: 52.52, lng: 13.405 },
      moscow: { lat: 55.7558, lng: 37.6176 },
      kurukshetra: { lat: 29.9692, lng: 76.8781 },
    }

    const cityLower = cityName.toLowerCase()
    return fallbacks[cityLower] || { lat: 51.5074, lng: -0.1278 } // Default to London
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !coordinates || !mapRef.current) return

    // Dynamically import Leaflet to avoid SSR issues
    const initMap = async () => {
      try {
        const L = await import("leaflet")

        // Clear any existing map instance
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove()
          mapInstanceRef.current = null
        }

        // Clear container
        if (mapRef.current) {
          mapRef.current.innerHTML = ""
        }

        // Create new map instance
        const map = L.map(mapRef.current).setView([coordinates.lat, coordinates.lng], 10)
        mapInstanceRef.current = map

        // Add OpenStreetMap tiles with error handling
        const tileLayer = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
          errorTileUrl:
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
        })

        tileLayer.on("tileerror", (e) => {
          console.warn("Tile loading error:", e)
        })

        tileLayer.addTo(map)

        // Custom marker icon - NO POPUP
        const customIcon = L.divIcon({
          html: `
            <div style="
              background: #ef4444;
              width: 20px;
              height: 20px;
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 2px 10px rgba(0,0,0,0.5);
              z-index: 1000;
              position: relative;
            ">
              <div style="
                position: absolute;
                top: -8px;
                left: -8px;
                width: 36px;
                height: 36px;
                border: 2px solid #ef4444;
                border-radius: 50%;
                opacity: 0.3;
                animation: pulse-ring 2s infinite;
              "></div>
            </div>
            <style>
              @keyframes pulse-ring {
                0% { transform: scale(0.8); opacity: 0.3; }
                50% { transform: scale(1.2); opacity: 0.1; }
                100% { transform: scale(1.5); opacity: 0; }
              }
            </style>
          `,
          className: "custom-marker",
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        })

        // Add city marker WITHOUT popup
        L.marker([coordinates.lat, coordinates.lng], { icon: customIcon }).addTo(map)

        // Simple moving wind arrows (fewer arrows, clean design)
        const windSpeed = Number.parseInt(current.windspeedKmph) || 0
        const windDir = Number.parseInt(current.winddirDegree) || 0

        if (windSpeed > 0 && !isNaN(windDir)) {
          // Create fewer, cleaner wind arrows
          const arrowPositions = [
            { lat: coordinates.lat + 0.03, lng: coordinates.lng + 0.03 },
            { lat: coordinates.lat - 0.03, lng: coordinates.lng - 0.03 },
            { lat: coordinates.lat + 0.03, lng: coordinates.lng - 0.03 },
            { lat: coordinates.lat - 0.03, lng: coordinates.lng + 0.03 },
            { lat: coordinates.lat + 0.05, lng: coordinates.lng },
            { lat: coordinates.lat - 0.05, lng: coordinates.lng },
            { lat: coordinates.lat, lng: coordinates.lng + 0.05 },
            { lat: coordinates.lat, lng: coordinates.lng - 0.05 },
          ]

          arrowPositions.forEach((pos, index) => {
            const animationDelay = index * 0.3

            const windArrowIcon = L.divIcon({
              html: `
                <div style="
                  position: relative;
                  width: 32px;
                  height: 32px;
                  z-index: 1000;
                ">
                  <div style="
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(${windDir}deg);
                    animation: moveForward 2s infinite linear;
                    animation-delay: ${animationDelay}s;
                  ">
                    <svg width="32" height="32" viewBox="0 0 24 24" style="color: #60a5fa;">
                      <line x1="12" y1="20" x2="12" y2="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M12 4 L8 8 L12 6 L16 8 Z" fill="currentColor" />
                      <path d="M12 20 L10 18 L12 19 L14 18 Z" fill="currentColor" />
                    </svg>
                  </div>
                </div>
                
                <style>
                  @keyframes moveForward {
                    0% { 
                      transform: translate(-50%, -50%) rotate(${windDir}deg) translateY(0px);
                      opacity: 0.8;
                    }
                    50% { 
                      transform: translate(-50%, -50%) rotate(${windDir}deg) translateY(-8px);
                      opacity: 1;
                    }
                    100% { 
                      transform: translate(-50%, -50%) rotate(${windDir}deg) translateY(-16px);
                      opacity: 0.3;
                    }
                  }
                </style>
              `,
              className: "wind-arrow-simple",
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            })

            L.marker([pos.lat, pos.lng], { icon: windArrowIcon }).addTo(map)
          })
        }

        // Add temperature overlay
        const temp = Number.parseInt(current.temp_C) || 20
        const tempColor = temp > 25 ? "#ef4444" : temp > 15 ? "#f59e0b" : temp > 5 ? "#10b981" : "#3b82f6"

        L.circle([coordinates.lat, coordinates.lng], {
          color: tempColor,
          fillColor: tempColor,
          fillOpacity: 0.1,
          radius: 5000,
          weight: 2,
        }).addTo(map)

        setMapError("")
      } catch (error) {
        console.error("Error initializing map:", error)
        setMapError("Failed to load map")
      }
    }

    initMap()

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [mounted, coordinates, city, current])

  if (!mounted) {
    return (
      <div className="w-full h-full bg-gray-800 rounded-xl flex items-center justify-center">
        <div className="text-white">Loading map...</div>
      </div>
    )
  }

  if (mapError) {
    return (
      <div className="w-full h-full bg-gray-800 rounded-xl flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-red-400 mb-2">⚠️ {mapError}</div>
          <div className="text-sm text-gray-400">Showing approximate location</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-gray-800 rounded-xl relative overflow-hidden">
      {/* Map container */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Compact Mobile-Friendly Corner UI */}
      {/* Top Left - City Info */}
      <div className="absolute top-2 left-2 bg-gray-900/95 backdrop-blur-sm rounded-lg p-2 max-w-[140px] z-[1000] shadow-lg border border-gray-700/50">
        <div className="flex items-center space-x-1 text-white text-xs font-medium mb-1">
          <MapPin className="w-3 h-3 text-red-500 flex-shrink-0" />
          <span className="truncate">{city}</span>
        </div>
        <div className="text-xs text-gray-400">
          Updated: {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>

      {/* Top Right - Legend */}
      <div className="absolute top-2 right-2 bg-gray-900/95 backdrop-blur-sm rounded-lg p-2 z-[1000] shadow-lg border border-gray-700/50">
        <div className="text-white text-xs space-y-1">
          <div className="font-medium mb-1">Legend</div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 animate-pulse"></div>
            <span className="text-xs">Location</span>
          </div>
          <div className="flex items-center space-x-1">
            <WindArrow degrees={0} size={12} />
            <span className="text-xs">Wind Flow</span>
          </div>
        </div>
      </div>

      {/* Bottom Left - Wind Info */}
      <div className="absolute bottom-2 left-2 bg-gray-900/95 backdrop-blur-sm rounded-lg p-2 z-[1000] shadow-lg border border-gray-700/50">
        <div className="text-white text-xs">
          <div className="flex items-center space-x-1 mb-1">
            <Wind className="w-3 h-3 text-blue-400 flex-shrink-0" />
            <span className="font-medium">Wind</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-1">
              <span>{current.windspeedKmph} km/h</span>
              <div className="flex space-x-0.5">
                {[...Array(Math.min(Math.ceil(Number.parseInt(current.windspeedKmph) / 10), 5))].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 h-2 bg-blue-400 rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <WindArrow degrees={Number.parseInt(current.winddirDegree)} size={12} />
              <span>{current.winddir16Point}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Right - Weather Info */}
      <div className="absolute bottom-2 right-2 bg-gray-900/95 backdrop-blur-sm rounded-lg p-2 z-[1000] shadow-lg border border-gray-700/50">
        <div className="text-white text-xs space-y-1">
          <div className="flex items-center space-x-1">
            <Thermometer className="w-3 h-3 text-orange-400 flex-shrink-0" />
            <span>{current.temp_C}°C</span>
          </div>
          <div>Humidity: {current.humidity}%</div>
          <div>Pressure: {current.pressure} mb</div>
        </div>
      </div>
    </div>
  )
}
