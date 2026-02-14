"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, ArrowRight, Brain, MessageSquare, BarChart3, User } from "lucide-react"
import Link from "next/link"
import { AIOrb } from "@/components/ai-orb"

export default function LoginPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleStart = () => {
    if (!name.trim()) return
    setIsLoading(true)
    // Store the name in sessionStorage for use across pages
    sessionStorage.setItem("syera_user_name", name.trim())
    router.push("/setup")
  }

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/[0.04] rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary/[0.03] rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-accent/[0.02] rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative flex items-center justify-between px-6 py-5 lg:px-12">
        <div className="flex items-center gap-2.5">
          <div className="relative h-9 w-9 rounded-xl bg-primary/20 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
            <div className="absolute inset-0 rounded-xl animate-pulse-glow" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            <span className="text-primary">Syera</span>
            <span className="text-foreground"> AI</span>
          </span>
        </div>
        <Link
          href="/about"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm text-sm text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
        >
          <User className="h-4 w-4" />
          About Developer
        </Link>
      </header>

      {/* Main content */}
      <main className="relative flex-1 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 px-6 lg:px-16 py-12">
        {/* Left side - Hero text */}
        <div className="flex flex-col items-center lg:items-start gap-6 max-w-lg text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-xs font-medium text-primary">
            <Sparkles className="h-3 w-3" />
            AI-Powered Interview Preparation
          </div>

          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-balance">
            <span className="text-foreground">Ace Your Next</span>
            <br />
            <span className="text-primary">Interview</span>
            <span className="text-foreground"> with AI</span>
          </h1>

          <p className="text-muted-foreground leading-relaxed text-base lg:text-lg max-w-md">
            Practice with Syera AI. Get real-time questions, instant feedback, and detailed analytics to improve your interview skills.
          </p>

          {/* Name input + CTA */}
          <div className="w-full max-w-sm flex flex-col gap-3 mt-2">
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleStart()}
                placeholder="Enter your name to begin..."
                className="w-full px-5 py-3.5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <button
              type="button"
              onClick={handleStart}
              disabled={!name.trim() || isLoading}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-primary/25"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Loading...
                </span>
              ) : (
                <>
                  Start Interview Setup
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap items-center gap-3 mt-2">
            {[
              { icon: Brain, label: "AI Questions" },
              { icon: MessageSquare, label: "Voice Interview" },
              { icon: BarChart3, label: "Analytics" },
            ].map((feature) => (
              <div
                key={feature.label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/40 text-xs text-muted-foreground"
              >
                <feature.icon className="h-3 w-3 text-primary" />
                {feature.label}
              </div>
            ))}
          </div>
        </div>

        {/* Right side - AI Orb */}
        <div className="flex flex-col items-center gap-4">
          <AIOrb state="idle" />
          <p className="text-sm text-muted-foreground/70 font-mono">
            Syera AI Interview Assistant
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative px-6 py-4 text-center">
        <p className="text-xs text-muted-foreground/50">
          Powered by Groq AI &middot; Built with Syera AI
        </p>
      </footer>
    </div>
  )
}
