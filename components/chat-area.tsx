"use client"

import { AIOrb } from "./ai-orb"
import type { InterviewState } from "@/lib/interview-store"

export function ChatArea({
  currentQuestion,
  questionNumber,
  interviewState,
}: {
  currentQuestion: string
  questionNumber: number
  interviewState: InterviewState
}) {
  return (
    <section
      className="flex flex-col items-center justify-center h-full px-4 lg:px-8 relative"
      aria-label="Interview area"
    >
      {/* AI Orb - center stage */}
      <div className="flex-shrink-0">
        <AIOrb state={interviewState} />
      </div>

      {/* Current question display - only one at a time */}
      <div className="mt-6 lg:mt-8 w-full max-w-2xl">
        {currentQuestion ? (
          <div
            key={`q-${questionNumber}`}
            className="animate-fade-in-up text-center"
          >
            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20 mb-4">
              Question {questionNumber}
            </span>
            <p className="text-lg lg:text-xl text-foreground leading-relaxed font-medium text-balance">
              {currentQuestion}
            </p>
          </div>
        ) : (
          <div className="text-center animate-fade-in-up">
            <p className="text-sm text-muted-foreground">
              Preparing your interview...
            </p>
          </div>
        )}
      </div>

      {/* Voice hint */}
      <div className="mt-8 text-center">
        {interviewState === "listening" && (
          <p className="text-xs text-emerald-400/80 animate-fade-in-up">
            Speak your answer clearly into the microphone
          </p>
        )}
        {interviewState === "idle" && currentQuestion && (
          <p className="text-xs text-muted-foreground/60">
            Syera will listen automatically after speaking
          </p>
        )}
      </div>
    </section>
  )
}
