"use client"

import { Square, SkipForward, Timer, BarChart3, Mic } from "lucide-react"
import type { InterviewState } from "@/lib/interview-store"

export function ControlButtons({
  onStartInterview,
  audioUnlocked,
  onEndInterview,
  onSkipQuestion,
  onRetryListen,
  timeLeft,
  isEnding,
  questionCount,
  interviewState,
}: {
  onStartInterview: () => void
  audioUnlocked: boolean
  onEndInterview: () => void
  onSkipQuestion: () => void
  onRetryListen: () => void
  timeLeft: string
  isEnding: boolean
  questionCount: number
  interviewState: InterviewState
})
 {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border/50 bg-card/40 backdrop-blur-xl">
      {/* Left - Timer & stats */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/40 border border-border/30">
          <Timer className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-mono text-primary font-medium">{timeLeft}</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/40 border border-border/30">
          <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-mono text-muted-foreground">{questionCount} Qs</span>
        </div>

        {/* State indicator dot */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/40 border border-border/30">
          <div
            className={`h-2 w-2 rounded-full ${
              interviewState === "speaking"
                ? "bg-primary animate-pulse"
                : interviewState === "listening"
                  ? "bg-emerald-400 animate-pulse"
                  : interviewState === "thinking"
                    ? "bg-accent animate-pulse"
                    : "bg-muted-foreground"
            }`}
          />
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide hidden sm:inline">
            {interviewState}
          </span>
        </div>
      </div>

      {/* Center - Actions */}
      <div className="flex items-center gap-2">
      {!audioUnlocked && (
  <button
    type="button"
    onClick={onStartInterview}
    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/80 text-primary-foreground text-xs font-medium hover:bg-primary transition-all duration-300"
  >
    <Mic className="h-3.5 w-3.5" />
    <span className="hidden sm:inline">Start Interview</span>
  </button>
)}
        {/* Retry listen button - useful if speech recognition failed */}
        {interviewState === "idle" && (
          <button
            type="button"
            onClick={onRetryListen}
            disabled={isEnding}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-400/15 border border-emerald-400/30 text-emerald-400 text-xs font-medium hover:bg-emerald-400/25 disabled:opacity-40 transition-all duration-300"
          >
            <Mic className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Retry Mic</span>
          </button>
        )}

        <button
          type="button"
          onClick={onSkipQuestion}
          disabled={isEnding || interviewState === "thinking"}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary/50 border border-border/30 text-muted-foreground text-xs font-medium hover:text-foreground hover:bg-secondary/70 disabled:opacity-40 transition-all duration-300"
        >
          <SkipForward className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Skip Question</span>
        </button>
      </div>

      {/* Right - End Interview */}
      <button
        type="button"
        onClick={onEndInterview}
        disabled={isEnding}
        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-destructive/80 text-destructive-foreground text-xs font-medium hover:bg-destructive disabled:opacity-40 transition-all duration-300 shadow-lg shadow-destructive/20"
      >
        {isEnding ? (
          <span className="flex items-center gap-2">
            <span className="h-3.5 w-3.5 border-2 border-destructive-foreground/30 border-t-destructive-foreground rounded-full animate-spin" />
            Analyzing...
          </span>
        ) : (
          <>
            <Square className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">End Interview</span>
          </>
        )}
      </button>
    </div>
  )
}
