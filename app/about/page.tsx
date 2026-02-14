"use client"

import { useRouter } from "next/navigation"
import {
  Sparkles,
  ArrowLeft,
  Mail,
  GraduationCap,
  BookOpen,
  Code2,
  User,
} from "lucide-react"

export default function AboutPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary/[0.04] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/[0.03] rounded-full blur-3xl" />
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
          <div className="hidden md:block h-6 w-px bg-border/50" />
          <span className="hidden md:inline text-sm text-muted-foreground">
            About Developer
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="relative flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-12 lg:py-16">
          {/* Avatar / Name section */}
          <div className="flex flex-col items-center gap-5 mb-10">
            <div className="h-24 w-24 rounded-full bg-primary/15 border-2 border-primary/30 flex items-center justify-center">
              <User className="h-12 w-12 text-primary" />
            </div>
            <div className="text-center">
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground text-balance">
                Prashant Pandey
              </h1>
              <p className="text-muted-foreground text-sm mt-2">
                Developer of Syera AI Mock Interview Platform
              </p>
            </div>
          </div>

          {/* Info cards */}
          <div className="flex flex-col gap-4">
            {/* Education */}
            <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Education
                </h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Master of Computer Application (MCA)
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Postgraduate Degree
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      PhD in Computer Science
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Currently Pursuing
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Contact
                </h2>
              </div>
              <a
                href="mailto:akashishpandeyy@gmail.com"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary/50 border border-border/40 text-sm text-foreground hover:bg-secondary/70 transition-colors"
              >
                <Mail className="h-4 w-4 text-primary" />
                akashishpandeyy@gmail.com
              </a>
            </div>

            {/* About the project */}
            <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <Code2 className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  About the Project
                </h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Syera AI is an AI-powered mock interview platform that conducts
                voice-based technical interviews. It uses Groq AI (LLaMA 3.1)
                for generating context-aware interview questions and providing
                detailed performance analytics including technical, communication,
                and confidence scores.
              </p>
            </div>

            {/* Tech stack */}
            <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Tech Stack
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  "Next.js",
                  "React",
                  "TypeScript",
                  "Tailwind CSS",
                  "Groq AI",
                  "LLaMA 3.1",
                  "Web Speech API",
                  "FastAPI (Python)",
                ].map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-xs font-medium text-primary"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Back button */}
          <div className="flex justify-center mt-10">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/25"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
