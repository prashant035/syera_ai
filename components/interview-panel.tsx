"use client"

import { TrendingUp, Clock, Hash, Mic, Volume2 } from "lucide-react"
import type { InterviewState } from "@/lib/interview-store"

export function InterviewPanel({
  questionCount,
  answeredCount,
  elapsed,
  domain,
  interviewState,
}: {
  questionCount: number
  answeredCount: number
  elapsed: number
  domain: string
  interviewState: InterviewState
}) {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const stateDisplay: Record<InterviewState, { label: string; color: string; icon: typeof Mic }> = {
    idle: { label: "Ready", color: "text-muted-foreground", icon: Mic },
    speaking: { label: "AI Speaking", color: "text-primary", icon: Volume2 },
    thinking: { label: "Processing", color: "text-accent", icon: TrendingUp },
    listening: { label: "Listening", color: "text-emerald-400", icon: Mic },
  }

  const currentState = stateDisplay[interviewState]
  const StateIcon = currentState.icon

  return (
    <aside className="flex flex-col gap-4 p-4 lg:p-5 overflow-y-auto" aria-label="Interview progress">
      {/* Interview info */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 backdrop-blur-sm p-4">
        <h2 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
          Interview Session
        </h2>
        <p className="text-sm font-medium text-foreground mb-1">{domain}</p>
        <p className="text-[11px] text-muted-foreground">Voice-based AI Mock Interview</p>
      </div>

      {/* Current state indicator */}
      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">
          Current State
        </h3>
        <div className="flex items-center gap-3">
          <div
            className={`h-10 w-10 rounded-xl flex items-center justify-center ${
              interviewState === "idle"
                ? "bg-secondary/50"
                : interviewState === "speaking"
                  ? "bg-primary/15"
                  : interviewState === "thinking"
                    ? "bg-accent/15"
                    : "bg-emerald-400/15"
            }`}
          >
            <StateIcon className={`h-5 w-5 ${currentState.color}`} />
          </div>
          <div>
            <p className={`text-sm font-semibold ${currentState.color}`}>{currentState.label}</p>
            <p className="text-[10px] text-muted-foreground">
              {interviewState === "speaking"
                ? "Syera is asking a question"
                : interviewState === "listening"
                  ? "Your turn to answer"
                  : interviewState === "thinking"
                    ? "Generating next question"
                    : "Waiting to proceed"}
            </p>
          </div>
        </div>
      </div>

      {/* Live stats */}
      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">Live Stats</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Hash className="h-3 w-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">Questions Asked</span>
            </div>
            <p className="text-lg font-bold text-primary font-mono">{questionCount}</p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Mic className="h-3 w-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">Answers Given</span>
            </div>
            <p className="text-lg font-bold text-emerald-400 font-mono">{answeredCount}</p>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">Elapsed Time</span>
            </div>
            <p className="text-lg font-bold text-accent font-mono">{formatTime(elapsed)}</p>
          </div>
        </div>
      </div>

      {/* Voice interview note */}
      <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/5 backdrop-blur-sm p-4">
        <div className="flex items-center gap-2 mb-2">
          <Volume2 className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-semibold text-foreground">Voice Interview</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          This is a verbal interview. Syera will speak each question aloud and then listen for your spoken answer. No typing required.
        </p>
      </div>
    </aside>
  )
}
