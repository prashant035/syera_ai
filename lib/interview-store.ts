// Client-side interview state management using a simple pub/sub store
// This is used to share state between interview components

export type InterviewState = "idle" | "speaking" | "listening" | "thinking";

export type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: number;
};

export type InterviewConfig = {
  name: string;
  domain: string;
  duration: string; // "3", "5", "10"
};

export type AnalysisResult = {
  technical_score: number;
  communication_score: number;
  confidence_score: number;
  overall_score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
};

export type InterviewResult = {
  analysis: AnalysisResult;
  metadata: {
    candidateName: string;
    domain: string;
    totalQuestions: number;
    duration: number;
    configuredDuration: number;
  };
  conversation: { role: "assistant" | "user"; content: string }[];
};

// Helper to generate unique message IDs
export function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
