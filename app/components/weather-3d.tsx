"use client"

import { useRef, useState, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, Float, Text3D } from "@react-three/drei"
import type * as THREE from "three"

interface Weather3DProps {
  weatherCode: string
  temperature: string
}

function WeatherScene({ weatherCode, temperature }: Weather3DProps) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  const getWeatherElements = () => {
    const temp = Number.parseInt(temperature)
    const elements = []

    // Temperature-based color
    const tempColor = temp > 25 ? "#ff6b35" : temp > 15 ? "#f7931e" : temp > 5 ? "#4ecdc4" : "#45b7d1"

    // Weather-specific elements
    if (weatherCode === "113") {
      // Sunny
      elements.push(
        <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5} key="sun">
          <mesh position={[0, 1, 0]}>
            <sphereGeometry args={[0.8, 32, 32]} />
            <meshStandardMaterial color="#ffd700" emissive="#ffaa00" emissiveIntensity={0.3} />
          </mesh>
        </Float>,
      )
    } else if (weatherCode.startsWith("1")) {
      // Cloudy
      elements.push(
        <Float speed={0.8} rotationIntensity={0.3} floatIntensity={0.8} key="cloud1">
          <mesh position={[-1, 1.5, 0]}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial color="#e6e6e6" opacity={0.8} transparent />
          </mesh>
        </Float>,
        <Float speed={0.6} rotationIntensity={0.2} floatIntensity={0.6} key="cloud2">
          <mesh position={[0.5, 1.2, 0.3]}>
            <sphereGeometry args={[0.4, 16, 16]} />
            <meshStandardMaterial color="#f0f0f0" opacity={0.7} transparent />
          </mesh>
        </Float>,
      )
    } else if (weatherCode.startsWith("2") || weatherCode.startsWith("3")) {
      // Rain
      for (let i = 0; i < 20; i++) {
        elements.push(
          <Float speed={2 + Math.random()} rotationIntensity={0} floatIntensity={2} key={`rain-${i}`}>
            <mesh position={[Math.random() * 4 - 2, Math.random() * 3 + 1, Math.random() * 2 - 1]}>
              <cylinderGeometry args={[0.01, 0.01, 0.2]} />
              <meshStandardMaterial color="#4a90e2" opacity={0.6} transparent />
            </mesh>
          </Float>,
        )
      }
    }

    // Temperature sphere
    elements.push(
      <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.3} key="temp-sphere">
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial color={tempColor} emissive={tempColor} emissiveIntensity={0.2} />
        </mesh>
      </Float>,
    )

    return elements
  }

  return (
    <group ref={groupRef}>
      {getWeatherElements()}
      <Text3D font="/fonts/Geist_Bold.json" size={0.3} height={0.05} position={[-0.5, -1.5, 0]}>
        {temperature}°C
        <meshStandardMaterial color="white" />
      </Text3D>
    </group>
  )
}

export function Weather3D({ weatherCode, temperature }: Weather3DProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full h-full rounded-lg overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">{temperature}°C</div>
      </div>
    )
  }

  return (
    <div className="w-full h-full rounded-lg overflow-hidden">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <Environment preset="sunset" />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <WeatherScene weatherCode={weatherCode} temperature={temperature} />
      </Canvas>
    </div>
  )
}
