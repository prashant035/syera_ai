import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";


export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json()
    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    const res = await fetch(`${BACKEND_URL}/end`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
      }),
    });

    const data = await res.json();

    // Pass through the result directly from Python backend
    return NextResponse.json(data);
  } catch (error) {
    console.error("PROXY END ERROR:", error);
    return NextResponse.json(
      {
        analysis: {
          technical_score: 70,
          communication_score: 70,
          confidence_score: 70,
          overall_score: 70,
          strengths: ["Interview completed"],
          weaknesses: ["Analysis failed - backend connection error"],
          suggestions: ["Please ensure the Python backend is running"],
        },
        metadata: {
          candidateName: "",
          domain: "",
          totalQuestions: 0,
          duration: 0,
          configuredDuration: 0,
        },
        conversation: [],
      },
      { status: 200 }
    );
  }
}
