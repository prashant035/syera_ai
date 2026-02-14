"use client"

import { Sparkles, User, LogOut, Clock } from "lucide-react"
import Link from "next/link"

export function Header({
  userName,
  domain,
  timeLeft,
  showTimer = false,
}: {
  userName?: string
  domain?: string
  timeLeft?: string
  showTimer?: boolean
}) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-border/50 backdrop-blur-xl bg-card/60">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-primary" />
            <div className="absolute inset-0 rounded-lg animate-pulse-glow" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            <span className="text-primary">Syera</span>
            <span className="text-foreground"> AI</span>
          </span>
        </Link>
        {userName && (
          <>
            <div className="hidden md:block h-6 w-px bg-border/50" />
            <div className="hidden md:flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className="text-sm text-muted-foreground">{userName}</span>
            </div>
          </>
        )}
        {domain && (
          <>
            <div className="hidden lg:block h-6 w-px bg-border/50" />
            <span className="hidden lg:inline text-xs px-2.5 py-1 rounded-md bg-primary/10 text-primary font-medium">
              {domain}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        {showTimer && timeLeft && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary/50 border border-border/40">
            <Clock className="h-3.5 w-3.5 text-primary" />
            <span className="text-sm font-mono text-primary font-medium">{timeLeft}</span>
          </div>
        )}
        <Link
          href="/"
          className="flex items-center gap-1.5 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
          aria-label="Exit interview"
        >
          <LogOut className="h-4 w-4" />
        </Link>
      </div>
    </header>
  )
}
