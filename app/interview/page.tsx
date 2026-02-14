    "use client"

    import { useState, useEffect, useCallback, useRef } from "react"
    import { useRouter } from "next/navigation"
    import { Header } from "@/components/header"
    import { InterviewPanel } from "@/components/interview-panel"
    import { ChatArea } from "@/components/chat-area"
    import { ControlButtons } from "@/components/control-buttons"
    import { ResultsPanel } from "@/components/results-panel"
    import type { InterviewState } from "@/lib/interview-store"

    const NO_RESPONSE_TIMEOUT_MS = 15 * 1000 // 15 seconds - enough time for user to think and respond
    const MAX_NO_RESPONSE_RETRIES = 2

    const SOUND_ISSUE_MESSAGES = [

      // First retry
      [
        "It seems there might be some sound or microphone issue on your end. No worries, let me repeat the question.",
        "I couldn’t hear your response clearly. Please check your microphone and try again.",
        "Looks like your audio didn’t come through. I will ask the question once more.",
        "I didn’t receive your response. Please make sure your microphone is working and try again."
      ],

      // Second retry
      [
        "I’m still unable to hear your response. There might be a connectivity or audio issue. Let me repeat the question once again.",
        "I couldn’t catch your answer again. Please check your audio settings and try once more.",
        "It seems the audio problem is still there. I’ll repeat the question again.",
        "I’m having trouble hearing you. Please ensure your microphone is enabled before answering."
      ],

      // Final message
      [
        "Unfortunately, I was not able to hear your response after multiple attempts. It looks like there is a persistent audio issue. We will end the interview here and move to the results.",
        "Since I couldn’t receive your response after several tries, we will conclude the interview and move to the results.",
        "It seems there is an ongoing audio issue, so we will stop the interview for now and continue with the evaluation.",
        "As I’m unable to hear your response after multiple attempts, we will end the interview here and proceed to the results."
      ]
      
    ]
    function getRandomSoundMessage(level: number) {
      const messages = SOUND_ISSUE_MESSAGES[level]
      return messages[Math.floor(Math.random() * messages.length)]
    }



    // Backend URL - change this to your FastAPI server address
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

  

    export default function InterviewPage() {
      const router = useRouter()
      const [sessionId, setSessionId] = useState("")
      const [userName, setUserName] = useState("")
      const [domain, setDomain] = useState("")
      const [duration, setDuration] = useState(300)
      const [elapsed, setElapsed] = useState(0)
      const [questionCount, setQuestionCount] = useState(0)
      const [answeredCount, setAnsweredCount] = useState(0)
      const [stage, setStage] = useState("technical")
      const [currentQuestion, setCurrentQuestion] = useState("")
      const [userTranscript, setUserTranscript] = useState("") // Real-time display of what user is saying
      const [interviewState, setInterviewState] = useState<InterviewState>("idle")
      const [isEnding, setIsEnding] = useState(false)
      const [audioUnlocked, setAudioUnlocked] = useState(false)

      const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
      const recognitionRef = useRef<SpeechRecognition | null>(null)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const audioRef = useRef<any>(null)
      const isSpeakingRef = useRef(false)
      const isEndingRef = useRef(false)
      const hasInitRef = useRef(false)
      const isRecognitionRunningRef = useRef(false)
      const isProcessingAnswerRef = useRef(false) // Lock to prevent overlapping speak calls
      const ttsAbortControllerRef = useRef<AbortController | null>(null) // To cancel in-flight TTS requests
      const speechDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null) // Debounce speech before sending
      const accumulatedTranscriptRef = useRef("") // Accumulate full user speech

      // No-response retry tracking
      const noResponseRetryRef = useRef(0)
      const noResponseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
      const lastQuestionRef = useRef("")
      const lastRepeatQuestionRef = useRef("")  // New: store repeat version
      const gotResultRef = useRef(false)

      // Refs for latest callback versions (breaks stale closure chains)
      const handleNoResponseRef = useRef<() => void>(() => {})
      const speakAndDisplayRef = useRef<(text: string) => Promise<void>>(async () => {})
      const handleEndInterviewRef = useRef<() => Promise<void>>(async () => {})
      const sendAnswerRef = useRef<(text: string) => Promise<void>>(async () => {})

      // Initialize from session storage
      useEffect(() => {
        if (hasInitRef.current) return
        hasInitRef.current = true

        const storedName = sessionStorage.getItem("syera_user_name")
        const storedSessionId = sessionStorage.getItem("syera_session_id")
        const storedDomain = sessionStorage.getItem("syera_domain")
        const storedDuration = sessionStorage.getItem("syera_duration")
        const firstQuestion = sessionStorage.getItem("syera_first_question")
        const firstRepeatQuestion = sessionStorage.getItem("syera_first_repeat_question")  // New

        if (!storedSessionId || !storedName) {
          router.push("/")
          return
        }

        setUserName(storedName)
        setSessionId(storedSessionId)
        setDomain(storedDomain || "")
        setDuration(
          storedDuration === "3" ? 180 : storedDuration === "10" ? 600 : 300
        )

        if (firstQuestion) {
          setQuestionCount(1)
          lastQuestionRef.current = firstQuestion
          lastRepeatQuestionRef.current = firstRepeatQuestion || firstQuestion  // New
          // DON'T set currentQuestion here - let speakAndDisplay handle it
          // so the question appears at the same time as the AI starts speaking
        }
      }, [router])

      // Timer
      useEffect(() => {
        if (!sessionId) return
        timerRef.current = setInterval(() => {
          setElapsed((prev) => prev + 1)
        }, 1000)
        return () => {
          if (timerRef.current) clearInterval(timerRef.current)
        }
      }, [sessionId])

      const formatTime = (secs: number) => {
        const remaining = Math.max(0, duration - secs)
        const m = Math.floor(remaining / 60)
        const s = remaining % 60
        return `${m}:${s.toString().padStart(2, "0")}`
      }

      // ============================================================
      // SPEECH RECOGNITION - start/stop helpers
      // ============================================================
      const stopRecognition = useCallback(() => {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop()
          } catch {}
          isRecognitionRunningRef.current = false
        }
      }, [])

      const startRecognition = useCallback(() => {
        if (isEndingRef.current || isRecognitionRunningRef.current) return
        if (!recognitionRef.current) return

        try {
          recognitionRef.current.start()
          console.log("[v0] Recognition started")
        } catch (e) {
          console.log("[v0] Recognition start failed:", e)
          // If already running, that's fine
        }
      }, [])

      // ============================================================
      // TTS - Browser SpeechSynthesis fallback when backend /voice fails
      // ============================================================
      const fallbackSpeak = useCallback((text: string): Promise<void> => {
        return new Promise((resolve) => {
          const utterance = new SpeechSynthesisUtterance(text)
          utterance.lang = "en-US"
          utterance.rate = 1.0
          utterance.onend = () => resolve()
          utterance.onerror = () => resolve()
          window.speechSynthesis.speak(utterance)
        })
      }, [])

      // ============================================================
      // TTS - speak text via backend /voice endpoint with fallback
      // ============================================================
      const playTTS = useCallback(async (text: string): Promise<void> => {
        // Cancel any previous browser TTS first
        window.speechSynthesis.cancel()

        // Abort any in-flight TTS fetch request
        if (ttsAbortControllerRef.current) {
          ttsAbortControllerRef.current.abort()
          ttsAbortControllerRef.current = null
        }

        // Cancel any previous audio playback
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current.currentTime = 0
          audioRef.current.onended = null
          audioRef.current.onerror = null
          audioRef.current = null
        }

        const abortController = new AbortController()
        ttsAbortControllerRef.current = abortController

        try {
          const response = await fetch(`${BACKEND_URL}/voice`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text }),
            signal: abortController.signal,
          })

          if (!response.ok) throw new Error(`Voice API returned ${response.status}`)

          const contentType = response.headers.get("content-type") || ""
          if (contentType.includes("application/json")) {
            // Backend returned an error JSON, not audio
            const errData = await response.json()
            throw new Error(errData.error || "Voice API returned JSON error")
          }

          const blob = await response.blob()

          // Validate we got actual audio data
          if (blob.size < 100) {
            throw new Error("Voice API returned empty/tiny audio response")
          }

          // Play the audio and wait for it to finish
          await new Promise<void>((resolve, reject) => {
            const url = URL.createObjectURL(blob)
            const audio = new Audio()
            audioRef.current = audio

            audio.onended = () => {
              audioRef.current = null
              URL.revokeObjectURL(url)
              resolve()
            }
            audio.onerror = () => {
              audioRef.current = null
              URL.revokeObjectURL(url)
              reject(new Error("Audio playback failed"))
            }

            // Set src AFTER attaching event handlers
            audio.src = url
            audio.play().catch(reject)
          })
        } catch (error) {
          console.error("[v0] TTS failed, using browser fallback:", error)
          // Clean up any lingering audio element
          if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.onended = null
            audioRef.current.onerror = null
            audioRef.current = null
          }
          await fallbackSpeak(text)
        }
      }, [fallbackSpeak])

      // ============================================================
      const speakAndDisplay = useCallback(
        async (text: string) => {
          if (isEndingRef.current) return
      
          // Clear the previous question immediately to prevent lingering during transitions
          setCurrentQuestion("")
      
          // 1. Set speaking flag FIRST (before stopRecognition, so onend won't restart)
          isSpeakingRef.current = true
          setInterviewState("speaking")
      
          // 1. Stop recognition and cancel any pending answer debounce
          stopRecognition()
          if (noResponseTimerRef.current) clearTimeout(noResponseTimerRef.current)
          if (speechDebounceTimerRef.current) clearTimeout(speechDebounceTimerRef.current)
          accumulatedTranscriptRef.current = ""
          setUserTranscript("")
      
          // 2. Cancel any ongoing browser TTS
          window.speechSynthesis.cancel()
      
          // 3. Start speaking the question
          const ttsPromise = playTTS(text)
      
          // 4. Delay displaying the question on screen for a more natural flow (while AI is speaking)
          setTimeout(() => {
            setCurrentQuestion(text)
          }, 3000)  // Adjust delay (in ms) as needed, e.g., 300-1000ms
      
          // 5. Wait for TTS to finish
          await ttsPromise
      
          // 5. AI is done speaking - now listen
          isSpeakingRef.current = false
    
          if (isEndingRef.current) return

          // 6. Transition to listening
          setInterviewState("listening")
          gotResultRef.current = false

          // 7. Small delay to ensure recognition system is ready
          await new Promise((r) => setTimeout(r, 300))

          // 8. Start recognition to capture user's answer
          startRecognition()

          // 9. Start no-response timer
          if (noResponseTimerRef.current) clearTimeout(noResponseTimerRef.current)
          noResponseTimerRef.current = setTimeout(() => {
            if (!isEndingRef.current && !gotResultRef.current) {
              handleNoResponseRef.current()
            }
          }, NO_RESPONSE_TIMEOUT_MS)
        },
        [stopRecognition, startRecognition, playTTS]
      )

      // Keep ref updated
      useEffect(() => {
        speakAndDisplayRef.current = speakAndDisplay
      }, [speakAndDisplay])

      // ============================================================
      // NO-RESPONSE HANDLER (retry up to 3 times, then end)
      // ============================================================
      const handleNoResponse = useCallback(() => {
        if (isEndingRef.current) return

        const retryCount = noResponseRetryRef.current

        if (retryCount >= MAX_NO_RESPONSE_RETRIES) {
          // After 3 failed attempts, end interview
          const finalMsg = getRandomSoundMessage(2)
          isSpeakingRef.current = true
          stopRecognition()
          window.speechSynthesis.cancel()
          if (ttsAbortControllerRef.current) { ttsAbortControllerRef.current.abort(); ttsAbortControllerRef.current = null }
          if (audioRef.current) { audioRef.current.pause(); audioRef.current.onended = null; audioRef.current = null }
          setInterviewState("speaking")
          playTTS(finalMsg).then(() => {
            isSpeakingRef.current = false
            handleEndInterviewRef.current()
          })
          return
        }

        // Speak the retry message, then re-ask same question
        const soundMsg = getRandomSoundMessage(
          Math.min(retryCount, SOUND_ISSUE_MESSAGES.length - 1)
        )    
        noResponseRetryRef.current = retryCount + 1

        isSpeakingRef.current = true
        stopRecognition()
        window.speechSynthesis.cancel()
        if (ttsAbortControllerRef.current) { ttsAbortControllerRef.current.abort(); ttsAbortControllerRef.current = null }
        if (audioRef.current) { audioRef.current.pause(); audioRef.current.onended = null; audioRef.current = null }
        setInterviewState("speaking")
        playTTS(soundMsg).then(async () => {
          if (isEndingRef.current) return
        
          // Update the displayed question to show the repeat version
          // so it matches what the AI is about to speak
          const repeatQ = lastRepeatQuestionRef.current || lastQuestionRef.current
          setCurrentQuestion(repeatQ)

          // Speak only the repeat question (DO NOT restart full flow)
          isSpeakingRef.current = true
          await playTTS(repeatQ)
          isSpeakingRef.current = false
        
          // Resume listening
          setInterviewState("listening")
          gotResultRef.current = false

          // Small delay before starting recognition
          await new Promise((r) => setTimeout(r, 200))
          startRecognition()
        
          if (noResponseTimerRef.current)
            clearTimeout(noResponseTimerRef.current)
        
          noResponseTimerRef.current = setTimeout(() => {
            if (!isEndingRef.current && !gotResultRef.current) {
              handleNoResponseRef.current()
            }
          }, NO_RESPONSE_TIMEOUT_MS)
        })
        
      }, [stopRecognition, startRecognition, playTTS])

      // Keep ref updated
      useEffect(() => {
        handleNoResponseRef.current = handleNoResponse
      }, [handleNoResponse])

      // ============================================================
      // SEND ANSWER to backend -> get next question -> speak it
      // ============================================================
      const sendAnswer = useCallback(
        async (text: string) => {
          if (!sessionId || isEndingRef.current) return
          if (isProcessingAnswerRef.current) return // Prevent overlapping answer processing

          isProcessingAnswerRef.current = true

          // IMMEDIATELY set speaking flag to block recognition.onend from restarting
          isSpeakingRef.current = true

          // Stop listening while processing
          stopRecognition()
          if (noResponseTimerRef.current) clearTimeout(noResponseTimerRef.current)
          if (speechDebounceTimerRef.current) clearTimeout(speechDebounceTimerRef.current)
          accumulatedTranscriptRef.current = ""
          setUserTranscript("")

          // Cancel any currently playing audio so we don't get overlapping voices
          window.speechSynthesis.cancel()
          if (ttsAbortControllerRef.current) {
            ttsAbortControllerRef.current.abort()
            ttsAbortControllerRef.current = null
          }
          if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.currentTime = 0
            audioRef.current.onended = null
            audioRef.current.onerror = null
            audioRef.current = null
          }

          setInterviewState("thinking")
          setAnsweredCount((prev) => prev + 1)

          try {
            const res = await fetch("/api/answer", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sessionId, text }),
            })

            const data = await res.json()

            if (data.question && !isEndingRef.current) {
              setQuestionCount((prev) => data.questionCount || prev + 1)
              if (data.stage) setStage(data.stage)
              noResponseRetryRef.current = 0

              // Store both full and repeat
              lastQuestionRef.current = data.question
              lastRepeatQuestionRef.current = data.repeat_question || data.question  // New

              // Check if backend says to end after speaking this message
              if (data.action === "end_interview") {
                // Speak the final message (goodbye/abuse termination), then end
                isSpeakingRef.current = true
                setInterviewState("speaking")
                setCurrentQuestion(data.question)
                lastQuestionRef.current = data.question
                lastRepeatQuestionRef.current = data.repeat_question || data.question  // New
                await playTTS(data.question)
                isSpeakingRef.current = false
                // Now end the interview
                await handleEndInterviewRef.current()
              } else if (data.stage === "candidate_questions") {
                // AI is asking candidate if they have questions
                // Speak the closing message, then listen for candidate's question
                await speakAndDisplayRef.current(data.question)
              } else {
                // Normal flow - speak next question, then listen
                await speakAndDisplayRef.current(data.question)
              }
            } else if (!isEndingRef.current) {
              // No question returned - interview may be ending
            }
          } catch (error) {
            console.error("[v0] Error in sendAnswer:", error)
            isSpeakingRef.current = false
            if (!isEndingRef.current) {
              await speakAndDisplayRef.current(
                "Sorry, there was a connection issue. Let me ask you another question."
              )
            }
          } finally {
            isProcessingAnswerRef.current = false
          }
        },
        [sessionId, stopRecognition, playTTS]
      )

      // Keep ref updated
      useEffect(() => {
        sendAnswerRef.current = sendAnswer
      }, [sendAnswer])

      // ============================================================
      // END INTERVIEW
      // ============================================================
      const handleEndInterview = useCallback(async () => {
        if (!sessionId || isEndingRef.current) return
        isEndingRef.current = true
        setIsEnding(true)
        setInterviewState("idle")

        // Stop everything
        stopRecognition()
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current.currentTime = 0
        }
        window.speechSynthesis.cancel()
        if (timerRef.current) clearInterval(timerRef.current)
        if (noResponseTimerRef.current) clearTimeout(noResponseTimerRef.current)

        try {
          const res = await fetch("/api/end", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          })
          const data = await res.json()
          sessionStorage.setItem("syera_results", JSON.stringify(data))
          router.push("/analytics")
        } catch {
          isEndingRef.current = false
          setIsEnding(false)
        }
      }, [sessionId, router, stopRecognition])

      // Keep ref updated
      useEffect(() => {
        handleEndInterviewRef.current = handleEndInterview
      }, [handleEndInterview])

      // ============================================================
      // SETUP: Create SpeechRecognition instance once
      // ============================================================
      const setupRecognition = useCallback(() => {
        const SpeechRecognitionAPI =
          (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition

        if (!SpeechRecognitionAPI) {
          console.error("[v0] Speech recognition not supported")
          return
        }

        const recognition = new SpeechRecognitionAPI()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.maxAlternatives = 1
        recognition.lang = "en-US"

        recognition.onstart = () => {
          isRecognitionRunningRef.current = true
          console.log("[v0] Recognition listening...")
        }

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          // CRITICAL: Ignore results while AI is speaking or processing
          if (isSpeakingRef.current || isProcessingAnswerRef.current) {
            return
          }

          // Build the full transcript from all results
          let finalTranscript = ""
          let interimTranscript = ""
          for (let i = 0; i < event.results.length; i++) {
            const result = event.results[i]
            if (result.isFinal) {
              finalTranscript += result[0].transcript
            } else {
              interimTranscript += result[0].transcript
            }
          }

          const fullText = (finalTranscript + interimTranscript).trim()
          if (!fullText) return

          gotResultRef.current = true
          accumulatedTranscriptRef.current = fullText

          // Clear no-response timer since user is actively speaking
          if (noResponseTimerRef.current) clearTimeout(noResponseTimerRef.current)

          // Show what the user is saying in real time (update the displayed user speech)
          setUserTranscript(fullText)

          // Debounce: wait 1.5s of silence after the user stops speaking, then send
          if (speechDebounceTimerRef.current) clearTimeout(speechDebounceTimerRef.current)
          speechDebounceTimerRef.current = setTimeout(() => {
            const answer = accumulatedTranscriptRef.current.trim()
            if (answer && !isSpeakingRef.current && !isProcessingAnswerRef.current) {
              accumulatedTranscriptRef.current = ""
              noResponseRetryRef.current = 0
              setUserTranscript("")
              sendAnswerRef.current(answer)
            }
          }, 1500) // 1.5 second pause = user finished speaking
        }

        recognition.onerror = (event: any) => {
          console.log("[v0] Recognition error:", event.error)
          isRecognitionRunningRef.current = false
          // For "no-speech", just restart if we're in listening state
          if (event.error === "no-speech" || event.error === "aborted") {
            return // onend will handle restart
          }
        }

        recognition.onend = () => {
          isRecognitionRunningRef.current = false

          // ONLY auto-restart when ALL conditions are met:
          // - Not ending the interview
          // - AI is NOT speaking (no audio playing, no TTS happening)
          // - Not currently processing an answer (prevents overlap)
          // - We are genuinely in a listening state
          if (
            !isEndingRef.current &&
            !isSpeakingRef.current &&
            !isProcessingAnswerRef.current &&
            !isRecognitionRunningRef.current
          ) {
            // Longer delay to avoid rapid restart loops
            setTimeout(() => {
              if (
                !isEndingRef.current &&
                !isSpeakingRef.current &&
                !isProcessingAnswerRef.current &&
                !isRecognitionRunningRef.current
              ) {
                try {
                  recognition.start()
                } catch (e) {
                  // Silently fail - speakAndDisplay will restart when needed
                }
              }
            }, 500)
          }
        }

        recognitionRef.current = recognition
      }, [])

      // ============================================================
      // START INTERVIEW (user clicks "Start" button)
      // ============================================================
      const handleStartInterview = async () => {
        try {
          await navigator.mediaDevices.getUserMedia({ audio: true })
          console.log("[v0] Microphone permission granted")
        } catch (error) {
          console.error("[v0] Microphone permission denied:", error)
          return
        }

        // Unlock audio context for autoplay policies
        const utterance = new SpeechSynthesisUtterance(" ")
        window.speechSynthesis.speak(utterance)
        setAudioUnlocked(true)

        // Setup recognition instance (but don't start it yet - speakAndDisplay will)
        setupRecognition()
      }

      // Skip question
      const handleSkipQuestion = useCallback(() => {
        if (noResponseTimerRef.current) clearTimeout(noResponseTimerRef.current)
        if (speechDebounceTimerRef.current) clearTimeout(speechDebounceTimerRef.current)
        accumulatedTranscriptRef.current = ""
        stopRecognition()
        isSpeakingRef.current = false
        noResponseRetryRef.current = 0
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current.currentTime = 0
        }
        window.speechSynthesis.cancel()
        sendAnswerRef.current("I would like to skip this question.")
      }, [stopRecognition])

      // Retry listen button
      const handleRetryListen = useCallback(() => {
        if (isEndingRef.current) return
        gotResultRef.current = false
        setInterviewState("listening")
        startRecognition()
        // Restart no-response timer
        if (noResponseTimerRef.current) clearTimeout(noResponseTimerRef.current)
        noResponseTimerRef.current = setTimeout(() => {
          if (!isEndingRef.current && !gotResultRef.current) {
            handleNoResponseRef.current()
          }
        }, NO_RESPONSE_TIMEOUT_MS)
      }, [startRecognition])

      // Graceful time management:
      // Do NOT hard-cut when time runs out. The backend handles the transition
      // to closing/candidate_questions/goodbye phases. The timer here only acts
      // as an extreme fallback (2 minutes past duration) in case something
      // gets stuck. The backend's /answer endpoint handles the graceful flow.
      useEffect(() => {
        const overtime = elapsed - duration
        // Only force-end if we're 2+ minutes past duration (safety net)
        if (overtime >= 120 && !isEndingRef.current && sessionId) {
          handleEndInterview()
        }
      }, [elapsed, duration, sessionId, handleEndInterview])

      // Start first question when audio is unlocked - use ref to prevent re-triggering
      const hasSpokenFirstQuestionRef = useRef(false)
      useEffect(() => {
        if (audioUnlocked && lastQuestionRef.current && !hasSpokenFirstQuestionRef.current) {
          hasSpokenFirstQuestionRef.current = true
          speakAndDisplayRef.current(lastQuestionRef.current)
        }
      }, [audioUnlocked])

      // Cleanup on unmount
      useEffect(() => {
        return () => {
          if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.currentTime = 0
          }
          if (ttsAbortControllerRef.current) {
            ttsAbortControllerRef.current.abort()
          }
          window.speechSynthesis.cancel()
          if (recognitionRef.current) {
            try {
              recognitionRef.current.stop()
            } catch {}
          }
          if (timerRef.current) clearInterval(timerRef.current)
          if (noResponseTimerRef.current) clearTimeout(noResponseTimerRef.current)
          if (speechDebounceTimerRef.current) clearTimeout(speechDebounceTimerRef.current)
        }
      }, [])

      const timeLeft = formatTime(elapsed)

      return (
        <div className="flex flex-col h-screen overflow-hidden bg-background">
          {/* Ambient background */}
          <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/[0.03] rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-primary/[0.02] rounded-full blur-3xl" />
          </div>

          <Header
            userName={userName}
            domain={domain}
            timeLeft={timeLeft}
            showTimer
          />

          <main className="flex-1 flex flex-col lg:flex-row min-h-0 relative">
            {/* Left panel */}
            <div className="hidden lg:block w-72 xl:w-80 border-r border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
              <InterviewPanel
                questionCount={questionCount}
                answeredCount={answeredCount}
                elapsed={elapsed}
                domain={domain}
                interviewState={interviewState}
              />
            </div>

            {/* Center - single question display with AI orb */}
            <div className="flex-1 flex flex-col min-h-0 min-w-0">
              <ChatArea
                currentQuestion={currentQuestion}
                questionNumber={questionCount}
                interviewState={interviewState}
              />
            </div>

            {/* Right panel */}
            <div className="hidden lg:block w-72 xl:w-80 border-l border-border/50 bg-card/30 backdrop-blur-sm overflow-hidden">
              <ResultsPanel
                questionCount={questionCount}
                stage={stage}
                domain={domain}
              />
            </div>
          </main>

          <ControlButtons
            onStartInterview={handleStartInterview}
            audioUnlocked={audioUnlocked}
            onEndInterview={handleEndInterview}
            onSkipQuestion={handleSkipQuestion}
            onRetryListen={handleRetryListen}
            timeLeft={timeLeft}
            isEnding={isEnding}
            questionCount={questionCount}
            interviewState={interviewState}
          />
        </div>
      )
    }
