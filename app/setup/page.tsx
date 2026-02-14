"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Clock,
  Briefcase,
  User,
  Code,
  Database,
  Globe,
  Brain,
  Server,
  Palette,
  Shield,
  Smartphone,
  BarChart3,
} from "lucide-react"

const domainOptions = [
  { id: "frontend", label: "Frontend Development", icon: Code, description: "React, JavaScript, CSS, HTML" },
  { id: "backend", label: "Backend Development", icon: Server, description: "Node.js, Python, APIs, Databases" },
  { id: "fullstack", label: "Full Stack Development", icon: Globe, description: "End-to-end web development" },
  { id: "data-science", label: "Data Science", icon: BarChart3, description: "ML, Analytics, Python, Statistics" },
  { id: "devops", label: "DevOps / Cloud", icon: Database, description: "AWS, Docker, CI/CD, Kubernetes" },
  { id: "mobile", label: "Mobile Development", icon: Smartphone, description: "React Native, Flutter, iOS, Android" },
  { id: "ai-ml", label: "AI / Machine Learning", icon: Brain, description: "Deep Learning, NLP, Computer Vision" },
  { id: "cybersecurity", label: "Cybersecurity", icon: Shield, description: "Network Security, Ethical Hacking" },
  { id: "ui-ux", label: "UI/UX Design", icon: Palette, description: "Figma, User Research, Prototyping" },
]

const durationOptions = [
  { value: "3", label: "3 Minutes", description: "Quick practice round", questions: "~3-4 questions" },
  { value: "5", label: "5 Minutes", description: "Standard practice session", questions: "~5-6 questions" },
  { value: "10", label: "10 Minutes", description: "Full mock interview", questions: "~8-10 questions" },
]

export default function SetupPage() {
  const router = useRouter()
  const [userName, setUserName] = useState("")
  const [selectedDomain, setSelectedDomain] = useState("")
  const [customDomain, setCustomDomain] = useState("")
  const [selectedDuration, setSelectedDuration] = useState("5")
  const [isStarting, setIsStarting] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem("syera_user_name")
    if (!stored) {
      router.push("/")
      return
    }
    setUserName(stored)
  }, [router])

  const getDomainLabel = () => {
    if (customDomain.trim()) return customDomain.trim()
    const found = domainOptions.find((d) => d.id === selectedDomain)
    return found ? found.label : ""
  }

  const handleStartInterview = async () => {
    const domain = getDomainLabel()
    if (!domain) return

    setIsStarting(true)

    try {
      const res = await fetch("/api/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName,
          domain,
          duration: selectedDuration,
        }),
      })

      const data = await res.json()

      if (data.sessionId) {
        // Store interview config
        sessionStorage.setItem("syera_session_id", data.sessionId)
        sessionStorage.setItem("syera_domain", domain)
        sessionStorage.setItem("syera_duration", selectedDuration)
        sessionStorage.setItem("syera_first_question", data.question)
        router.push("/interview")
      }
    } catch {
      setIsStarting(false)
    }
  }

  const canStart = (selectedDomain || customDomain.trim()) && selectedDuration

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-primary/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-accent/[0.02] rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative flex items-center justify-between px-6 py-5 lg:px-12 border-b border-border/50 backdrop-blur-sm bg-card/30">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="relative h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              <span className="text-primary">Syera</span>
              <span className="text-foreground"> AI</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>{userName}</span>
        </div>
      </header>

      {/* Main */}
      <main className="relative flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-10 lg:py-14">
          {/* Title */}
          <div className="flex flex-col gap-2 mb-10">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground text-balance">
              Setup Your Interview
            </h1>
            <p className="text-muted-foreground text-sm">
              Choose your interview domain and duration. Syera AI will tailor questions specifically for you.
            </p>
          </div>

          {/* Domain selection */}
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                Interview Domain
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {domainOptions.map((domain) => {
                const Icon = domain.icon
                const isSelected = selectedDomain === domain.id
                return (
                  <button
                    key={domain.id}
                    type="button"
                    onClick={() => {
                      setSelectedDomain(domain.id)
                      setCustomDomain("")
                    }}
                    className={`group flex items-start gap-3 p-4 rounded-xl border text-left transition-all duration-300 ${
                      isSelected
                        ? "border-primary/50 bg-primary/10 shadow-lg shadow-primary/10"
                        : "border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:bg-secondary/40"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg transition-colors ${
                        isSelected
                          ? "bg-primary/20 text-primary"
                          : "bg-secondary/60 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isSelected ? "text-primary" : "text-foreground"}`}>
                        {domain.label}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        {domain.description}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Custom domain */}
            <div className="mt-4">
              <p className="text-xs text-muted-foreground mb-2">Or enter a custom role/topic:</p>
              <input
                type="text"
                value={customDomain}
                onChange={(e) => {
                  setCustomDomain(e.target.value)
                  if (e.target.value.trim()) setSelectedDomain("")
                }}
                placeholder="e.g., React Native Developer, Data Engineer, etc."
                className="w-full px-4 py-3 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </section>

          {/* Duration selection */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                Interview Duration
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {durationOptions.map((dur) => {
                const isSelected = selectedDuration === dur.value
                return (
                  <button
                    key={dur.value}
                    type="button"
                    onClick={() => setSelectedDuration(dur.value)}
                    className={`flex flex-col items-center gap-2 p-5 rounded-xl border text-center transition-all duration-300 ${
                      isSelected
                        ? "border-primary/50 bg-primary/10 shadow-lg shadow-primary/10"
                        : "border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:bg-secondary/40"
                    }`}
                  >
                    <Clock className={`h-5 w-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                    <p className={`text-lg font-bold font-mono ${isSelected ? "text-primary" : "text-foreground"}`}>
                      {dur.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{dur.description}</p>
                    <p className="text-[11px] text-muted-foreground/70 font-mono">{dur.questions}</p>
                  </button>
                )
              })}
            </div>
          </section>

          {/* Start button */}
          <div className="flex flex-col items-center gap-4">
            <button
              type="button"
              onClick={handleStartInterview}
              disabled={!canStart || isStarting}
              className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-primary/25"
            >
              {isStarting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Starting Interview...
                </span>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Begin Interview
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
            {canStart && (
              <p className="text-xs text-muted-foreground text-center">
                Starting <span className="text-foreground font-medium">{getDomainLabel()}</span> interview for{" "}
                <span className="text-foreground font-medium">{selectedDuration} minutes</span>
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
