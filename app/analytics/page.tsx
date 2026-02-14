"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Sparkles,
  ArrowLeft,
  TrendingUp,
  MessageSquare,
  Shield,
  Target,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  RotateCcw,
  Download,
  Clock,
  Hash,
  User,
  Briefcase,
} from "lucide-react"
import type { InterviewResult } from "@/lib/interview-store"

function ScoreRing({ score, label, color }: { score: number; label: string; color: string }) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-24 w-24">
        <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="hsl(var(--secondary))"
            strokeWidth="6"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold font-mono text-foreground">{score}</span>
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground text-center">{label}</span>
    </div>
  )
}

function ScoreBar({ label, score, icon: Icon }: { label: string; score: number; icon: React.ComponentType<{ className?: string }> }) {
  const getColor = (s: number) => {
    if (s >= 80) return "from-emerald-400 to-cyan-400"
    if (s >= 60) return "from-primary to-cyan-300"
    if (s >= 40) return "from-accent to-amber-400"
    return "from-destructive to-orange-400"
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        <span className="text-sm font-bold font-mono text-foreground">{score}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-secondary/80 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getColor(score)} transition-all duration-1000 ease-out`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [results, setResults] = useState<InterviewResult | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem("syera_results")
    if (!stored) {
      router.push("/")
      return
    }

    try {
      const parsed = JSON.parse(stored)
      setResults(parsed)
      // Small delay for animation
      setTimeout(() => setIsLoaded(true), 100)
    } catch {
      router.push("/")
    }
  }, [router])

  if (!results) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading results...</p>
        </div>
      </div>
    )
  }

  const { analysis, metadata, conversation } = results
  const overallGrade =
    analysis.overall_score >= 85
      ? "A"
      : analysis.overall_score >= 70
        ? "B"
        : analysis.overall_score >= 55
          ? "C"
          : "D"

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}m ${s}s`
  }

  const handleRetry = () => {
    sessionStorage.removeItem("syera_results")
    sessionStorage.removeItem("syera_session_id")
    sessionStorage.removeItem("syera_first_question")
    router.push("/setup")
  }

  const handleDownload = () => {
    const text = [
      `SYERA AI - INTERVIEW ANALYSIS REPORT`,
      `${"=".repeat(40)}`,
      ``,
      `Candidate: ${metadata.candidateName}`,
      `Domain: ${metadata.domain}`,
      `Duration: ${formatDuration(metadata.duration)}`,
      `Questions: ${metadata.totalQuestions}`,
      ``,
      `SCORES`,
      `------`,
      `Technical: ${analysis.technical_score}%`,
      `Communication: ${analysis.communication_score}%`,
      `Confidence: ${analysis.confidence_score}%`,
      `Overall: ${analysis.overall_score}%`,
      ``,
      `STRENGTHS`,
      `----------`,
      ...analysis.strengths.map((s) => `- ${s}`),
      ``,
      `WEAKNESSES`,
      `----------`,
      ...analysis.weaknesses.map((w) => `- ${w}`),
      ``,
      `SUGGESTIONS`,
      `-----------`,
      ...analysis.suggestions.map((s) => `- ${s}`),
      ``,
      `CONVERSATION TRANSCRIPT`,
      `${"=".repeat(40)}`,
      ...conversation.map(
        (m) => `${m.role === "assistant" ? "Interviewer" : "Candidate"}: ${m.content}`
      ),
    ].join("\n")

    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `syera-ai-report-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary/[0.03] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/[0.02] rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative flex items-center justify-between px-6 py-5 lg:px-12 border-b border-border/50 backdrop-blur-sm bg-card/30">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            aria-label="Go home"
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
          <div className="hidden md:block h-6 w-px bg-border/50" />
          <span className="hidden md:inline text-sm text-muted-foreground">Interview Analytics</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-secondary/50 border border-border/40 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Download Report</span>
          </button>
          <button
            type="button"
            onClick={handleRetry}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Interview</span>
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="relative flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-10 lg:py-14">
          {/* Top summary */}
          <div
            className={`mb-10 transition-all duration-700 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2 text-balance">
              Interview Complete
            </h1>
            <p className="text-muted-foreground text-sm">
              Here is your detailed analysis from Syera AI.
            </p>
          </div>

          {/* Metadata cards */}
          <div
            className={`grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8 transition-all duration-700 delay-100 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            {[
              { icon: User, label: "Candidate", value: metadata.candidateName },
              { icon: Briefcase, label: "Domain", value: metadata.domain },
              { icon: Clock, label: "Duration", value: formatDuration(metadata.duration) },
              { icon: Hash, label: "Questions", value: String(metadata.totalQuestions) },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm"
              >
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <item.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{item.label}</p>
                  <p className="text-sm font-medium text-foreground truncate">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Score rings */}
          <div
            className={`rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 lg:p-8 mb-8 transition-all duration-700 delay-200 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">Performance Scores</h2>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10">
                <span className="text-xs text-muted-foreground">Overall Grade:</span>
                <span className="text-lg font-bold text-primary font-mono">{overallGrade}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-8 lg:gap-12">
              <ScoreRing
                score={analysis.technical_score}
                label="Technical"
                color="hsl(var(--primary))"
              />
              <ScoreRing
                score={analysis.communication_score}
                label="Communication"
                color="hsl(var(--chart-2))"
              />
              <ScoreRing
                score={analysis.confidence_score}
                label="Confidence"
                color="hsl(var(--accent))"
              />
              <ScoreRing
                score={analysis.overall_score}
                label="Overall"
                color="hsl(var(--chart-1))"
              />
            </div>
          </div>

          {/* Score bars */}
          <div
            className={`rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 lg:p-8 mb-8 transition-all duration-700 delay-300 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-6">Detailed Breakdown</h2>
            <div className="space-y-5">
              <ScoreBar label="Technical Knowledge" score={analysis.technical_score} icon={Target} />
              <ScoreBar label="Communication" score={analysis.communication_score} icon={MessageSquare} />
              <ScoreBar label="Confidence" score={analysis.confidence_score} icon={Shield} />
              <ScoreBar label="Overall Performance" score={analysis.overall_score} icon={TrendingUp} />
            </div>
          </div>

          {/* Strengths, Weaknesses, Suggestions */}
          <div
            className={`grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8 transition-all duration-700 delay-[400ms] ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            {/* Strengths */}
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <h3 className="text-sm font-semibold text-foreground">Strengths</h3>
              </div>
              <ul className="space-y-2.5">
                {analysis.strengths.map((s) => (
                  <li key={s} className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground leading-relaxed">{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="rounded-2xl border border-destructive/20 bg-destructive/5 backdrop-blur-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <h3 className="text-sm font-semibold text-foreground">Areas to Improve</h3>
              </div>
              <ul className="space-y-2.5">
                {analysis.weaknesses.map((w) => (
                  <li key={w} className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-destructive mt-1.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground leading-relaxed">{w}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggestions */}
            <div className="rounded-2xl border border-accent/20 bg-accent/5 backdrop-blur-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="h-5 w-5 text-accent" />
                <h3 className="text-sm font-semibold text-foreground">Suggestions</h3>
              </div>
              <ul className="space-y-2.5">
                {analysis.suggestions.map((s) => (
                  <li key={s} className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground leading-relaxed">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Conversation transcript */}
          <div
            className={`rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 lg:p-8 mb-8 transition-all duration-700 delay-500 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-6">
              Conversation Transcript
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {conversation.map((msg, idx) => (
                <div
                  key={`transcript-${idx}`}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary/15 text-foreground border border-primary/20"
                        : "bg-secondary/60 text-secondary-foreground border border-border/30"
                    }`}
                  >
                    <span className={`block text-[10px] font-semibold mb-1 ${msg.role === "user" ? "text-primary" : "text-accent"}`}>
                      {msg.role === "assistant" ? "Syera AI" : metadata.candidateName}
                    </span>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div
            className={`flex flex-col items-center gap-4 py-6 transition-all duration-700 delay-[600ms] ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <button
              type="button"
              onClick={handleRetry}
              className="flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/25"
            >
              <RotateCcw className="h-4 w-4" />
              Practice Again
            </button>
            <p className="text-xs text-muted-foreground">
              Practice makes perfect. Try another interview to improve your scores.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
