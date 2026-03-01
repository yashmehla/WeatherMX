"use client"

import { useState, useEffect, useCallback } from "react"
import { WeatherDisplay } from "./components/weather-display"
import { CityInput } from "./components/city-input"
import { NoiseBackground } from "./components/noise-background"

export default function Home() {
  const [city, setCity] = useState("")
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchWeatherData = async (cityName: string) => {
    // Try Open-Meteo first (free, no API key, most reliable and comprehensive)
    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`,
      )

      if (geoResponse.ok) {
        const geoData = await geoResponse.json()
        if (geoData.results && geoData.results.length > 0) {
          const { latitude, longitude, name, country, timezone } = geoData.results[0]

          const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,weather_code,precipitation_probability,wind_speed_10m,relative_humidity_2m,apparent_temperature,visibility&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,daylight_duration,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant&timezone=auto&forecast_days=7`,
          )

          if (weatherResponse.ok) {
            const data = await weatherResponse.json()
            return convertOpenMeteoData(data, `${name}, ${country}`, latitude, longitude, timezone)
          }
        }
      }
    } catch (error) {
      console.warn("Open-Meteo failed:", error)
    }

    // Fallback: Try WeatherAPI.com
    try {
      const weatherApiResponse = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=demo&q=${encodeURIComponent(cityName)}&days=7&aqi=yes`,
        { method: "GET", headers: { Accept: "application/json" } },
      )

      if (weatherApiResponse.ok) {
        const data = await weatherApiResponse.json()
        return convertWeatherApiData(data)
      }
    } catch (error) {
      console.warn("WeatherAPI.com failed:", error)
    }

    throw new Error("All weather services are currently unavailable. Please try again later.")
  }

  const convertWeatherApiData = (data: any) => {
    const current = data.current
    const location = data.location
    const forecast = data.forecast?.forecastday || []

    return {
      city: `${location.name}, ${location.country}`,
      latitude: location.lat,
      longitude: location.lon,
      timezone: location.tz_id,
      current_condition: [
        {
          temp_C: Math.round(current.temp_c).toString(),
          FeelsLikeC: Math.round(current.feelslike_c).toString(),
          humidity: current.humidity.toString(),
          pressure: Math.round(current.pressure_mb).toString(),
          visibility: Math.round(current.vis_km).toString(),
          windspeedKmph: Math.round(current.wind_kph).toString(),
          winddirDegree: current.wind_degree.toString(),
          winddir16Point: getWindDirection(current.wind_degree),
          weatherCode: current.condition.code.toString(),
          weatherDesc: [{ value: current.condition.text || "Clear" }],
          cloudcover: current.cloud.toString(),
          uvIndex: current.uv?.toString() || "N/A",
          windGustsKmph: Math.round(current.gust_kph || 0).toString(),
          precipMM: (current.precip_mm || 0).toString(),
        },
      ],
      isDay: current.is_day === 1,
      weather: forecast.length > 0
        ? forecast.map((day: any) => ({
            date: day.date,
            maxtempC: Math.round(day.day.maxtemp_c).toString(),
            mintempC: Math.round(day.day.mintemp_c).toString(),
            sunrise: day.astro.sunrise,
            sunset: day.astro.sunset,
            uvIndex: day.day.uv?.toString() || "N/A",
            precipMM: (day.day.totalprecip_mm || 0).toString(),
            hourly: [
              {
                weatherCode: day.day.condition.code.toString(),
                weatherDesc: [{ value: day.day.condition.text || "Clear" }],
              },
            ],
          }))
        : [
            {
              date: new Date().toISOString().split("T")[0],
              maxtempC: Math.round(current.temp_c).toString(),
              mintempC: Math.round(current.temp_c).toString(),
              sunrise: "N/A",
              sunset: "N/A",
              hourly: [
                {
                  weatherCode: current.condition.code.toString(),
                  weatherDesc: [{ value: current.condition.text || "Clear" }],
                },
              ],
            },
          ],
      hourly: null,
    }
  }

  const convertOpenMeteoData = (data: any, cityName: string, latitude: number, longitude: number, timezone: string) => {
    const current = data.current
    const daily = data.daily
    const hourly = data.hourly

    // Get visibility from hourly data (current hour)
    const currentHour = new Date().getHours()
    const visibility = hourly?.visibility?.[currentHour]
      ? Math.round(hourly.visibility[currentHour] / 1000).toString()
      : "10"

    // Get next 24 hours of hourly data
    const hourlyForecast = hourly
      ? Array.from({ length: 24 }, (_, i) => {
          const idx = currentHour + i
          if (idx >= hourly.time.length) return null
          return {
            time: hourly.time[idx],
            temp_C: Math.round(hourly.temperature_2m[idx]).toString(),
            weatherCode: hourly.weather_code[idx]?.toString() || "0",
            precipProb: hourly.precipitation_probability?.[idx]?.toString() || "0",
            windSpeed: Math.round(hourly.wind_speed_10m[idx]).toString(),
            humidity: hourly.relative_humidity_2m[idx]?.toString() || "0",
            feelsLike: Math.round(hourly.apparent_temperature[idx]).toString(),
          }
        }).filter(Boolean)
      : null

    return {
      city: cityName,
      latitude,
      longitude,
      timezone,
      current_condition: [
        {
          temp_C: Math.round(current.temperature_2m).toString(),
          FeelsLikeC: Math.round(current.apparent_temperature).toString(),
          humidity: current.relative_humidity_2m.toString(),
          pressure: Math.round(current.pressure_msl).toString(),
          visibility,
          windspeedKmph: Math.round(current.wind_speed_10m).toString(),
          winddirDegree: Math.round(current.wind_direction_10m).toString(),
          winddir16Point: getWindDirection(current.wind_direction_10m),
          weatherCode: current.weather_code.toString(),
          weatherDesc: [{ value: getWeatherDescription(current.weather_code) }],
          cloudcover: current.cloud_cover.toString(),
          uvIndex: daily.uv_index_max[0]?.toString() || "N/A",
          windGustsKmph: Math.round(current.wind_gusts_10m || 0).toString(),
          precipMM: (current.precipitation || 0).toString(),
        },
      ],
      isDay: current.is_day === 1,
      weather: daily.time.slice(0, 7).map((date: string, index: number) => ({
        date,
        maxtempC: Math.round(daily.temperature_2m_max[index]).toString(),
        mintempC: Math.round(daily.temperature_2m_min[index]).toString(),
        sunrise: daily.sunrise[index],
        sunset: daily.sunset[index],
        uvIndex: daily.uv_index_max[index]?.toString() || "N/A",
        precipMM: (daily.precipitation_sum[index] || 0).toString(),
        precipProb: (daily.precipitation_probability_max?.[index] || 0).toString(),
        windMax: Math.round(daily.wind_speed_10m_max[index]).toString(),
        hourly: [
          {
            weatherCode: daily.weather_code[index].toString(),
            weatherDesc: [{ value: getWeatherDescription(daily.weather_code[index]) }],
          },
        ],
      })),
      hourly: hourlyForecast,
    }
  }

  const getWeatherDescription = (code: number): string => {
    const descriptions: { [key: number]: string } = {
      0: "Clear Sky",
      1: "Mainly Clear",
      2: "Partly Cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Depositing Rime Fog",
      51: "Light Drizzle",
      53: "Moderate Drizzle",
      55: "Dense Drizzle",
      56: "Light Freezing Drizzle",
      57: "Dense Freezing Drizzle",
      61: "Slight Rain",
      63: "Moderate Rain",
      65: "Heavy Rain",
      66: "Light Freezing Rain",
      67: "Heavy Freezing Rain",
      71: "Slight Snow Fall",
      73: "Moderate Snow Fall",
      75: "Heavy Snow Fall",
      77: "Snow Grains",
      80: "Slight Rain Showers",
      81: "Moderate Rain Showers",
      82: "Violent Rain Showers",
      85: "Slight Snow Showers",
      86: "Heavy Snow Showers",
      95: "Thunderstorm",
      96: "Thunderstorm with Slight Hail",
      99: "Thunderstorm with Heavy Hail",
      200: "Thunderstorm with Light Rain",
      201: "Thunderstorm with Rain",
      202: "Thunderstorm with Heavy Rain",
      210: "Light Thunderstorm",
      211: "Thunderstorm",
      212: "Heavy Thunderstorm",
      221: "Ragged Thunderstorm",
      230: "Thunderstorm with Light Drizzle",
      231: "Thunderstorm with Drizzle",
      232: "Thunderstorm with Heavy Drizzle",
      300: "Light Intensity Drizzle",
      301: "Drizzle",
      302: "Heavy Intensity Drizzle",
      500: "Light Rain",
      501: "Moderate Rain",
      502: "Heavy Intensity Rain",
      503: "Very Heavy Rain",
      504: "Extreme Rain",
      511: "Freezing Rain",
      520: "Light Intensity Shower Rain",
      521: "Shower Rain",
      522: "Heavy Intensity Shower Rain",
      600: "Light Snow",
      601: "Snow",
      602: "Heavy Snow",
      611: "Sleet",
      701: "Mist",
      711: "Smoke",
      721: "Haze",
      741: "Fog",
      800: "Clear Sky",
      801: "Few Clouds",
      802: "Scattered Clouds",
      803: "Broken Clouds",
      804: "Overcast Clouds",
      1000: "Sunny",
      1003: "Partly Cloudy",
      1006: "Cloudy",
      1009: "Overcast",
      1030: "Mist",
      1063: "Patchy Rain Possible",
      1066: "Patchy Snow Possible",
      1087: "Thundery Outbreaks Possible",
      1114: "Blowing Snow",
      1117: "Blizzard",
      1135: "Fog",
      1150: "Patchy Light Drizzle",
      1153: "Light Drizzle",
      1183: "Light Rain",
      1189: "Moderate Rain",
      1195: "Heavy Rain",
      1213: "Light Snow",
      1219: "Moderate Snow",
      1225: "Heavy Snow",
      1240: "Light Rain Shower",
      1243: "Moderate or Heavy Rain Shower",
      1273: "Patchy Light Rain with Thunder",
      1276: "Moderate or Heavy Rain with Thunder",
    }

    return descriptions[code] || getGenericWeatherDescription(code)
  }

  const getGenericWeatherDescription = (code: number): string => {
    if (code >= 200 && code < 300) return "Thunderstorm"
    if (code >= 300 && code < 400) return "Drizzle"
    if (code >= 500 && code < 600) return "Rain"
    if (code >= 600 && code < 700) return "Snow"
    if (code >= 700 && code < 800) return "Atmosphere"
    if (code === 800) return "Clear Sky"
    if (code > 800 && code < 900) return "Clouds"
    if (code >= 1000 && code < 1100) return "Clear"
    if (code >= 1100 && code < 1200) return "Cloudy"
    if (code >= 1200 && code < 1300) return "Rain"
    return "Fair Weather"
  }

  const getWindDirection = (degrees: number): string => {
    const directions = [
      "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
      "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
    ]
    const index = Math.round(degrees / 22.5) % 16
    return directions[index]
  }

  const handleCitySubmit = async (cityName: string) => {
    setLoading(true)
    setError("")

    try {
      const data = await fetchWeatherData(cityName)
      setWeatherData(data)
      setCity(cityName)
    } catch (error) {
      console.error("Error fetching weather:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch weather data")
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    if (city) {
      setLoading(true)
      setError("")

      try {
        const data = await fetchWeatherData(city)
        setWeatherData(data)
      } catch (error) {
        console.error("Error refreshing weather:", error)
        setError(error instanceof Error ? error.message : "Failed to refresh weather data")
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#080808] relative overflow-hidden">
      <NoiseBackground />

      <div className="relative z-10 min-h-screen">
        {!weatherData ? (
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
              <CityInput onSubmit={handleCitySubmit} loading={loading} />
              {error && (
                <div className="mt-4 p-4 bg-white/[0.05] border border-white/[0.1] backdrop-blur-sm">
                  <p className="text-white/70 text-center text-xs font-mono">{error}</p>
                  <p className="text-white/35 text-center text-[10px] font-mono mt-1.5">
                    Try a major city like London, New York, or Tokyo
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <WeatherDisplay
            weatherData={weatherData}
            city={city}
            onBack={() => {
              setWeatherData(null)
              setError("")
            }}
            onRefresh={handleRefresh}
            loading={loading}
          />
        )}
      </div>
    </div>
  )
}
