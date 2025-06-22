"use client"

import { useState } from "react"
import { WeatherDisplay } from "./components/weather-display"
import { CityInput } from "./components/city-input"
import { NoiseBackground } from "./components/noise-background"

export default function Home() {
  const [city, setCity] = useState("")
  const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const fetchWeatherData = async (cityName: string) => {
    console.log("Fetching weather data for:", cityName)

    // Try WeatherAPI.com first (has free tier with good data)
    try {
      const weatherApiResponse = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=demo&q=${encodeURIComponent(cityName)}&aqi=yes`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        },
      )

      if (weatherApiResponse.ok) {
        const data = await weatherApiResponse.json()
        console.log("WeatherAPI.com data:", data)
        return convertWeatherApiData(data, cityName)
      }
    } catch (error) {
      console.warn("WeatherAPI.com failed:", error)
    }

    // Try OpenWeatherMap with a working approach
    try {
      // First get coordinates
      const geoResponse = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=demo`,
      )

      if (geoResponse.ok) {
        const geoData = await geoResponse.json()
        if (geoData.length > 0) {
          const { lat, lon } = geoData[0]

          // Then get weather data
          const weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=demo`,
          )

          if (weatherResponse.ok) {
            const data = await weatherResponse.json()
            console.log("OpenWeatherMap data:", data)
            return convertOpenWeatherData(data, cityName)
          }
        }
      }
    } catch (error) {
      console.warn("OpenWeatherMap failed:", error)
    }

    // Try Open-Meteo (free, no API key required, very reliable)
    try {
      // First get coordinates from Open-Meteo geocoding
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=en&format=json`,
      )

      if (geoResponse.ok) {
        const geoData = await geoResponse.json()
        if (geoData.results && geoData.results.length > 0) {
          const { latitude, longitude, name, country } = geoData.results[0]

          // Get current weather from Open-Meteo
          const weatherResponse = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,rain,showers,snowfall,snow_depth,weather_code,pressure_msl,surface_pressure,cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,visibility,evapotranspiration,et0_fao_evapotranspiration,vapour_pressure_deficit,wind_speed_10m,wind_speed_80m,wind_speed_120m,wind_speed_180m,wind_direction_10m,wind_direction_80m,wind_direction_120m,wind_direction_180m,wind_gusts_10m,temperature_80m,temperature_120m,temperature_180m,soil_temperature_0cm,soil_temperature_6cm,soil_temperature_18cm,soil_temperature_54cm,soil_moisture_0_1cm,soil_moisture_1_3cm,soil_moisture_3_9cm,soil_moisture_9_27cm,soil_moisture_27_81cm&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,daylight_duration,sunshine_duration,uv_index_max,uv_index_clear_sky_max,precipitation_sum,rain_sum,showers_sum,snowfall_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,shortwave_radiation_sum,et0_fao_evapotranspiration&timezone=auto`,
          )

          if (weatherResponse.ok) {
            const data = await weatherResponse.json()
            console.log("Open-Meteo data:", data)
            return convertOpenMeteoData(data, `${name}, ${country}`)
          }
        }
      }
    } catch (error) {
      console.warn("Open-Meteo failed:", error)
    }

    throw new Error("All weather services are currently unavailable. Please try again later.")
  }

  const convertWeatherApiData = (data: any, cityName: string) => {
    const current = data.current
    const location = data.location

    // Calculate sunrise/sunset times (WeatherAPI doesn't provide this in current endpoint)
    const now = new Date()
    const sunrise = new Date(now)
    sunrise.setHours(6, 0, 0, 0) // Approximate sunrise
    const sunset = new Date(now)
    sunset.setHours(18, 0, 0, 0) // Approximate sunset

    return {
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
          uvIndex: current.uv.toString(),
        },
      ],
      isDay: current.is_day === 1,
      weather: [
        {
          date: new Date().toISOString().split("T")[0],
          maxtempC: Math.round(current.temp_c + 3).toString(),
          mintempC: Math.round(current.temp_c - 5).toString(),
          sunrise: sunrise.toISOString(),
          sunset: sunset.toISOString(),
          hourly: [
            {
              weatherCode: current.condition.code.toString(),
              weatherDesc: [{ value: current.condition.text || "Clear" }],
            },
          ],
        },
      ],
    }
  }

  const convertOpenWeatherData = (data: any, cityName: string) => {
    const weatherDesc = data.weather[0]?.description || data.weather[0]?.main || "Clear"

    // Calculate sunrise/sunset from OpenWeatherMap data
    const sunrise = data.sys?.sunrise ? new Date(data.sys.sunrise * 1000) : new Date()
    const sunset = data.sys?.sunset ? new Date(data.sys.sunset * 1000) : new Date()

    // Determine if it's day or night
    const now = new Date()
    const isDay = now >= sunrise && now <= sunset

    return {
      current_condition: [
        {
          temp_C: Math.round(data.main.temp).toString(),
          FeelsLikeC: Math.round(data.main.feels_like).toString(),
          humidity: data.main.humidity.toString(),
          pressure: data.main.pressure.toString(),
          visibility: Math.round((data.visibility || 10000) / 1000).toString(),
          windspeedKmph: Math.round((data.wind?.speed || 0) * 3.6).toString(),
          winddirDegree: (data.wind?.deg || 0).toString(),
          winddir16Point: getWindDirection(data.wind?.deg || 0),
          weatherCode: data.weather[0]?.id?.toString() || "800",
          weatherDesc: [{ value: capitalizeWords(weatherDesc) }],
          cloudcover: (data.clouds?.all || 0).toString(),
          uvIndex: "N/A",
        },
      ],
      isDay: isDay,
      weather: [
        {
          date: new Date().toISOString().split("T")[0],
          maxtempC: Math.round(data.main.temp_max).toString(),
          mintempC: Math.round(data.main.temp_min).toString(),
          sunrise: sunrise.toISOString(),
          sunset: sunset.toISOString(),
          hourly: [
            {
              weatherCode: data.weather[0]?.id?.toString() || "800",
              weatherDesc: [{ value: capitalizeWords(weatherDesc) }],
            },
          ],
        },
      ],
    }
  }

  const convertOpenMeteoData = (data: any, cityName: string) => {
    const current = data.current
    const daily = data.daily

    return {
      current_condition: [
        {
          temp_C: Math.round(current.temperature_2m).toString(),
          FeelsLikeC: Math.round(current.apparent_temperature).toString(),
          humidity: current.relative_humidity_2m.toString(),
          pressure: Math.round(current.pressure_msl).toString(),
          visibility: "10", // Open-Meteo doesn't provide visibility in current
          windspeedKmph: Math.round(current.wind_speed_10m).toString(),
          winddirDegree: Math.round(current.wind_direction_10m).toString(),
          winddir16Point: getWindDirection(current.wind_direction_10m),
          weatherCode: current.weather_code.toString(),
          weatherDesc: [{ value: getWeatherDescription(current.weather_code) }],
          cloudcover: current.cloud_cover.toString(),
          uvIndex: daily.uv_index_max[0]?.toString() || "N/A",
        },
      ],
      isDay: current.is_day === 1,
      weather: daily.time.slice(0, 3).map((date: string, index: number) => ({
        date,
        maxtempC: Math.round(daily.temperature_2m_max[index]).toString(),
        mintempC: Math.round(daily.temperature_2m_min[index]).toString(),
        sunrise: daily.sunrise[index],
        sunset: daily.sunset[index],
        hourly: [
          {
            weatherCode: daily.weather_code[index].toString(),
            weatherDesc: [{ value: getWeatherDescription(daily.weather_code[index]) }],
          },
        ],
      })),
    }
  }

  // Enhanced weather description mapping
  const getWeatherDescription = (code: number): string => {
    const descriptions: { [key: number]: string } = {
      // Open-Meteo WMO Weather interpretation codes
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

      // OpenWeatherMap codes
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
      310: "Light Intensity Drizzle Rain",
      311: "Drizzle Rain",
      312: "Heavy Intensity Drizzle Rain",
      313: "Shower Rain and Drizzle",
      314: "Heavy Shower Rain and Drizzle",
      321: "Shower Drizzle",
      500: "Light Rain",
      501: "Moderate Rain",
      502: "Heavy Intensity Rain",
      503: "Very Heavy Rain",
      504: "Extreme Rain",
      511: "Freezing Rain",
      520: "Light Intensity Shower Rain",
      521: "Shower Rain",
      522: "Heavy Intensity Shower Rain",
      531: "Ragged Shower Rain",
      600: "Light Snow",
      601: "Snow",
      602: "Heavy Snow",
      611: "Sleet",
      612: "Light Shower Sleet",
      613: "Shower Sleet",
      615: "Light Rain and Snow",
      616: "Rain and Snow",
      620: "Light Shower Snow",
      621: "Shower Snow",
      622: "Heavy Shower Snow",
      701: "Mist",
      711: "Smoke",
      721: "Haze",
      731: "Sand/Dust Whirls",
      741: "Fog",
      751: "Sand",
      761: "Dust",
      762: "Volcanic Ash",
      771: "Squalls",
      781: "Tornado",
      800: "Clear Sky",
      801: "Few Clouds",
      802: "Scattered Clouds",
      803: "Broken Clouds",
      804: "Overcast Clouds",

      // WeatherAPI codes (common ones)
      1000: "Sunny",
      1003: "Partly Cloudy",
      1006: "Cloudy",
      1009: "Overcast",
      1030: "Mist",
      1063: "Patchy Rain Possible",
      1066: "Patchy Snow Possible",
      1069: "Patchy Sleet Possible",
      1072: "Patchy Freezing Drizzle Possible",
      1087: "Thundery Outbreaks Possible",
      1114: "Blowing Snow",
      1117: "Blizzard",
      1135: "Fog",
      1147: "Freezing Fog",
      1150: "Patchy Light Drizzle",
      1153: "Light Drizzle",
      1168: "Freezing Drizzle",
      1171: "Heavy Freezing Drizzle",
      1180: "Patchy Light Rain",
      1183: "Light Rain",
      1186: "Moderate Rain at Times",
      1189: "Moderate Rain",
      1192: "Heavy Rain at Times",
      1195: "Heavy Rain",
      1198: "Light Freezing Rain",
      1201: "Moderate or Heavy Freezing Rain",
      1204: "Light Sleet",
      1207: "Moderate or Heavy Sleet",
      1210: "Patchy Light Snow",
      1213: "Light Snow",
      1216: "Patchy Moderate Snow",
      1219: "Moderate Snow",
      1222: "Patchy Heavy Snow",
      1225: "Heavy Snow",
      1237: "Ice Pellets",
      1240: "Light Rain Shower",
      1243: "Moderate or Heavy Rain Shower",
      1246: "Torrential Rain Shower",
      1249: "Light Sleet Showers",
      1252: "Moderate or Heavy Sleet Showers",
      1255: "Light Snow Showers",
      1258: "Moderate or Heavy Snow Showers",
      1261: "Light Showers of Ice Pellets",
      1264: "Moderate or Heavy Showers of Ice Pellets",
      1273: "Patchy Light Rain with Thunder",
      1276: "Moderate or Heavy Rain with Thunder",
      1279: "Patchy Light Snow with Thunder",
      1282: "Moderate or Heavy Snow with Thunder",
    }

    return descriptions[code] || getGenericWeatherDescription(code)
  }

  // Fallback for unknown codes
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
    return "Fair Weather" // Ultimate fallback
  }

  // Capitalize words properly
  const capitalizeWords = (str: string): string => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
  }

  const getWindDirection = (degrees: number): string => {
    const directions = [
      "N",
      "NNE",
      "NE",
      "ENE",
      "E",
      "ESE",
      "SE",
      "SSE",
      "S",
      "SSW",
      "SW",
      "WSW",
      "W",
      "WNW",
      "NW",
      "NNW",
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
    <div className="min-h-screen bg-black relative overflow-hidden">
      <NoiseBackground />

      <div className="relative z-10 min-h-screen">
        {!weatherData ? (
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
              <CityInput onSubmit={handleCitySubmit} loading={loading} />
              {error && (
                <div className="mt-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl backdrop-blur-sm">
                  <p className="text-red-300 text-center font-medium">{error}</p>
                  <p className="text-red-400 text-center text-sm mt-2">
                    Try searching for a major city name (e.g., "London", "New York", "Tokyo")
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
