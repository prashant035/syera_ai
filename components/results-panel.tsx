"use client"

import { Star, Lightbulb, MessageSquare, Shield, Zap } from "lucide-react"

export function ResultsPanel({
  questionCount,
  stage,
  domain,
}: {
  questionCount: number
  stage: string
  domain: string
}) {
  return (
    <aside className="flex flex-col gap-4 p-4 lg:p-5 overflow-y-auto" aria-label="Interview tips">
      {/* Stage indicator */}
      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <h2 className="text-xs font-semibold text-primary uppercase tracking-wider">Interview Progress</h2>
        </div>
        <div className="space-y-3">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Domain</span>
            <p className="text-sm font-medium text-foreground">{domain}</p>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Current Stage</span>
            <p className="text-sm font-medium text-accent capitalize">{stage}</p>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Questions So Far</span>
            <p className="text-xl font-bold text-primary font-mono">{questionCount}</p>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-4 w-4 text-accent" />
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">Interview Tips</h3>
        </div>
        <ul className="space-y-2.5">
          {[
            { icon: MessageSquare, tip: "Speak clearly and at a steady pace" },
            { icon: Zap, tip: "Use the STAR method for behavioral questions" },
            { icon: Shield, tip: "It's okay to pause and think before answering" },
            { icon: Star, tip: "Give specific examples from your experience" },
            { icon: MessageSquare, tip: "Keep answers focused (30-60 seconds)" },
          ].map(({ icon: Icon, tip }) => (
            <li key={tip} className="flex items-start gap-2.5">
              <Icon className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-[11px] text-muted-foreground leading-relaxed">{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* How it works */}
      <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-4">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide mb-3">
          How It Works
        </h3>
        <div className="space-y-3">
          {[
            { step: "1", label: "Syera speaks the question", color: "bg-primary/15 text-primary" },
            { step: "2", label: "Microphone opens automatically", color: "bg-emerald-400/15 text-emerald-400" },
            { step: "3", label: "You answer verbally", color: "bg-emerald-400/15 text-emerald-400" },
            { step: "4", label: "AI processes your response", color: "bg-accent/15 text-accent" },
            { step: "5", label: "Next question begins", color: "bg-primary/15 text-primary" },
          ].map(({ step, label, color }) => (
            <div key={step} className="flex items-center gap-3">
              <span className={`flex-shrink-0 h-6 w-6 rounded-full ${color} text-[10px] font-bold flex items-center justify-center`}>
                {step}
              </span>
              <span className="text-[11px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Syera note */}
      <div className="rounded-xl border border-accent/20 bg-accent/5 backdrop-blur-sm p-4">
        <div className="flex items-center gap-2 mb-2">
          <Star className="h-4 w-4 text-accent" />
          <span className="text-xs font-semibold text-foreground">Syera AI</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Your full conversation is being recorded for post-interview analysis. Detailed scores and feedback will be available on the Analytics page.
        </p>
      </div>
    </aside>
  )
}
