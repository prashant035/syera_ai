"use client"

import { useEffect, useRef } from "react"
import type { InterviewState } from "@/lib/interview-store"

const STATE_COLORS: Record<InterviewState, { r: number; g: number; b: number; h: number }> = {
  idle: { r: 100, g: 116, b: 139, h: 215 },       // slate/dim
  speaking: { r: 6, g: 182, b: 212, h: 187 },      // cyan - AI talking
  thinking: { r: 234, g: 179, b: 8, h: 46 },       // amber - processing
  listening: { r: 52, g: 211, b: 153, h: 160 },     // emerald - mic open
}

export function AIOrb({ state }: { state: InterviewState }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef = useRef<InterviewState>(state)
  stateRef.current = state

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const size = 300
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(dpr, dpr)

    let animationId: number
    let time = 0

    // Create particles for the orb
    const particles: Array<{
      angle: number
      radius: number
      baseSpeed: number
      size: number
      baseOpacity: number
      hueOffset: number
      layer: number
    }> = []

    for (let i = 0; i < 150; i++) {
      const layer = i < 50 ? 0 : i < 100 ? 1 : 2
      particles.push({
        angle: Math.random() * Math.PI * 2,
        radius: 55 + layer * 25 + Math.random() * 20,
        baseSpeed: 0.002 + Math.random() * 0.006,
        size: 0.4 + Math.random() * 2,
        baseOpacity: 0.2 + Math.random() * 0.6,
        hueOffset: Math.random() * 40 - 20,
        layer,
      })
    }

    const animate = () => {
      time += 0.01
      const s = stateRef.current
      const col = STATE_COLORS[s]

      ctx.clearRect(0, 0, size, size)
      const cx = size / 2
      const cy = size / 2

      // === IDLE: very dim, barely moving ===
      // === SPEAKING: fast pulsing glow, rapid ring rotation, particles expand/contract rhythmically ===
      // === THINKING: slow swirl, amber pulsing core ===
      // === LISTENING: gentle breathing glow, particles calm, green tint ===

      const speedMul = s === "speaking" ? 3 : s === "thinking" ? 0.6 : s === "listening" ? 1.2 : 0.3
      const glowIntensity = s === "idle" ? 0.02 : s === "speaking" ? 0.12 + Math.sin(time * 6) * 0.06 : s === "thinking" ? 0.06 + Math.sin(time * 2) * 0.03 : 0.08 + Math.sin(time * 1.5) * 0.03
      const particleBrightness = s === "idle" ? 0.25 : s === "speaking" ? 0.9 : s === "thinking" ? 0.6 : 0.7

      // Outer atmospheric glow
      const outerGlow = ctx.createRadialGradient(cx, cy, 40, cx, cy, 150)
      outerGlow.addColorStop(0, `rgba(${col.r}, ${col.g}, ${col.b}, ${glowIntensity})`)
      outerGlow.addColorStop(0.6, `rgba(${col.r}, ${col.g}, ${col.b}, ${glowIntensity * 0.3})`)
      outerGlow.addColorStop(1, `rgba(${col.r}, ${col.g}, ${col.b}, 0)`)
      ctx.beginPath()
      ctx.arc(cx, cy, 150, 0, Math.PI * 2)
      ctx.fillStyle = outerGlow
      ctx.fill()

      // Rotating ring 1
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(time * speedMul * 0.8)
      const ringGrad = ctx.createLinearGradient(-110, 0, 110, 0)
      const ringAlpha = s === "idle" ? 0.15 : s === "speaking" ? 0.7 + Math.sin(time * 8) * 0.2 : 0.4
      ringGrad.addColorStop(0, `rgba(${col.r}, ${col.g}, ${col.b}, 0)`)
      ringGrad.addColorStop(0.3, `rgba(${col.r}, ${col.g}, ${col.b}, ${ringAlpha})`)
      ringGrad.addColorStop(0.5, `rgba(${col.r}, ${col.g}, ${col.b}, ${ringAlpha * 1.2})`)
      ringGrad.addColorStop(0.7, `rgba(${col.r}, ${col.g}, ${col.b}, ${ringAlpha})`)
      ringGrad.addColorStop(1, `rgba(${col.r}, ${col.g}, ${col.b}, 0)`)
      ctx.beginPath()
      ctx.arc(0, 0, 95, 0, Math.PI * 2)
      ctx.strokeStyle = ringGrad
      ctx.lineWidth = s === "speaking" ? 2.5 : 1.5
      ctx.stroke()
      ctx.restore()

      // Rotating ring 2 (counter)
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(-time * speedMul * 0.5)
      const ring2Alpha = s === "idle" ? 0.08 : 0.25
      const r2 = ctx.createLinearGradient(-100, 0, 100, 0)
      r2.addColorStop(0, `rgba(${col.r}, ${col.g}, ${col.b}, 0)`)
      r2.addColorStop(0.4, `rgba(${col.r}, ${col.g}, ${col.b}, ${ring2Alpha})`)
      r2.addColorStop(0.6, `rgba(${col.r}, ${col.g}, ${col.b}, ${ring2Alpha})`)
      r2.addColorStop(1, `rgba(${col.r}, ${col.g}, ${col.b}, 0)`)
      ctx.beginPath()
      ctx.arc(0, 0, 80, 0, Math.PI * 2)
      ctx.strokeStyle = r2
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.restore()

      // Speaking: add extra pulsing ring
      if (s === "speaking") {
        const pulseRadius = 100 + Math.sin(time * 6) * 12
        const pulseAlpha = 0.3 + Math.sin(time * 8) * 0.15
        ctx.beginPath()
        ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(${col.r}, ${col.g}, ${col.b}, ${pulseAlpha})`
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      // Thinking: add orbiting dots
      if (s === "thinking") {
        for (let i = 0; i < 3; i++) {
          const dotAngle = time * 1.8 + (i * Math.PI * 2) / 3
          const dx = cx + Math.cos(dotAngle) * 70
          const dy = cy + Math.sin(dotAngle) * 70
          ctx.beginPath()
          ctx.arc(dx, dy, 3, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${col.r}, ${col.g}, ${col.b}, 0.7)`
          ctx.fill()
        }
      }

      // Particles
      for (const p of particles) {
        p.angle += p.baseSpeed * speedMul

        let wobble: number
        if (s === "speaking") {
          // Rapid rhythmic expansion
          wobble = Math.sin(time * 6 + p.angle * 3) * 18 + Math.sin(time * 10 + p.layer) * 6
        } else if (s === "thinking") {
          // Slow swirl
          wobble = Math.sin(time * 1.5 + p.angle * 2) * 8
        } else if (s === "listening") {
          // Gentle breathing
          wobble = Math.sin(time * 1.5 + p.angle) * 10
        } else {
          // Idle: barely moves
          wobble = Math.sin(time * 0.5 + p.angle) * 3
        }

        const x = cx + Math.cos(p.angle) * (p.radius + wobble)
        const y = cy + Math.sin(p.angle) * (p.radius + wobble)

        ctx.beginPath()
        ctx.arc(x, y, p.size, 0, Math.PI * 2)
        const hue = col.h + p.hueOffset
        ctx.fillStyle = `hsla(${hue}, 85%, 60%, ${p.baseOpacity * particleBrightness})`
        ctx.fill()
      }

      // Inner core
      const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 45)
      const coreAlpha = s === "idle" ? 0.03 : s === "speaking" ? 0.12 + Math.sin(time * 8) * 0.06 : s === "thinking" ? 0.08 + Math.sin(time * 2) * 0.04 : 0.06 + Math.sin(time * 1.5) * 0.03
      coreGrad.addColorStop(0, `rgba(${col.r}, ${col.g}, ${col.b}, ${coreAlpha * 2})`)
      coreGrad.addColorStop(0.5, `rgba(${col.r}, ${col.g}, ${col.b}, ${coreAlpha})`)
      coreGrad.addColorStop(1, `rgba(${col.r}, ${col.g}, ${col.b}, 0)`)
      ctx.beginPath()
      ctx.arc(cx, cy, 45, 0, Math.PI * 2)
      ctx.fillStyle = coreGrad
      ctx.fill()

      animationId = requestAnimationFrame(animate)
    }

    animate()
    return () => cancelAnimationFrame(animationId)
  }, [])

  // State label + color
  const stateLabel: Record<InterviewState, string> = {
    idle: "",
    speaking: "Syera is speaking...",
    thinking: "Syera is thinking...",
    listening: "Listening to you...",
  }

  const stateColorClass: Record<InterviewState, string> = {
    idle: "text-muted-foreground",
    speaking: "text-primary",
    thinking: "text-accent",
    listening: "text-emerald-400",
  }

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Background glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className={`h-52 w-52 rounded-full blur-3xl transition-all duration-1000 ${
            state === "idle"
              ? "bg-muted-foreground/5"
              : state === "speaking"
                ? "bg-primary/10 animate-pulse-glow"
                : state === "thinking"
                  ? "bg-accent/8"
                  : "bg-emerald-400/8"
          }`}
        />
      </div>

      <canvas
        ref={canvasRef}
        className={`relative ${state === "idle" ? "" : state === "speaking" ? "" : state === "thinking" ? "" : ""}`}
        style={{ width: 300, height: 300 }}
        aria-hidden="true"
      />

      {/* State label */}
      {state !== "idle" && (
        <div className="mt-2 flex flex-col items-center gap-1.5 animate-fade-in-up">
          <p className={`text-sm font-medium ${stateColorClass[state]}`}>
            {stateLabel[state]}
          </p>
          {state === "listening" && (
            <div className="flex items-center gap-0.5" aria-hidden="true">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={`wave-${i}`}
                  className="w-0.5 bg-emerald-400 rounded-full animate-wave"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    height: `${12 + Math.random() * 8}px`,
                  }}
                />
              ))}
            </div>
          )}
          {state === "speaking" && (
            <div className="flex items-center gap-1" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={`speak-${i}`}
                  className="w-1 bg-primary rounded-full animate-wave"
                  style={{
                    animationDelay: `${i * 0.12}s`,
                    height: `${8 + Math.random() * 12}px`,
                  }}
                />
              ))}
            </div>
          )}
          {state === "thinking" && (
            <div className="flex items-center gap-1.5" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <div
                  key={`think-${i}`}
                  className="h-1.5 w-1.5 rounded-full bg-accent animate-wave"
                  style={{ animationDelay: `${i * 0.25}s` }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
